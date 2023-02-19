import { Edge } from 'react-flow-renderer';
import { isInputFlow, isOutputFlow } from '../components/Node';
import { generateUuid } from '../lib/generateUuid';
import { NodeInterface } from '../lib/Nodes/NodeInterface';

type InputOutPutOfParentNode = {
  name?: string;
  pin?: string;
  valueType?: string;
  dataType?: string;
  subName?: string;
  nodeId?: string;
};

const formatInputOrOutputOfParentNode = (items: InputOutPutOfParentNode[]): InputOutPutOfParentNode[] => {
  const isMultipleInputs = items.length > 1;
  return items.map((item, index) => {
    const pin = isMultipleInputs ? `${item.name}${index + 1}` : item.name;
    return {
      nodeId: item.nodeId,
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
        nodeId: item.id,
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

export const formatEdgesWithParentNode = (nodes: NodeInterface[], edges: Edge[]): Edge[] => {
  const allEdges = [...edges];

  edges.forEach(edge => {
    const { source, target } = edge;
    const nodeByTarget = nodes.find(node => node.id === target);
    const nodeBySource = nodes.find(node => node.id === source);

    if (nodeByTarget?.parentId && nodeBySource?.parentId) {
      const childNodesOfTarget = nodes.filter(node => node.parentId === nodeByTarget.parentId);
      const inputNodes = childNodesOfTarget.filter(node => isInputFlow(node.type!!));
      const inputIndex = inputNodes.findIndex(input => input.id === nodeByTarget.id);

      const childNodesOfSource = nodes.filter(node => node.parentId === nodeBySource.parentId);
      const outNodes = childNodesOfSource.filter(node => isOutputFlow(node.type!!));
      const outIndex = outNodes.findIndex(input => input.id === nodeBySource.id);

      const edgeClone = {
        id: generateUuid(),
        source: nodeBySource.parentId,
        sourceHandle: outNodes.length > 1 ? `output${outIndex + 1}` : 'output',
        target: nodeByTarget.parentId,
        targetHandle: inputNodes.length > 1 ? `input${inputIndex + 1}` : 'input'
      };
      allEdges.push(edgeClone);
    } else if (nodeByTarget?.parentId) {
      const childNodes = nodes.filter(node => node.parentId === nodeByTarget.parentId);
      const inputNodes = childNodes.filter(node => isInputFlow(node.type!!));
      const inputIndex = inputNodes.findIndex(input => input.id === nodeByTarget.id);

      if (inputIndex !== -1) {
        const edgeClone = {
          ...edge,
          id: generateUuid(),
          target: nodeByTarget.parentId,
          targetHandle: inputNodes.length > 1 ? `input${inputIndex + 1}` : 'input'
        };
        allEdges.push(edgeClone);
      }
    } else if (nodeBySource?.parentId) {
      const childNodes = nodes.filter(node => node.parentId === nodeBySource.parentId);
      const outNodes = childNodes.filter(node => isOutputFlow(node.type!!));
      const outIndex = outNodes.findIndex(input => input.id === nodeBySource.id);
      if (outIndex !== -1) {
        const edgeClone = {
          ...edge,
          id: generateUuid(),
          source: nodeBySource.parentId,
          sourceHandle: outNodes.length > 1 ? `output${outIndex + 1}` : 'output'
        };
        allEdges.push(edgeClone);
      }
    }
  });

  return allEdges;
};