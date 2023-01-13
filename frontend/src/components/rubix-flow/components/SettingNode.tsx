import { Switch } from "antd";
import { FC, useEffect, useState } from "react";
import { useNodes, useReactFlow } from "react-flow-renderer/nocss";

import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { InputSocket } from "./InputSocket";
import { Modal } from "./Modal";

export type SetNameModalProps = {
  node: NodeInterface;
  open?: boolean;
  onClose: () => void;
};

export const SettingNode: FC<SetNameModalProps> = ({ node, open = false, onClose }) => {
  const [name, setName] = useState<string>("");

  const instance = useReactFlow();
  const allNodes = useNodes();
  console.log("allNodes", allNodes);

  const childNode = allNodes.filter((item: NodeInterface) => item.parentId === node.id);
  const outPutNode = childNode.filter((item) => item.type?.split("/")?.[1].startsWith("output"));
  const inPutNode = childNode.filter((item) => item.type?.split("/")?.[1].startsWith("input"));
  const nodeNoParent = allNodes.filter((item: NodeInterface) => !item.isParent);
  const inPutNodeParent = node.data.inputs;
  const outPutNodeParent = node.data.out;

  const [inPuts, setInPuts] = useState(inPutNode);
  const [outPuts, setOutPuts] = useState(outPutNode);
  const [inPutsPar, setInPutsPar] = useState(inPutNodeParent);
  const [outPutsPar, setOutPutsPar] = useState(outPutNodeParent);

  const onClickUpInNode = (index: number) => {
    if (index === 0) return;
    let Arr = [];
    Arr = [...inPuts.slice(0, index - 1), inPuts[index], inPuts[index - 1], ...inPuts.slice(index + 1)];

    setInPuts(Arr);
  };
  const onClickUpInNodePar = (index: number) => {
    if (index === 0) return;
    let Arr = [];
    Arr = [...inPutsPar.slice(0, index - 1), inPutsPar[index], inPutsPar[index - 1], ...inPutsPar.slice(index + 1)];

    setInPutsPar(Arr);
  };
  const onClickDownInNode = (index: number) => {
    if (index === inPuts.length - 1) return;

    let Arr = [];
    if (index === 0) {
      Arr = [inPuts[index + 1], inPuts[index], ...inPuts.slice(index + 2)];
    } else if (index === inPuts.length - 2) {
      Arr = [...inPuts.slice(0, index), inPuts[index + 1], inPuts[index], ...inPuts.slice(index + 2)];
    } else {
      Arr = [...inPuts.slice(0, index - 1), inPuts[index + 1], inPuts[index], ...inPuts.slice(index + 2)];
    }
    setInPuts(Arr);
  };

  const onClickDownInNodePar = (index: number) => {
    if (index === inPutsPar.length - 1) return;

    let Arr = [];
    if (index === 0) {
      Arr = [inPutsPar[index + 1], inPutsPar[index], ...inPutsPar.slice(index + 2)];
    } else if (index === inPutsPar.length - 2) {
      Arr = [...inPutsPar.slice(0, index), inPutsPar[index + 1], inPutsPar[index], ...inPutsPar.slice(index + 2)];
    } else {
      Arr = [...inPutsPar.slice(0, index - 1), inPutsPar[index + 1], inPutsPar[index], ...inPutsPar.slice(index + 2)];
    }
    setInPutsPar(Arr);
  };

  const onClickUpOutNode = (index: number) => {
    if (index === 0) return;

    const Arr = [...outPuts.slice(0, index - 1), outPuts[index], outPuts[index - 1], ...outPuts.slice(index + 1)];
    setOutPuts(Arr);
  };

  const onClickUpOutNodePar = (index: number) => {
    if (index === 0) return;
    let Arr = [];
    Arr = [...outPutsPar.slice(0, index - 1), outPutsPar[index], outPutsPar[index - 1], ...outPutsPar.slice(index + 1)];

    setOutPutsPar(Arr);
  };

  const onClickDownOutNode = (index: number) => {
    if (index === outPuts.length - 1) return;

    let Arr = [];
    if (index === 0) {
      Arr = [outPuts[index + 1], outPuts[index], ...outPuts.slice(index + 2)];
    } else if (index === outPuts.length - 2) {
      Arr = [...outPuts.slice(0, index), outPuts[index + 1], outPuts[index], ...outPuts.slice(index + 2)];
    } else {
      Arr = [...outPuts.slice(0, index - 1), outPuts[index + 1], outPuts[index], ...outPuts.slice(index + 2)];
    }
    setOutPuts(Arr);
  };

  const onClickDownOutNodePar = (index: number) => {
    if (index === outPutsPar.length - 1) return;

    let Arr = [];
    if (index === 0) {
      Arr = [outPutsPar[index + 1], outPutsPar[index], ...outPutsPar.slice(index + 2)];
    } else if (index === outPutsPar.length - 2) {
      Arr = [...outPutsPar.slice(0, index), outPutsPar[index + 1], outPutsPar[index], ...outPutsPar.slice(index + 2)];
    } else {
      Arr = [
        ...outPutsPar.slice(0, index - 1),
        outPutsPar[index + 1],
        outPutsPar[index],
        ...outPutsPar.slice(index + 2),
      ];
    }
    setOutPutsPar(Arr);
  };

  const handleSubmit = () => {
    const newNodes = instance.getNodes().map((item: NodeInterface) => {
      if (item.id === node.id) {
        return {
          ...item,
        };
      }
      return item;
    });
    instance.setNodes(newNodes);

    onClose();
  };

  useEffect(() => {
    if (!open) return;
    setName(node.info?.nodeName || "");
  }, [node, open]);

  return (
    <Modal
      title="Settings Node"
      actions={[
        { label: "Cancel", onClick: onClose },
        { label: "Set", onClick: handleSubmit },
      ]}
      open={open}
      onClose={onClose}
    >
      <div className="flex flex-row justify-between gap-8 relative my-3 px-4 py-3 bg-white">
        <div className="flex flex-col">
          {node.isParent
            ? inPuts.map((item: NodeInterface, index) => (
                <div key={index} className="mb-2 flex justify-between">
                  <div>
                    <Switch size="small" className="mr-5" />
                    <label className="pr-6 mb-0 mr-16 pt-1 capitalize">{item.info?.nodeName} </label>
                  </div>
                  <div>
                    <button onClick={() => onClickUpInNode(index)}>Len</button>
                    <button onClick={() => onClickDownInNode(index)}>Xuong</button>
                  </div>
                </div>
              ))
            : inPutsPar.map((item: any, index: number) => (
                <div key={index} className="mb-2 flex justify-between">
                  <div>
                    <Switch size="small" className="mr-5" />
                    <label className="pr-6 mb-0 mr-16 pt-1 capitalize">{item.pin}</label>
                  </div>
                  <div>
                    <button onClick={() => onClickUpInNodePar(index)}>Len</button>
                    <button onClick={() => onClickDownInNodePar(index)}>Xuong</button>
                  </div>
                </div>
              ))}
        </div>
        <div className="flex flex-col">
          {node.isParent
            ? outPuts.map((item: NodeInterface, index) => (
                <div key={index} className="mb-2 flex justify-between">
                  <div>
                    <Switch size="small" className="mr-5" />
                    <label className="pr-6 mb-0 mr-16 pt-1 capitalize">{item.info?.nodeName} </label>
                  </div>
                  <div>
                    <button onClick={() => onClickUpOutNode(index)}>Len</button>
                    <button onClick={() => onClickDownOutNode(index)}>Xuong</button>
                  </div>
                </div>
              ))
            : outPutNodeParent.map((item: any, index: number) => (
                <div key={index} className="mb-2 flex justify-between">
                  <div>
                    <Switch size="small" className="mr-5" />
                    <label className="pr-6 mb-0 mr-16 pt-1 capitalize">{item.pin} </label>
                  </div>
                  <div>
                    <button onClick={() => onClickUpOutNodePar(index)}>Len</button>
                    <button onClick={() => onClickDownOutNodePar(index)}>Xuong</button>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </Modal>
  );
};
