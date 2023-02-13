import { Switch } from "antd";
import { FC, useState } from "react";
import { useNodes, useReactFlow } from "react-flow-renderer/nocss";
import { UpCircleOutlined, DownCircleOutlined } from "@ant-design/icons";

import { NodeInterface } from "../lib/Nodes/NodeInterface";

import { Modal } from "./Modal";
import { isOutputFlow } from "./Node";

export type SetNameModalProps = {
  node: NodeInterface;
  open?: boolean;
  onClose: () => void;
};

export const SettingNode: FC<SetNameModalProps> = ({ node, open = false, onClose }) => {
  const instance = useReactFlow();
  const allNodes = useNodes();

  const childNode: NodeInterface[] = node.isParent
    ? allNodes.filter((item: NodeInterface) => item.parentId === node.id)
    : [];
  const inputNodeChild = childNode
    .filter((n: NodeInterface) => isOutputFlow(n.type!!))
    .map((item, index) => ({
      ...item.data.inputs[0],
      position: index,
    }));
  const inPutNode = node.isParent ? inputNodeChild : node.data.inputs;
  const orderInPar = inputNodeChild.reduce(
    (newItem: NodeInterface, itemx: any, index: number) => ({
      ...newItem,
      [itemx.pin + (index + 1)]: {
        position: itemx.position,
        overridePosition: itemx.overridePosition,
      },
    }),
    {}
  );

  const orderInAll = node.isParent ? orderInPar : node.orderInput;
  const [orderIn, setOrderIn] = useState(orderInAll);
  const [inPutsPar, setInPutsPar] = useState(inPutNode);
  const onChangeHiddenIn = (item: any) => {
    let newInputPar = [...inPutsPar];
    newInputPar.forEach((itemx, index) => {
      if (item.pin === itemx.pin) {
        newInputPar[index] = { ...itemx, hiddenInput: !item.hiddenInput };
      }
    });
    setInPutsPar(newInputPar);
  };
  const switchIndex = (index1: number, index2: number, arr: any) => {
    let Arr = [...arr];
    let temp = Arr[index1];
    Arr[index1] = Arr[index2];
    Arr[index2] = temp;

    return Arr;
  };
  let sortable = [];
  for (let vehicle in orderIn) {
    sortable.push([vehicle, orderIn[vehicle]]);
  }
  sortable.sort(function (a, b) {
    return a[1].position - b[1].position;
  });
  const orderInNew = Object.fromEntries(sortable);

  const onClickUpInNode = (index: number) => {
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

  const onClickDownInNode = (index: number) => {
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
        const newHiddenInput = inPutsPar.reduce(
          (newItem: NodeInterface, itemx: any) => ({
            ...newItem,
            [itemx.pin]: {
              hiddenInput: itemx.hiddenInput,
            },
          }),
          {}
        );
        return {
          ...item,
          data: { inputs: inPutsPar },
          orderInput: orderIn,
          hiddenInput: newHiddenInput,
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
                <Switch
                  checked={item.hiddenInput}
                  size="small"
                  className="mr-5"
                  onChange={() => onChangeHiddenIn(item)}
                />
                <label className="pr-6 mb-0 mr-16 pt-1 capitalize">
                  {item.pin + (node.isParent ? "-" + item?.dataType : "")}
                </label>
              </div>
              <div>
                <UpCircleOutlined className="mr-2" onClick={() => onClickUpInNode(index)} />
                <DownCircleOutlined onClick={() => onClickDownInNode(index)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
