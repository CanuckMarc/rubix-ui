import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useStore, useIsLoading } from '../../../App';

import { Edge, useReactFlow } from "reactflow";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { handleGetSettingType } from "../util/handleSettings";
import { useNodesSpec, convertDataSpec, getNodeSpecDetail } from "../use-nodes-spec";
import { NodeSpecJSON } from "../lib";
import { generateUuid } from "../lib/generateUuid";
import { node } from "../../../../wailsjs/go/models";
import { openNotificationWithIcon } from "../../../utils/utils";

type NodeGenInputType = {
  type: string;
  name: string;
  isParent: boolean;
  parentId: string | undefined;
  x: number;
  y: number;
}

interface ReturnType {
  localNodes: NodeInterface[];
  localEdges: Edge[]
}

function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const x = getRandomArbitrary(-200, 200)
const y = getRandomArbitrary(-200, 200)

export const LoadWiresMap = () => {
  let { connUUID = "", hostUUID = "" } = useParams();
  const [wiresMapNodes, setWiresMapNodes] = useStore(
    (state) => [state.wiresMapNodes, state.setWiresMapNodes]
  )
  const [refreshCounter, reset, setIsLoadingRubixFlow] = useIsLoading(
    (state) => [state.refreshCounter, state.reset, state.incrementRefreshCounter]
  )

  const [nodesSpec] = useNodesSpec();
  const flowInstance = useReactFlow();

  useEffect(() => {
    // it takes two refreshes for rubix-flow panel to get ready when navigate to the WIRES_MAP_REMOTE link defined in ROUTE
    // Therefore, it is safe to add new nodes to the flow component after 2 refreshes are done 
    if (refreshCounter === 2) {     
      if (wiresMapNodes.length !== 0) {
        const res = startUp();
        if (res) renderPointsToFlowEditor(res.localNodes, res.localEdges);
        setWiresMapNodes([]);
        openNotificationWithIcon("success", 'Flownet loading complete!');
      }
    }
  }, [refreshCounter])

  const addNewNodesEdges = (points: any, existingFlowNet: node.Schema | undefined, parentNode: NodeInterface, x: number, y: number) => {
    const nodes: NodeInterface[] = [];
    const edges: Edge[] = [];

    // generate new nodes
    const nodeSpecs: NodeGenInputType[] = [
      {
        type: 'flow/flow-point',
        name: points.pointOne?.name || '',
        isParent: false,
        parentId: existingFlowNet?.id || parentNode.id,
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
      sourceHandle: "output",
      target: nodeIds[1],
      targetHandle: "in16"
    }
    edges.push(Edge);

    return {nodes: nodes, edges: edges}
  }

  const renderPointsToFlowEditor = (inputNodes: NodeInterface[], inputEdges: Edge[]) => {
    // set new nodes and edges into flow editor
    setTimeout(() => {
      const oldNodes = flowInstance.getNodes();
      flowInstance.setNodes([...oldNodes, ...inputNodes]);
      window.allFlow.nodes = [...window.allFlow.nodes, ...inputNodes];
      
      const oldEdges = flowInstance.getEdges();
      flowInstance.setEdges([...oldEdges, ...inputEdges]);
      window.allFlow.edges = [...window.allFlow.edges, ...inputEdges];
    }, 100);

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
      settings: { ...nodeSettings, point: item.name },
      selected: false,
    };
  }

  const startUp = () => {
    let localNodes: NodeInterface[] = [];
    let localEdges: Edge[] = [];
    let res: ReturnType = {} as ReturnType;
    if (wiresMapNodes.length !== 0) {
      const parentNode = generateNodes({
        type: 'flow/flow-network',
        name: '',
        isParent: true,
        parentId: undefined,
        x: x,
        y: y
      })

      const check = wiresMapNodes.some(item => {
        return item.existingFlowNet === undefined
      })

      // check for the largest x value among existing nodes
      // new nodes will be placed to the right of the existing nodes
      let xTemp: number = 0
      let yTemp: number = 0
      if (window.hasOwnProperty('allFlow') && window.allFlow.hasOwnProperty('nodes')) {
        let largeX = 0
        window.allFlow.nodes.forEach((item: NodeInterface) => {
          if (item.position.x > largeX) {
            largeX = item.position.x
          }
        })
        xTemp = largeX + 200
      } else {
        xTemp = x
        yTemp = y
      }
      wiresMapNodes.forEach(item => {
        xTemp = xTemp + 200
        yTemp = yTemp + 200
        const resObj = addNewNodesEdges(item, item.existingFlowNet, parentNode, xTemp, yTemp);
        localNodes = [...localNodes, ...resObj.nodes]
        localEdges = [...localEdges, ...resObj.edges]
      })

      if (check) {
        res.localNodes = [...localNodes, parentNode];
        res.localEdges = localEdges;
      } else {
        res.localNodes = localNodes;
        res.localEdges = localEdges;
      }

      return res;
    }
  }

  return null;
}