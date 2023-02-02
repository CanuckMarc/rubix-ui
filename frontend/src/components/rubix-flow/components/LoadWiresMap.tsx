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
    const [refreshCounter, reset, setIsLoadingRubixFlow] = useIsLoading(
      (state) => [state.refreshCounter, state.reset, state.incrementRefreshCounter]
    )

    const [nodesSpec] = useNodesSpec();
    const flowInstance = useReactFlow();

    useEffect(() => {
      let localNodes: NodeInterface[] = [];
      let localEdges: Edge[] = [];
      if (wiresMapNodes.length !== 0) {
        wiresMapNodes.forEach(item => {
          const resObj = addNewNodesEdges(item, item.existingFlowNet);
          localNodes = [...localNodes, ...resObj.nodes]
          localEdges = [...localEdges, ...resObj.edges]
        })
        setNewNodes(localNodes);
        setNewEdges(localEdges);
      }
    }, [])

    useEffect(() => {
      // console.log('is loading is: ', refreshCounter)
      // it takes two refreshes for rubix-flow panel to get ready when navigate to the WIRES_MAP_REMOTE link defined in ROUTE
      // Therefore, it is safe to add new nodes to the flow component after 2 refreshes are done 
      if (refreshCounter === 2) {
        // deBounce(refreshCounter)
        renderPointsToFlowEditor(newNodes, newEdges);
        setWiresMapNodes([]);
      }
    }, [refreshCounter])

    // const deBounce = (currentVal: Number) => {
    //   setTimeout(() => {
    //     if (refreshCounter === currentVal) {
    //       console.log('accessed!!! new nodes are: ', newNodes)
    //       renderPointsToFlowEditor(newNodes, newEdges);
    //       setWiresMapNodes([]);
    //     } else {
    //       deBounce(refreshCounter);
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