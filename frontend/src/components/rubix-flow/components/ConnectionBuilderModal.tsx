import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Edge, useEdges, useNodes, useReactFlow } from "react-flow-renderer/nocss";

import { NodeInterface, OutputNodeValueType } from "../lib/Nodes/NodeInterface";
import { Modal } from "./Modal";
import { NodeSpecJSON } from "../lib";
import { isInputFlow, isOutputFlow } from "./Node";
import { Checkbox } from "antd";
import { handleGetSettingType } from "../util/handleSettings";
import { convertDataSpec, getNodeSpecDetail } from "../use-nodes-spec";
import { generateUuid } from "../lib/generateUuid";

export type ConnectionBuilderModalProps = {
  parentNode: NodeInterface;
  nodesSpec: boolean | NodeSpecJSON[] | React.Dispatch<React.SetStateAction<NodeSpecJSON[]>>;
  open?: boolean;
  onClose: () => void;
};

type OutputNodeValueTypeWithExpose = OutputNodeValueType & {
  isExported: boolean;
  isUseNodeName: boolean;
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
  const isRemote = !!connUUID && !!hostUUID;

  const generateNode = (item: NodeSpecJSONWithName, index: number, isOut = false) => {
    const nodeSettings = handleGetSettingType(connUUID, hostUUID, isRemote, item.type);
    const spec: NodeSpecJSON = getNodeSpecDetail(nodesSpec, item.type);

    return {
      id: generateUuid(),
      isParent: false,
      style: null,
      type: item.type,
      info: {
        nodeName: item.nodeName,
      },
      position: {
        x: isOut ? item.node.position.x + item.node.width!! + 50 : item.node.position.x - item.node.width!! - 50,
        y: item.node.position.y + (index - 1) * item.node.height!! + 100,
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

  const handleSave = () => {
    const inputsFlow = (nodesSpec as NodeSpecJSON[]).filter((n) => isInputFlow(n.type));
    const outputsFlow = (nodesSpec as NodeSpecJSON[]).filter((n) => isOutputFlow(n.type));

    if (nodesBuilder.length > 0) {
      const allNodes: NodeInterface[] = [];
      const allEdges: Edge[] = [];

      nodesBuilder.forEach((node) => {
        let newNodesInput = node.data.inputs
          .filter((item: OutputNodeValueTypeWithExpose) => item.isExported)
          .map((item: OutputNodeValueTypeWithExpose) => {
            const inputItem = inputsFlow.find((flowItem: NodeSpecJSON) =>
              flowItem.type.includes(
                item.dataType === "number" ? "float" : item.dataType === "boolean" ? "bool" : item.dataType
              )
            );
            return {
              ...inputItem,
              node,
              pin: item.pin,
              nodeName: item.isUseNodeName ? item.pin : "",
            };
          });

        let newNodesOutput = node.data.out
          .filter((item: OutputNodeValueTypeWithExpose) => item.isExported)
          .map((item: OutputNodeValueTypeWithExpose) => {
            const outItem = outputsFlow.find((flowItem: NodeSpecJSON) =>
              flowItem.type.includes(
                item.dataType === "number" ? "float" : item.dataType === "boolean" ? "bool" : item.dataType
              )
            );
            return {
              ...outItem,
              node,
              pin: item.pin,
              nodeName: item.isUseNodeName ? item.pin : "",
            };
          });

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

  const onChangeSetting =
    (nodeIndex: number, isInput: boolean, settingIndex: number, keyUpdate: "isExported" | "isUseNodeName") => () => {
      const newNodes = nodesBuilder.map((node, nInd) => {
        if (nInd === nodeIndex) {
          if (isInput) {
            node.data.inputs = node.data.inputs.map((inp: OutputNodeValueTypeWithExpose, inpInd: number) => {
              if (inpInd === settingIndex) {
                inp[keyUpdate] = !Boolean(inp[keyUpdate]);
              }
              return inp;
            });
          } else {
            node.data.out = node.data.out.map((out: OutputNodeValueTypeWithExpose, outInd: number) => {
              if (outInd === settingIndex) {
                out[keyUpdate] = !Boolean(out[keyUpdate]);
              }
              return out;
            });
          }
        }

        return node;
      });

      setNodesBuilder([...newNodes]);
    };

  const renderRow = (nodeIndex: number, isInput: boolean) => (item: OutputNodeValueTypeWithExpose, itemIndex: number) =>
    (
      <tr key={item.pin} className="px-4">
        <td>
          <Checkbox onChange={onChangeSetting(nodeIndex, isInput, itemIndex, "isExported")} checked={item.isExported} />
        </td>
        <td>{item.pin}</td>
        <td>
          <Checkbox
            onChange={onChangeSetting(nodeIndex, isInput, itemIndex, "isUseNodeName")}
            checked={item.isUseNodeName}
          />
        </td>
      </tr>
    );

  const renderNode = (node: NodeInterface, index: number) => {
    const [type, name] = node.type!!.split("/");
    return (
      <div key={node.id} className={`w-full mt-${index > 0 ? 8 : 0}`}>
        <table className="w-full">
          <thead className="px-4">
            <tr>
              <th></th>
              <th>{[name.toLocaleUpperCase(), type].join(" | ")}</th>
              <th>Use node name</th>
            </tr>
          </thead>
          <tbody>
            {node.data.inputs.map(renderRow(index, true))}
            {node.data.out.map(renderRow(index, false))}
          </tbody>
        </table>
      </div>
    );
  };

  useEffect(() => {
    if (open) {
      const newNodeBuilder = nodes
        .filter((nodeItem: NodeWithExpose) => nodeItem.parentId === parentNode.id)
        .filter((nodeItem: NodeWithExpose) => {
          const isExistConnection = edges.some((edge) => edge.target === nodeItem.id || edge.source === nodeItem.id);
          return (
            !nodeItem.isParent && !isInputFlow(nodeItem.type!!) && !isOutputFlow(nodeItem.type!!) && !isExistConnection
          );
        });

      setNodesBuilder(
        newNodeBuilder.map((node) => ({
          ...node,
          data: {
            ...node.data,
            inputs: node.data.inputs.map((item: OutputNodeValueType) => ({
              ...item,
              isExported: false,
              isUseNodeName: false,
            })),
            out: node.data.out.map((item: OutputNodeValueType) => ({
              ...item,
              isExported: false,
              isUseNodeName: false,
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
