import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Edge, useEdges, useNodes, useReactFlow } from "react-flow-renderer/nocss";
import { Checkbox } from "antd";

import { NodeInterface, OutputNodeValueType } from "../lib/Nodes/NodeInterface";
import { Modal } from "./Modal";
import { NodeSpecJSON } from "../lib";
import { isInputFlow, isOutputFlow } from "./Node";
import { handleGetSettingType } from "../util/handleSettings";
import { convertDataSpec, getNodeSpecDetail } from "../use-nodes-spec";
import { generateUuid } from "../lib/generateUuid";

type ConnectionBuilderModalProps = {
  parentNode: NodeInterface;
  nodesSpec: boolean | NodeSpecJSON[] | React.Dispatch<React.SetStateAction<NodeSpecJSON[]>>;
  open?: boolean;
  onClose: () => void;
};

type OutputNodeValueTypeWithExpose = OutputNodeValueType & {
  isExported: boolean;
  isUseNodeName: boolean;
  nodeName: string;
};

type NodeWithExpose = NodeInterface & {
  data: {
    inputs: OutputNodeValueTypeWithExpose[];
    out: OutputNodeValueTypeWithExpose[];
  };
};

type NodeSpecJSONWithName = NodeSpecJSON & {
  pin: string;
  node: NodeInterface;
  nodeName: string;
};

type SettingKey = "isExported" | "isUseNodeName" | "nodeName";

