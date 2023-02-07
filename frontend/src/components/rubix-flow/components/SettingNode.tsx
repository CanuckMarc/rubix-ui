import { Switch } from "antd";
import { FC, useState } from "react";
import { useNodes, useReactFlow } from "react-flow-renderer/nocss";
import { UpCircleOutlined, DownCircleOutlined } from "@ant-design/icons";

import { NodeInterface } from "../lib/Nodes/NodeInterface";

import { Modal } from "./Modal";

export type SetNameModalProps = {
  node: NodeInterface;
  open?: boolean;
  onClose: () => void;
};

export const SettingNode: FC<SetNameModalProps> = ({ node, open = false, onClose }) => {
  const instance = useReactFlow();

  const inPutNode = node.data.inputs?.map((item: NodeInterface, index: number) => {
    return {
      ...item,
    };
  });

  const [orderIn, setOrderIn] = useState(node.orderInput);
  const [inPutsPar, setInPutsPar] = useState(inPutNode);

  const switchIndex = (index1: number, index2: number, arr: any) => {
    let Arr = [...arr];
    let temp = Arr[index1];
    Arr[index1] = Arr[index2];
    Arr[index2] = temp;

    return Arr;
  };
  // orderIn.sort((a: any, b: any) => a.position - b.position);
  let sortable = [];
  for (var vehicle in orderIn) {
    sortable.push([vehicle, orderIn[vehicle]]);
  }
  sortable.sort(function (a, b) {
    return a[1].position - b[1].position;
  });
  const orderInNew = Object.fromEntries(sortable);

  const onClickUpInNode = (item: any, index: number) => {
    if (index === 0) return;
    let newInputsPar = [...inPutsPar];

    newInputsPar = switchIndex(index, index - 1, newInputsPar).map((item: any, index: number) => ({
      ...item,
      position: index,
    }));
    const keyOrderIn = Object.keys(orderInNew);
    const newOrderInput: any = {};

    switchIndex(index, index - 1, keyOrderIn).forEach((item: any, index: number) => {
      if (orderInNew[item].position !== index) {
        newOrderInput[item] = { ...orderInNew[item], position: index, overridePosition: true };
      } else {
        newOrderInput[item] = { ...orderInNew[item], position: index };
      }
    });
    setOrderIn(newOrderInput);
    setInPutsPar(newInputsPar);
  };

  const onClickDownInNode = (item: any, index: number) => {
    if (index === inPutsPar.length - 1) return;
    let newInputsPar = [...inPutsPar];

    newInputsPar = switchIndex(index, index + 1, newInputsPar).map((item: any, index: number) => ({
      ...item,
      position: index,
    }));
    const keyOrderIn = Object.keys(orderInNew);
    const newOrderInput: any = {};

    switchIndex(index, index + 1, keyOrderIn).forEach((item: any, index: number) => {
      if (orderInNew[item].position !== index) {
        newOrderInput[item] = { ...orderInNew[item], position: index, overridePosition: true };
      } else {
        newOrderInput[item] = { ...orderInNew[item], position: index };
      }
    });

    setOrderIn(newOrderInput);
    setInPutsPar(newInputsPar);
  };

  const handleSubmit = () => {
    const newNodes = instance.getNodes().map((item: NodeInterface) => {
      if (item.id === node.id) {
        return {
          ...item,
          data: { inputs: inPutsPar },
          orderInput: orderIn,
        };
      }
      return item;
    });

    instance.setNodes(newNodes);
    onClose();
  };

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
          {inPutsPar?.map((item: any, index: number) => (
            <div key={index} className="mb-2 flex justify-between">
              <div>
                <Switch size="small" className="mr-5" />
                <label className="pr-6 mb-0 mr-16 pt-1 capitalize">{item.pin}</label>
              </div>
              <div>
                <UpCircleOutlined className="mr-2" onClick={() => onClickUpInNode(item, index)} />
                <DownCircleOutlined onClick={() => onClickDownInNode(item, index)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
