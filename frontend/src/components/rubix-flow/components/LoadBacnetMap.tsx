import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useBacnetStore, useIsLoading } from '../../../App';

import { Edge, useReactFlow } from "react-flow-renderer/nocss";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { handleGetSettingType } from "../util/handleSettings";
import { useNodesSpec, convertDataSpec, getNodeSpecDetail } from "../use-nodes-spec";
import { NodeSpecJSON } from "../lib";
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
  // instanceNumber: number | undefined;
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

        bacnetNodes.forEach((item: BacnetTableDataType) => {
          if (item.bacnetSchema.metadata?.positionX && item.bacnetSchema.metadata?.positionY) {
            xTemp = parseFloat(item.bacnetSchema.metadata?.positionX) - 500
            yTemp = parseFloat(item.bacnetSchema.metadata?.positionY)
          }
          const resObj = addNewNodesEdges(item, item.bacnetSchema, xTemp, yTemp);
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
          // replace existing 'analog-variable' nodes with copies that are amended with new settings
          let modifiedExistingNode = [] as NodeInterface[]
          bacnetNodes.forEach((item: BacnetTableDataType) => {
            const filteredOldNodes = window.allFlow.nodes.filter((aNode: NodeInterface) => {
              if (aNode.id === item.bacnetSchema.id) {
                const copyObj = aNode
                copyObj["settings"]["instance-number"] = item.instanceNumber;
                modifiedExistingNode.push(copyObj);
                return false
              } else {
                return true
              }
            })
            flowInstance.setNodes(filteredOldNodes)
            window.allFlow.nodes = filteredOldNodes
          })
          renderPointsToFlowEditor([...newNodes, ...modifiedExistingNode], newEdges);
          setBacnetNodes([]);
        }
      }
    }, [refreshCounter])

    const addNewNodesEdges = (bacnetPoint: BacnetTableDataType, nodeToConnect: node.Schema, x: number, y: number) => {
      const nodes: NodeInterface[] = [];
      const edges: Edge[] = [];

      // generate new nodes
      const nodeSpecs: NodeGenInputType[] = [
        {
          type: 'link/link-output-number',
          isParent: false,
          parentId: nodeToConnect.parentId,
          x: x,
          y: y,
          topic: bacnetPoint.outputTopic
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
        target: nodeToConnect.id,
        targetHandle: "in15"
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
        info: {},
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
        settings: item.topic ? {...nodeSettings, topic: item.topic} : nodeSettings,
        selected: false,
      };
    }

    return null;
}