export const ConnectionBuilderModal: FC<ConnectionBuilderModalProps> = ({
  parentNode,
  open = false,
  nodesSpec,
  onClose,
}) => {
  const flowInstance = useReactFlow();
  const { connUUID = "", hostUUID = "" } = useParams();
  const nodes = useNodes() as NodeWithExpose[];
  const edges = useEdges();
  const [nodesBuilder, setNodesBuilder] = useState<NodeWithExpose[]>([]);

  const generateNode = (item: NodeSpecJSONWithName, index: number, isOut = false) => {
    const nodeSettings = handleGetSettingType(connUUID, hostUUID, !!connUUID && !!hostUUID, item.type);
    const spec: NodeSpecJSON = getNodeSpecDetail(nodesSpec, item.type);

    return {
      id: generateUuid(),
      isParent: false,
      style: null,
      type: item.type,
      info: { nodeName: item.nodeName },
      position: {
        x: isOut ? item.node.position.x + item.node.width!! + 50 : item.node.position.x - item.node.width!! - 50,
        y: item.node.position.y + (index - 1) * item.node.height!! + 50,
      },
      data: {
        inputs: convertDataSpec(spec.inputs || []),
        out: convertDataSpec(spec.outputs || []),
      },
      parentId: parentNode.id,
      settings: nodeSettings,
      selected: false,
      pin: item.pin,
    };
  };

  const getFlowInputOutput = (flowItems: NodeSpecJSON[], item: OutputNodeValueTypeWithExpose, node: NodeInterface) => {
    const result = flowItems.find((flowItem: NodeSpecJSON) =>
      flowItem.type.includes(
        item.dataType === "number" ? "float" : item.dataType === "boolean" ? "bool" : item.dataType
      )
    );
    return {
      ...result,
      node,
      pin: item.pin,
      nodeName: [item.nodeName, item.isUseNodeName ? item.pin : ""].join(" "),
    };
  };

  const handleSave = () => {
    const inputsFlow = (nodesSpec as NodeSpecJSON[]).filter((n) => isInputFlow(n.type));
    const outputsFlow = (nodesSpec as NodeSpecJSON[]).filter((n) => isOutputFlow(n.type));

    if (nodesBuilder.length > 0) {
      const allNodes: NodeInterface[] = [];
      const allEdges: Edge[] = [];

      nodesBuilder.forEach((node) => {
        let newNodesInput = node.data.inputs
          .filter((item: OutputNodeValueTypeWithExpose) => item.isExported)
          .map((item: OutputNodeValueTypeWithExpose) => getFlowInputOutput(inputsFlow, item, node));

        let newNodesOutput = node.data.out
          .filter((item: OutputNodeValueTypeWithExpose) => item.isExported)
          .map((item: OutputNodeValueTypeWithExpose) => getFlowInputOutput(outputsFlow, item, node));

        newNodesInput = newNodesInput.map((item: NodeSpecJSONWithName, idx: number) => generateNode(item, idx));
        newNodesOutput = newNodesOutput.map((item: NodeSpecJSONWithName, idx: number) => generateNode(item, idx, true));
        allNodes.push(...[...newNodesInput, ...newNodesOutput]);

        newNodesInput.forEach((nodeItem: NodeInterface & { pin: string }) => {
          const newEdge = {
            id: generateUuid(),
            source: nodeItem.id,
            sourceHandle: "out",
            target: node.id,
            targetHandle: nodeItem.pin,
          };
          allEdges.push(newEdge);
        });

        newNodesOutput.forEach((nodeItem: NodeInterface & { pin: string }) => {
          const newEdge = {
            id: generateUuid(),
            source: node.id,
            sourceHandle: nodeItem.pin,
            target: nodeItem.id,
            targetHandle: "in",
          };
          allEdges.push(newEdge);
        });
      });

      if (allNodes.length > 0) {
        setTimeout(() => {
          flowInstance.addNodes(allNodes);
          flowInstance.addEdges(allEdges);
        }, 50);
      }
    }
    onClose();
  };

  const updateValue = (
    items: OutputNodeValueTypeWithExpose[],
    settingIndex: number,
    keyUpdate: SettingKey,
    event: any
  ) => {
    return items.map((item: OutputNodeValueTypeWithExpose, index: number) => {
      if (index === settingIndex) {
        if (keyUpdate === "nodeName") {
          item[keyUpdate] = (event.target as HTMLInputElement).value;
        } else {
          item[keyUpdate] = !Boolean(item[keyUpdate]);
        }
      }
      return item;
    });
  };

  const onChangeSetting =
    (nodeIndex: number, isInput: boolean, settingIndex: number, keyUpdate: SettingKey) => (e: any) => {
      const newNodes = nodesBuilder.map((node, nInd) => {
        if (nInd === nodeIndex) {
          if (isInput) {
            node.data.inputs = updateValue(node.data.inputs, settingIndex, keyUpdate, e);
          } else {
            node.data.out = updateValue(node.data.out, settingIndex, keyUpdate, e);
          }
        }
        return node;
      });

      setNodesBuilder([...newNodes]);
    };

  const renderRow =
    (nodeId: string, nodeIndex: number, isInput: boolean) =>
    (item: OutputNodeValueTypeWithExpose, itemIndex: number) => {
      const isExist = edges.some((edge) => {
        if (isInput) {
          return edge.target === nodeId && edge.targetHandle === item.pin;
        }
        return edge.source === nodeId && edge.sourceHandle === item.pin;
      });

      return (
        <tr key={item.pin} className="pl-4" style={{ display: isExist ? "none" : undefined }}>
          <td>
            <Checkbox
              onChange={onChangeSetting(nodeIndex, isInput, itemIndex, "isExported")}
              checked={item.isExported}
            />
          </td>
          <td className="px-2 py-1 flex-1">
            <div className="flex gap-2">
              <span className="flex-1">{item.pin}</span>
              <input
                className="border-b border-gray-300 px-2 align-top flex-1"
                placeholder="New node name"
                value={item.nodeName}
                onChange={onChangeSetting(nodeIndex, isInput, itemIndex, "nodeName")}
              />
            </div>
          </td>
          <td className="flex">
            <Checkbox
              className="m-auto mt-1"
              onChange={onChangeSetting(nodeIndex, isInput, itemIndex, "isUseNodeName")}
              checked={item.isUseNodeName}
            />
          </td>
        </tr>
      );
    };

  const renderNode = (node: NodeInterface, index: number) => {
    const [type, name] = node.type!!.split("/");
    return (
      <div key={node.id} className={`w-full mt-${index > 0 ? 8 : 0}`}>
        <table className="w-full">
          <thead className="pl-4">
            <tr>
              <th></th>
              <th className="pl-2">{node.info?.nodeName || [name.toLocaleUpperCase(), type].join(" | ")}</th>
              <th className="text-right" style={{ width: 106 }}>
                Use node name
              </th>
            </tr>
          </thead>
          <tbody>
            {node.data.inputs.map(renderRow(node.id, index, true))}
            {node.data.out.map(renderRow(node.id, index, false))}
          </tbody>
        </table>
      </div>
    );
  };

  useEffect(() => {
    if (open) {
      const childNodes = nodes.filter((nodeItem: NodeWithExpose) => nodeItem.parentId === parentNode.id);
      const childNodesSelected = childNodes.filter((item) => item.selected);

      const newNodeBuilder = (childNodesSelected.length > 0 ? childNodesSelected : childNodes).filter(
        (nodeItem: NodeWithExpose) => {
          const connectionCount = (nodeItem.data.inputs || []).length + (nodeItem.data.out || []).length;
          const edgeWithNode = edges.filter(
            (edge) => edge.target === nodeItem.id || edge.source === nodeItem.id
          ).length;
          return (
            !nodeItem.isParent &&
            !isInputFlow(nodeItem.type!!) &&
            !isOutputFlow(nodeItem.type!!) &&
            connectionCount !== edgeWithNode
          );
        }
      );

      setNodesBuilder(
        newNodeBuilder.map((node) => ({
          ...node,
          data: {
            ...node.data,
            inputs: (node.data.inputs || []).map((item: OutputNodeValueType) => ({
              ...item,
              isExported: false,
              isUseNodeName: false,
              nodeName: "",
            })),
            out: (node.data.out || []).map((item: OutputNodeValueType) => ({
              ...item,
              isExported: false,
              isUseNodeName: false,
              nodeName: "",
            })),
          },
        }))
      );
    }
  }, [open]);

  return (
    <Modal
      title="Connection Builder"
      actions={[
        { label: "Close", onClick: onClose },
        { label: "Generate nodes", onClick: handleSave },
      ]}
      open={open}
      onClose={onClose}
    >
      <div className="my-3 px-4 py-3">
        {nodesBuilder.length > 0 ? nodesBuilder.map(renderNode) : <p>All node connected</p>}
      </div>
    </Modal>
  );
};
