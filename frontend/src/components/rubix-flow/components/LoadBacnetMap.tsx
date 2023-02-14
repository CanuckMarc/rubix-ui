import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useBacnetStore, useIsLoading } from '../../../App';
import { Edge, useReactFlow } from "react-flow-renderer/nocss";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { handleGetSettingType } from "../util/handleSettings";
import { useNodesSpec, convertDataSpec, getNodeSpecDetail } from "../use-nodes-spec";
import { NodeSpecJSON, InputSocketSpecJSON } from "../lib";
import { generateUuid } from "../lib/generateUuid";
import { node } from "../../../../wailsjs/go/models";
import { openNotificationWithIcon } from "../../../utils/utils";
import { BacnetTableDataType } from "../../wires-map/map";

type NodeGenInputType = {
  type: string;
  isParent: boolean;
  parentId: string | undefined;
  x: number;
  y: number;
  topic: string | undefined;
  name: string | undefined;
  instanceNumber: number | undefined;
  pointName: string | undefined;
}

function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const xRand = getRandomArbitrary(-200, 200)
const yRand = getRandomArbitrary(-200, 200)

export const LoadBacnetMap = () => {
    let { connUUID = "", hostUUID = "" } = useParams();
    const [newNodes, setNewNodes] = useState<NodeInterface[]>([]);
    const [newEdges, setNewEdges] = useState<Edge[]>([]);

    const [bacnetNodes, setBacnetNodes] = useBacnetStore(
        (state) => [state.bacnetNodes, state.setBacnetNodes]
      )
    const [refreshCounter, reset, setIsLoadingRubixFlow] = useIsLoading(
      (state) => [state.refreshCounter, state.reset, state.incrementRefreshCounter]
    )

    const [nodesSpec] = useNodesSpec();
    const flowInstance = useReactFlow();

    useEffect(() => {
      let localNodes: NodeInterface[] = [];
      let localEdges: Edge[] = [];
      if (bacnetNodes.length !== 0) {
        let xTemp: number = xRand
        let yTemp: number = yRand

        if (window.hasOwnProperty('allFlow') && window.allFlow.hasOwnProperty('nodes')) {
          let largeX = 0
          window.allFlow.nodes.forEach((item: NodeInterface) => {
            if (item.position.x > largeX) {
              largeX = item.position.x
            }
          })
          xTemp = largeX + 400
        }

        bacnetNodes.forEach((item: BacnetTableDataType) => {
          xTemp = xTemp + 400
          yTemp = yTemp + 400
          const resObj = addNewNodesEdges(item, xTemp, yTemp);
          localNodes = [...localNodes, ...resObj.nodes]
          localEdges = [...localEdges, ...resObj.edges]
        })
        
        setNewNodes(localNodes);
        setNewEdges(localEdges);
      }
    }, [])

    useEffect(() => {
      // it takes two refreshes for rubix-flow panel to get ready when navigate to the WIRES_MAP_REMOTE link defined in ROUTE
      // Therefore, it is safe to add new nodes to the flow component after 2 refreshes are done 
      if (refreshCounter === 2) {     
        openNotificationWithIcon("success", 'Rubix flow loading complete!');
        if (bacnetNodes.length !== 0) {
          renderPointsToFlowEditor(newNodes, newEdges);
          setBacnetNodes([]);
        }
      }
    }, [refreshCounter])

    const addNewNodesEdges = (setOfNodesToAdd: BacnetTableDataType, x: number, y: number) => {
      const nodes: NodeInterface[] = [];
      let edges: Edge[] = [];

      // generate new nodes
      const nodeSpecs: NodeGenInputType[] = [
        {
          type: 'flow/flow-point',
          name: setOfNodesToAdd.selectedPointName || undefined,
          isParent: false,
          parentId: setOfNodesToAdd.flownetSchema.id,
          x: x,
          y: y,
          topic: undefined,
          instanceNumber: undefined,
          pointName: setOfNodesToAdd.selectedPointName
        }, 
        {
          type: 'link/link-input-number',
          name: undefined,
          isParent: false,
          parentId: setOfNodesToAdd.flownetSchema.id,
          x: x + 800,
          y: y,
          topic: setOfNodesToAdd.outputTopic,
          instanceNumber: undefined,
          pointName: undefined
        },
        {
          type: 'link/link-output-number',
          name: undefined,
          isParent: false,
          parentId: setOfNodesToAdd.bacnetServerInterface.id,
          x: x,
          y: y,
          topic: setOfNodesToAdd.outputTopic,
          instanceNumber: undefined,
          pointName: undefined
        },
        {
          type: 'bacnet/analog-variable',
          name: undefined,
          isParent: false,
          parentId: setOfNodesToAdd.bacnetServerInterface.id,
          x: x + 800,
          y: y,
          topic: undefined,
          instanceNumber: setOfNodesToAdd.instanceNumber,
          pointName: undefined
        }
      ]

      let nodeIds: string[] = []
      nodeSpecs.forEach((item: NodeGenInputType) => {
        const node = generateNodes(item)
        nodeIds.push(node.id)
        nodes.push(node)
      })

      // generate new edge
      const flownetEdge: Edge = {
        id: generateUuid(),
        source: nodeIds[0],
        sourceHandle: "output",
        target: nodeIds[1],
        targetHandle: "input"
      }
      const bacnetEdge: Edge = {
        id: generateUuid(),
        source: nodeIds[2],
        sourceHandle: "output",
        target: nodeIds[3],
        targetHandle: "in15"
      }
      edges = [flownetEdge, bacnetEdge];

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

      let updatedSettings: any = {}
      if (!item.pointName && item.topic && !item.instanceNumber) {
        updatedSettings = {...nodeSettings, topic: item.type === 'link/link-output-number' ? `num-${item.topic}` : item.topic}
      } else if (!item.pointName && !item.topic && item.instanceNumber) {
        updatedSettings = {...nodeSettings}
        updatedSettings["instance-number"] = item.instanceNumber;
      } else if (item.pointName && !item.topic && !item.instanceNumber) {
        updatedSettings = {...nodeSettings, point: item.pointName}
      } else {
        updatedSettings = {...nodeSettings}
      }

      return {
        id: generateUuid(),
        isParent: item.isParent,
        type: item.type,
        info: { nodeName: item.name ? item.name : ''},
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
        settings: updatedSettings,
        selected: false,
      };
    }

    return null;
}