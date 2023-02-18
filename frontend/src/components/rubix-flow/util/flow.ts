import { isInputFlow, isOutputFlow } from '../components/Node';
import { NodeInterface } from '../lib/Nodes/NodeInterface';

const formatInputOrOutputOfParentNode = (items: { name: string; valueType: string; subName: string; }[]) => {
  const isMultipleInputs = items.length > 1;
  return items.map((item, index) => {
    const pin = isMultipleInputs ? `${item.name}${index + 1}` : item.name;
    return {
      dataType: item.valueType,
      pin,
      value: null,
      subName: item.subName ? `${pin} (${item.subName})` : pin,
    };
  });
};

export const getInputsOutputOfParentNode = (
  nodes: NodeInterface[],
  node: NodeInterface,
  specOfNodes: any[],
  isInput = false
) => {
  return nodes
    .filter(item => item.parentId === node.id)
    .filter((item) => (isInput ? isInputFlow(item.type!!) : isOutputFlow(item.type!!)))
    .map((item) => {
      const spec = specOfNodes.find((item2) => item2.type === item.type);
      return {
        ...(isInput ? spec.inputs[0] : spec.outputs[0]),
        subName: item.info?.nodeName,
        nodeId: node.id,
      };
    });
};


export const formatParentNodesWithInputsOutputs = (newNodes: NodeInterface[], allSpecNodes: any[]): NodeInterface[] => {
  const specOfNodes = newNodes.map((node) => {
    return ((allSpecNodes as Array<any>) || []).find((item) => item.type === node.type);
  });

  const result = newNodes.map((node) => {
    if (node.isParent) {
      const inputs = getInputsOutputOfParentNode(newNodes, node, specOfNodes, true);
      const outputs = getInputsOutputOfParentNode(newNodes, node, specOfNodes, false);
      const newOut = formatInputOrOutputOfParentNode(outputs);
      const oldOut = (node.data?.out || []).filter((item: any) => !newOut.some(item2 => item2.pin === item.pin));

      return {
        ...node,
        data: {
          ...node.data,
          inputs: formatInputOrOutputOfParentNode(inputs),
          out: [...newOut, ...oldOut],
        },
      };
    }
    return node;
  });

  return result;
};