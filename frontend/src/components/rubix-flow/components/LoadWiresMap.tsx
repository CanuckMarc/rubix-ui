import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useStore, useIsLoading } from '../../../App';

import { Edge, useReactFlow } from "react-flow-renderer/nocss";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { handleGetSettingType } from "../util/handleSettings";
import { useNodesSpec, convertDataSpec, getNodeSpecDetail } from "../use-nodes-spec";
import { NodeSpecJSON } from "../lib";
import { generateUuid } from "../lib/generateUuid";
import { node } from "../../../../wailsjs/go/models";

type NodeGenInputType = {
  type: string;
  name: string;
  isParent: boolean;
  parentId: string | undefined;
  x: number;
  y: number;
}

function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export const LoadWiresMap = () => {
    let { connUUID = "", hostUUID = "" } = useParams();
    const [newNodes, setNewNodes] = useState<NodeInterface[]>([]);
    const [newEdges, setNewEdges] = useState<Edge[]>([]);
    const [wiresMapNodes, setWiresMapNodes] = useStore(
      (state) => [state.wiresMapNodes, state.setWiresMapNodes]
    )
    const [isLoadingRubixFlow, reset, setIsLoadingRubixFlow] = useIsLoading(
      (state) => [state.isLoadingRubixFlow, state.reset, state.setIsLoadingRubixFlow]
    )

    const [nodesSpec] = useNodesSpec();
    const flowInstance = useReactFlow();

    useEffect(() => {
      let newNodes: NodeInterface[] = [];
      let newEdges: Edge[] = [];
      if (wiresMapNodes.length !== 0) {
        wiresMapNodes.forEach(item => {
          const resObj = addNewNodesEdges(item, item.existingFlowNet);
          newNodes = [...newNodes, ...resObj.nodes]
          newEdges = [...newEdges, ...resObj.edges]
        })
        setNewNodes(newNodes)
        setNewEdges(newEdges)
        // renderPointsToFlowEditor(newNodes, newEdges);
        // setWiresMapNodes([]);
      }
    }, [])

    useEffect(() => {
      // console.log('is loading is: ', isLoadingRubixFlow)
      if (isLoadingRubixFlow === 2) {
        // deBounce(isLoadingRubixFlow)
        // console.log('accessed!!! new nodes are: ', newNodes)
        renderPointsToFlowEditor(newNodes, newEdges);
        setWiresMapNodes([]);
      }
    }, [isLoadingRubixFlow])

    // const deBounce = (currentVal: Number) => {
    //   setTimeout(() => {
    //     if (isLoadingRubixFlow === currentVal) {
    //       console.log('accessed!!! new nodes are: ', newNodes)
    //       renderPointsToFlowEditor(newNodes, newEdges);
    //       setWiresMapNodes([]);
    //     } else {
    //       deBounce(isLoadingRubixFlow);
    //     }
    //   }, 4000)
    // }

    const addNewNodesEdges = (points: any, existingFlowNet: node.Schema | undefined) => {
      const nodes: NodeInterface[] = [];
      const edges: Edge[] = [];
      let parentNode: NodeInterface = {} as NodeInterface;

      const x = getRandomArbitrary(-200, 200)
      const y = getRandomArbitrary(-200, 200)

      // generate new nodes
      // only add new flow-network when no existing one selected
      if (existingFlowNet === undefined) {
        parentNode = generateNodes({
          type: 'flow/flow-network',
          name: '',
          isParent: true,
          parentId: undefined,
          x: x,
          y: y
        })
        nodes.push(parentNode)
      }

      const nodeSpecs: NodeGenInputType[] = [
        {
          type: 'flow/flow-point',
          name: points.pointOne?.name || '',
          isParent: false,
          parentId: existingFlowNet === undefined ? parentNode.id : existingFlowNet.id,
          x: x,
          y: y
        }, 
        {
          type: 'flow/flow-point-write',
          name: points.pointTwo?.name || '',
          isParent: false,
          parentId: existingFlowNet === undefined ? parentNode.id : existingFlowNet.id,
          x: x + 800,
          y: y
        }
      ]

      let nodeIds: string[] = []
      nodeSpecs.forEach((item: NodeGenInputType) => {
        const node = generateNodes(item)
        nodeIds.push(node.id)
        nodes.push(node)
      })

      // generate new edge
      const Edge: Edge = {
        id: generateUuid(),
        source: nodeIds[0],
        sourceHandle: "out",
        target: nodeIds[1],
        targetHandle: "in16"
      }
      edges.push(Edge);

      return {nodes: nodes, edges: edges}
    }

    const renderPointsToFlowEditor = (newNodes: NodeInterface[], newEdges: Edge[]) => {
      // set new nodes and edges into flow editor
      setTimeout(() => {
        let oldNodes = flowInstance.getNodes();
        flowInstance.setNodes([...oldNodes, ...newNodes]);
        window.allFlow.nodes = [...window.allFlow.nodes, ...newNodes]
        
        const oldEdges = flowInstance.getEdges();
        flowInstance.setEdges([...oldEdges, ...newEdges]);
        window.allFlow.edges = [...window.allFlow.edges, ...newEdges]
      }, 50);

    }

    const generateNodes = (item: NodeGenInputType) => {
      const nodeSettings = handleGetSettingType(connUUID, hostUUID, !!connUUID && !!hostUUID, item.type);
      const spec: NodeSpecJSON = getNodeSpecDetail(nodesSpec, item.type);

      return {
        id: generateUuid(),
        isParent: item.isParent,
        type: item.type,
        info: { nodeName: item.name },
        position: {
          x: item.x,
          y: item.y,
        },
        positionAbsolute: {
          x: item.x,
          y: item.y,
        },
        data: {
          inputs: convertDataSpec(spec.inputs || []),
          out: convertDataSpec(spec.outputs || []),
        },
        style: {},
        status: undefined,
        parentId: item.parentId,
        settings: nodeSettings,
        selected: false,
      };
    }

    return (
        <></>
    );
}