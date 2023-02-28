import { NodeProps as FlowNodeProps, useEdges, useNodes } from "reactflow";
import { memo, useCallback, useEffect, useState } from "react";

import { useChangeNodeData } from "../hooks/useChangeNodeData";
import { isHandleConnected } from "../util/isHandleConnected";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { InputSocketSpecJSON, NodeSpecJSON, OutputSocketSpecJSON } from "../lib";
import { NodeContainer } from "./NodeContainer";
import { InputSocket } from "./InputSocket";
import { OutputSocket } from "./OutputSocket";
import { SettingsModal } from "./SettingsModal";
import { DEFAULT_NODE_SPEC_JSON } from "./NodeMenu";

type NodeProps = FlowNodeProps & {
  spec: NodeSpecJSON;
  isConnectionBuilder: boolean;
  parentNodeId?: string;
  nodesSpec: boolean | NodeSpecJSON[] | React.Dispatch<React.SetStateAction<NodeSpecJSON[]>>;
};

const getTitle = (type: string) => {
  const end = type.substring(type.lastIndexOf("/") + 1);
  const spaces = end.replace(/([A-Z])/g, " $1");
  return spaces.toUpperCase();
};

const getPairs = <T, U>(arr1: T[], arr2: U[]) => {
  const max = Math.max(arr1.length, arr2.length);
  const pairs = [];
  for (let i = 0; i < max; i++) {
    const pair: [T | undefined, U | undefined] = [arr1[i], arr2[i]];
    pairs.push(pair);
  }
  return pairs;
};

const getInputs = (specInputs: InputSocketSpecJSON[], nodeInputs: InputSocketSpecJSON[], node: NodeInterface) => {
  if (specInputs.length === 0 && !node.isParent) return [];
  if (specInputs.length > 0 && !nodeInputs && !node.isParent) return specInputs;

  let newInputs: InputSocketSpecJSON[] = [];

  if (!node.isParent) {
    /* Is check InputCount setting equals node inputs length? */
    if (node.settings.inputCount && node.settings.inputCount !== nodeInputs.length) {
      let newData: any = [];
      for (let i = 1; i <= node.settings.inputCount; i++) {
        const item = {
          pin: `in${i}`,
          dataType: nodeInputs[0]?.dataType,
          value: nodeInputs[0]?.value,
        };
        if (newData) {
          newData.push(item);
        } else {
          newData = [item];
        }
      }
      nodeInputs = newData;
    }

    if (nodeInputs.length > 0 && nodeInputs.length < specInputs.length) {
      newInputs = specInputs.filter((item, idx) => idx < nodeInputs.length);
    } else {
      const nodeInputsObj: any = {};
      
      nodeInputs.forEach((item: any) => (nodeInputsObj[item.pin!!] = item));
      newInputs = [...specInputs];
      newInputs.sort((a: InputSocketSpecJSON, b: InputSocketSpecJSON) => nodeInputsObj[a.name]?.position - nodeInputsObj[b.name]?.position);
      newInputs = newInputs.filter((item) => nodeInputsObj[item.name]?.hiddenInput === false);
    }
  }
  const nodeInputsObj: any = {};
  nodeInputs.forEach((item: any) => (nodeInputsObj[item.pin] = item));
  /* Add new inputs when set InputCount setting */
  nodeInputs.forEach((item: any) => {
    const isExist = specInputs.find((input) => input.name === item.pin);
    if (!isExist) {
      newInputs.push({
        name: item.pin,
        subName: item.subName,
        valueType: item.dataType,
        defaultValue: item.value,
      } as InputSocketSpecJSON);
    }
    newInputs.sort((a: InputSocketSpecJSON, b: InputSocketSpecJSON) => nodeInputsObj[a.name]?.position - nodeInputsObj[b.name]?.position);
    newInputs = newInputs.filter((item) => nodeInputsObj[item.name].hiddenInput === false)
  });

  return newInputs;
};

const getOutputs = (specOutputs: OutputSocketSpecJSON[], nodeOutputs: any, node: NodeInterface) => {
  if (specOutputs.length === 0 && !node.isParent) {
    return [];
  }

  if (specOutputs.length > 0 && !nodeOutputs && !node.isParent) {
    return specOutputs;
  }

  let newOutputs: OutputSocketSpecJSON[] = [];

  if (!node.isParent) {
    if (nodeOutputs.length > 0 && nodeOutputs.length < specOutputs.length) {
      newOutputs = specOutputs.filter((item, idx) => idx < nodeOutputs.length);
    } else {
      newOutputs = [...specOutputs];
    }
  }

  nodeOutputs.forEach((item: any) => {
    const isExist = specOutputs.find((input) => input.name === item.pin);
    if (!isExist) {
      newOutputs.push({
        name: item.pin,
        subName: item.subName,
        valueType: item.dataType,
      } as OutputSocketSpecJSON);
    } else {
      const isExistInNewOutput = newOutputs.some((output) => output.name === item.pin);
      if (!isExistInNewOutput) {
        newOutputs.push({
          name: item.pin,
          valueType: item.dataType,
        });
      }
    }
  });

  return newOutputs;
};

