import { useState } from "react";
import {
  NodeProps as FlowNodeProps,
  useEdges,
  useNodes,
} from "react-flow-renderer/nocss";

import { useChangeNodeData } from "../hooks/useChangeNodeData";
import { isHandleConnected } from "../util/isHandleConnected";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import {
  InputSocketSpecJSON,
  NodeSpecJSON,
  OutputSocketSpecJSON,
} from "../lib";
import { NodeContainer } from "./NodeContainer";
import { InputSocket } from "./InputSocket";
import { OutputSocket } from "./OutputSocket";
import { SettingsModal } from "./SettingsModal";
import { useNodesSpec } from "../use-nodes-spec";
import { DEFAULT_NODE_SPEC_JSON } from "./NodeMenu";

type NodeProps = FlowNodeProps & {
  spec: NodeSpecJSON;
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

const getInputs = (
  specInputs: InputSocketSpecJSON[],
  nodeInputs: any,
  node: NodeInterface
) => {
  if (specInputs.length === 0) return [];
  if (specInputs.length > 0 && !nodeInputs) return specInputs;

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

  let newInputs: InputSocketSpecJSON[] = [];
  if (nodeInputs.length > 0 && nodeInputs.length < specInputs.length) {
    newInputs = specInputs.filter((item, idx) => idx < nodeInputs.length);
  } else {
    newInputs = [...specInputs];
  }

  /* Add new inputs when set InputCount setting */
  nodeInputs.forEach((item: any) => {
    const isExist = specInputs.find((input) => input.name === item.pin);
    if (!isExist) {
      newInputs.push({
        name: item.pin,
        valueType: item.dataType,
        defaultValue: item.value,
      } as InputSocketSpecJSON);
    }
  });

  return newInputs;
};

const getOutputs = (specOutputs: OutputSocketSpecJSON[], nodeOutputs: any) => {
  if (specOutputs.length === 0) return [];
  if (specOutputs.length > 0 && !nodeOutputs) return specOutputs;

  let newOutputs: OutputSocketSpecJSON[] = [];
  if (nodeOutputs.length > 0 && nodeOutputs.length < specOutputs.length) {
    newOutputs = specOutputs.filter((item, idx) => idx < nodeOutputs.length);
  } else {
    newOutputs = [...specOutputs];
  }

  nodeOutputs.forEach((item: any) => {
    const isExist = specOutputs.find((input) => input.name === item.pin);
    if (!isExist) {
      newOutputs.push({
        name: item.pin,
        valueType: item.dataType,
      } as OutputSocketSpecJSON);
    }
  });

  return newOutputs;
};

export const Node = (props: NodeProps) => {
  const { id, data, spec, selected } = props;
  const edges = useEdges();
  const nodes = useNodes();
  const [nodesSpec] = useNodesSpec();
  const handleChange = useChangeNodeData(id);
  const [widthInput, setWidthInput] = useState(-1);
  const [widthOutput, setWidthOutput] = useState(-1);
  const [isSettingModal, setIsSettingModal] = useState(false);

  const node: NodeInterface | any = nodes.find((item) => item.id === id);
  const pairs = getPairs(
    getInputs(spec.inputs || [], node.data.inputs, node),
    getOutputs(spec.outputs || [], node.data.out)
  );

  const handleSetWidthInput = (width: number) => {
    setWidthInput((prev: number) => Math.max(prev, width));
  };

  const handleSetWidthOutput = (width: number) => {
    setWidthOutput((prev: number) => Math.max(prev, width));
  };

  const handleDbClickTitle = () => {
    const nodeType =
      (nodesSpec as NodeSpecJSON[]).find((item) => item.type === node.type) ||
      DEFAULT_NODE_SPEC_JSON;
    const isAllowSetting = nodeType?.allowSettings || false;

    if (isAllowSetting) setIsSettingModal(true);
  };

  const handleCloseModalSetting = () => {
    setIsSettingModal(false);
  };

  const getConnectionOutput = (targetHandle: string) => {
    const edge = edges.find(
      (item) => item.target === id && item.targetHandle === targetHandle
    );
    if (!edge) return null;

    /* Find the output of the edge connected */
    let output = null;
    const node: NodeInterface | null = nodes.find((item) => item.id === edge.source) || null;
    if (node?.data?.out) {
      output =
        node.data.out.find((item: any) => item.pin === edge.sourceHandle) ||
        null;
    }

    return output;
  };

  return (
    <NodeContainer
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

        const borderB =
          ix === pairs.length - 1 && node.style?.height
            ? "border-b pb-3 border-gray-500"
            : "";

        return (
          <div
            key={ix}
            className={`flex flex-row justify-between gap-8 relative px-4 my-2 ${borderB}`}
          >
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
                minWidth={widthOutput}
                dataOut={data.out}
                onSetWidthInput={handleSetWidthOutput}
                connected={isHandleConnected(edges, id, output.name, "source")}
              />
            )}
          </div>
        );
      })}
      <SettingsModal
        node={node}
        isModalVisible={isSettingModal}
        onCloseModal={handleCloseModalSetting}
      />
    </NodeContainer>
  );
};
