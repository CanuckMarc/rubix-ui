import { memo, useState } from "react";
import { NodeProps as FlowNodeProps, useEdges, useNodes } from "react-flow-renderer/nocss";

import { SPLIT_KEY, useChangeNodeData } from "../hooks/useChangeNodeData";
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
    if (node.settings.inputCount !== nodeInputs.length) {
      let newData: any = [];
      for (let i = 1; i <= node.settings.inputCount; i++) {
        const item = {
          pin: `in${i}`,
          dataType: nodeInputs[0]?.dataType,
          value: nodeInputs[0]?.defaultValue,
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
      const nodeInputsObj: any = {}
      
      nodeInputs.forEach((item: any) => nodeInputsObj[item.pin] = item)
      newInputs = [...specInputs];
      newInputs.sort(
        (a:any,b:any) => (nodeInputsObj[a.name].position - nodeInputsObj[b.name].position)
      )
    }
  }
  const nodeInputsObj: any = {};
  nodeInputs.forEach((item: any) => nodeInputsObj[item.pin] = item)
  /* Add new inputs when set InputCount setting */
  nodeInputs.forEach((item: any) => {
    const isExist = specInputs.find((input) => input.name === item.pin);
    if (!isExist) {
      newInputs.push({
        name: item.pin,
        valueOfChild: item.valueOfChild,
        nodeId: item.nodeId,
        subName: item.subName,
        valueType: item.dataType,
        defaultValue: item.value,
      } as InputSocketSpecJSON);
    }
    newInputs.sort(
      (a:any,b:any) => (nodeInputsObj[a.name].position - nodeInputsObj[b.name].position)
    )
  });

  return newInputs;
};

const getOutputs = (specOutputs: OutputSocketSpecJSON[], nodeOutputs: any, node: NodeInterface) => {
  if (specOutputs.length === 0 && !node.isParent) return [];
  if (specOutputs.length > 0 && !nodeOutputs && !node.isParent) return specOutputs;

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
        valueOfChild: item.valueOfChild || item.value,
        nodeId: item.nodeId,
        valueType: item.dataType,
      } as OutputSocketSpecJSON);
    }
  });

  if (node.isParent) {
    const out = node.data.out || [];
    const outs = out.map((item: any) => {
      const dataOut = specOutputs.find((specItem: { name: string }) => item.pin === specItem.name);
      return {
        valueOfChild: item.value,
        ...dataOut,
        ...item,
      };
    });

    newOutputs.push(...outs);
  }

  return newOutputs;
};

export const isInputFlow = (type: string) => {
  const newType = type.split("/")?.[1];
  return ["input-float", "input-string", "input-bool"].includes(newType);
};

export const isOutputFlow = (type: string) => {
  const newType = type.split("/")?.[1];
  return ["output-float", "output-string", "output-bool"].includes(newType);
};

export const Node = memo((props: NodeProps) => {
  const { id, data, spec, selected, parentNodeId, nodesSpec } = props;
  const nodes = useNodes();
  const edges = useEdges();
  const handleChange = useChangeNodeData(id);
  const [widthInput, setWidthInput] = useState(-1);
  const [widthOutput, setWidthOutput] = useState(-1);
  const [isSettingModal, setIsSettingModal] = useState(false);
  const newData = { ...data };

  const node: NodeInterface | any = nodes.find((item) => item.id === id);
  const isHidden = parentNodeId ? node.parentId !== parentNodeId : node.parentId;

  const childNodes: NodeInterface[] = node.isParent
    ? nodes.filter((item: NodeInterface) => item.parentId === node.id)
    : [];

  const nodeInputs = node.isParent
    ? childNodes
        .filter((n: NodeInterface) => isInputFlow(n.type!!))
        .map(({ data, id: nodeId, info }, index, arr) => {
          const firstInput: any = data.inputs?.[0] || {};

          return {
            ...firstInput,
            valueType: firstInput.dataType,
            valueOfChild: firstInput.value,
            pin: `${firstInput.pin}${SPLIT_KEY}${nodeId}`,
            nodeId,
            name: firstInput.pin,
            subName: `${firstInput.pin || "in"}${arr.length > 1 ? index + 1 : ""} ${
              info?.nodeName ? `(${info.nodeName})` : ""
            }`,
          };
        })
    : node.data.inputs;

  const nodeOutputs = node.isParent
    ? childNodes
        .filter((n: NodeInterface) => isOutputFlow(n.type!!))
        .map(({ data, id: nodeId, info }, index, arr) => {
          const firstOut = data.out?.[0] || {};

          return {
            ...firstOut,
            valueOfChild: firstOut.value,
            pin: `${firstOut.pin}${SPLIT_KEY}${nodeId}`,
            nodeId,
            name: firstOut.pin,
            subName: `${firstOut.pin || "out"}${arr.length > 1 ? index + 1 : ""} ${
              info?.nodeName ? `(${info.nodeName})` : ""
            }`,
          };
        })
    : node.data.out;

  if (node.isParent) {
    newData.inputs = [...(nodeInputs || []), ...(data.inputs || [])];
    newData.out = [...(nodeOutputs || []), ...(data.out || [])];
  }

  const pairs = getPairs(
    getInputs(spec.inputs || [], nodeInputs, node),
    getOutputs(spec.outputs || [], nodeOutputs, node)
  );

  const handleSetWidthInput = (width: number) => {
    setWidthInput((prev: number) => Math.max(prev, width));
  };

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
      isHidden={isHidden}
      title={getTitle(spec.type)}
      icon={spec?.info?.icon || ""}
      nodeName={node?.info?.nodeName || ""}
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
                value={input.valueOfChild || newData[input.name]}
                onChange={handleChange}
                connected={isHandleConnected(edges, input.nodeId || id, input.name, "target")}
                minWidth={widthInput}
                onSetWidthInput={handleSetWidthInput}
                dataInput={newData.inputs}
                dataOutput={getConnectionOutput(input.name)}
              />
            )}
            {output && (
              <OutputSocket
                {...output}
                valueType={output.valueType || output.dataType!!}
                minWidth={widthOutput}
                dataOut={newData.out}
                onSetWidthInput={handleSetWidthOutput}
                connected={isHandleConnected(
                  edges,
                  // if have node id that mean id of child node in sub flow and present for output of parent node
                  output.nodeId || id,
                  output.nodeId ? "in" : output.name,
                  output.nodeId ? "target" : "source"
                )}
              />
            )}
          </div>
        );
      })}
      <SettingsModal node={node} isModalVisible={isSettingModal} onCloseModal={handleCloseModalSetting} />
    </NodeContainer>
  );
});