export const isInputFlow = (type: string) => {
  return ["sub-flow/input-float", "sub-flow/input-string", "sub-flow/input-boolean"].includes(type);
};

export const isOutputFlow = (type: string) => {
  return ["sub-flow/output-float", "sub-flow/output-string", "sub-flow/output-boolean"].includes(type);
};

export const Node = memo((props: NodeProps) => {
  const { id, data, spec, selected, nodesSpec } = props;
  const nodes = useNodes();
  const edges = useEdges();
  const handleChange = useChangeNodeData(id);
  const [widthInput, setWidthInput] = useState(-1);
  const [widthOutput, setWidthOutput] = useState(-1);
  const [isSettingModal, setIsSettingModal] = useState(false);
  const [node, setNode] = useState<NodeInterface | undefined>(undefined);
  const [pairs, setPairs] = useState<any[]>([]);

  useEffect(() => {
    const item = nodes.find((n: NodeInterface) => n.id === id);
    if (item) {
      const newPairs = getPairs(
        getInputs(spec.inputs || [], data.inputs || [], item),
        getOutputs(spec.outputs || [], data.out || [], item)
      );
      setPairs(newPairs);
    }
    setNode(nodes.find((item: NodeInterface) => item.id === id));
  }, [nodes]);

  const handleSetWidthInput = useCallback(
    (width: number) => {
      setWidthInput((prev: number) => Math.max(prev, width));
    },
    [setWidthInput]
  );

  if (!node) {
    return null;
  }

  const handleSetWidthOutput = (width: number) => {
    setWidthOutput((prev: number) => Math.max(prev, width));
  };

  const handleDbClickTitle = () => {
    const nodeType = (nodesSpec as NodeSpecJSON[]).find((item) => item.type === node.type) || DEFAULT_NODE_SPEC_JSON;
    const isAllowSetting = nodeType?.allowSettings || false;

    if (isAllowSetting) setIsSettingModal(true);
  };

  const handleCloseModalSetting = () => {
    setIsSettingModal(false);
  };

  const getConnectionOutput = (targetHandle: string) => {
    const edge = edges.find((item) => item.target === id && item.targetHandle === targetHandle);
    if (!edge) return null;

    /* Find the output of the edge connected */
    let output = null;
    const node: NodeInterface | null = nodes.find((item) => item.id === edge.source) || null;
    if (node?.data?.out) {
      output = node.data.out.find((item: any) => item.pin === edge.sourceHandle) || null;
    }

    return output;
  };

  return (
    <NodeContainer
      title={getTitle(spec.type)}
      icon={spec?.info?.icon || ""}
      nodeName={node?.info?.nodeName?.replace("{parent.name}", "") || ""}
      category={spec.category}
      selected={selected}
      height={node?.height ?? 30}
      hasChild={node?.style?.height ? true : false}
      status={node.status}
      onDbClickTitle={handleDbClickTitle}
    >
      {pairs.map(([input, output], ix) => {
        if (
          input &&
          !data[input.name] &&
          data[input.name] !== null &&
          ((input.valueType === "number" && data[input.name] !== 0) ||
            (input.valueType === "boolean" && data[input.name] === undefined))
        ) {
          data[input.name] = input.defaultValue;
        }

        const borderB = ix === pairs.length - 1 && node.style?.height ? "border-b pb-3 border-gray-500" : "";

        return (
          <div key={ix} className={`flex flex-row justify-between gap-8 relative px-4 my-2 ${borderB}`}>
            {input && (
              <InputSocket
                {...input}
                value={data[input.name]}
                onChange={handleChange}
                connected={isHandleConnected(edges, id, input.name, "target")}
                minWidth={widthInput}
                onSetWidthInput={handleSetWidthInput}
                dataInput={data.inputs}
                dataOutput={getConnectionOutput(input.name)}
              />
            )}
            {output && (
              <OutputSocket
                {...output}
                valueType={output.valueType || output.dataType!!}
                minWidth={widthOutput}
                dataOut={data.out}
                onSetWidthInput={handleSetWidthOutput}
                connected={isHandleConnected(edges, id, output.name, "source")}
              />
            )}
          </div>
        );
      })}
      <SettingsModal node={node} isModalVisible={isSettingModal} onCloseModal={handleCloseModalSetting} />
    </NodeContainer>
  );
});
