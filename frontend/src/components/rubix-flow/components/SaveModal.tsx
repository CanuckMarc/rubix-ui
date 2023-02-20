import { FC, useEffect, useRef, useState } from "react";
import { useNodes } from "react-flow-renderer/nocss";
import { useParams } from "react-router-dom";

import { FlowFactory } from "../factory";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { Modal } from "./Modal";
import { flowcli } from "../../../../wailsjs/go/models";

export type SaveModalProps = {
  open?: boolean;
  onClose: () => void;
};

export const SaveModal: FC<SaveModalProps> = ({ open = false, onClose }) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const [nodeRender, setNodeRender] = useState("");
  const [countExport, setCountExport] = useState(0);
  const factory = new FlowFactory();
  const { connUUID = "", hostUUID = "" } = useParams();
  const isRemote = !!connUUID && !!hostUUID;
  const nodes = useNodes();

  const handleCopy = () => {
    if (ref.current) {
      ref.current.select();
      document.execCommand("copy");
      ref.current.blur();
      setCopied(true);
      setInterval(() => {
        setCopied(false);
      }, 1000);
    }
  };

  const findAllNodes = (id: string) => {
    const nodesChild: NodeInterface[] = window.allFlow.nodes.filter((item: NodeInterface) => item.parentId === id);
    const allNodes: NodeInterface[] = [];

    nodesChild.forEach((item) => {
      allNodes.push(item);
      if (item.isParent) {
        allNodes.push(...findAllNodes(item.id));
      }
    });

    return allNodes;
  };

  const handleNodeRender = async () => {
    try {
      const selectedNodeIds: string[] = nodes.filter((item: NodeInterface) => item.selected).map((item) => item.id);
      let n = new flowcli.NodesList();
      n.nodes = selectedNodeIds;

      const data = await (window.selectedNodeForExport
        ? factory.GetSubFlow(connUUID, hostUUID, window.selectedNodeForExport.id, isRemote)
        : selectedNodeIds.length > 0
        ? factory.GetFlowList(connUUID, hostUUID, n, isRemote)
        : factory.GetFlow(connUUID, hostUUID, isRemote));

      data.nodes.forEach((item: any) => {
        Object.entries(item?.inputs).forEach(([key, value]: any) => {
          if (value.links) {
            item.inputs = {
              ...item.inputs,
              [key]: value,
            };
          } else {
            item.inputs = {
              ...item.inputs,
              [key]: { overridePosition: false, position: 0 },
            };
          }
        });
      });
      
      setCountExport(data.nodes?.length || 0);
      setNodeRender(JSON.stringify(data, null, 2));
    } catch (error) {
      console.log("error", error);
      setNodeRender(JSON.stringify({ nodes: [] }, null, 2));
    }
  };

  useEffect(() => {
    if (open) {
      handleNodeRender();
    } else {
      window.selectedNodeForExport = undefined;
      setNodeRender("");
    }
  }, [open]);

  return (
    <Modal
      title={"Save Graph - Count: " + countExport}
      actions={[
        { label: "Cancel", onClick: onClose },
        { label: copied ? "Copied" : "Copy", onClick: handleCopy },
      ]}
      open={open}
      onClose={onClose}
    >
      <textarea
        ref={ref}
        value={nodeRender}
        readOnly
        className="border border-gray-300 p-2"
        style={{ height: "50vh", width: "500px" }}
      />
    </Modal>
  );
};
