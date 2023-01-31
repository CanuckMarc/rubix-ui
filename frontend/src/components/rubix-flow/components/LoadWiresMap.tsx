import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useStore } from '../../../App';

import { Edge, useEdges, useNodes, useReactFlow } from "react-flow-renderer/nocss";
import { NodeInterface, OutputNodeValueType } from "../lib/Nodes/NodeInterface";
import { handleGetSettingType } from "../util/handleSettings";
import { useNodesSpec, convertDataSpec, getNodeSpecDetail } from "../use-nodes-spec";
import { NodeSpecJSON } from "../lib";
import { generateUuid } from "../lib/generateUuid";

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
    const [wiresMapNodes, wiresMapEdge, setWiresMapNodes, setWiresMapEdge] = useStore(
        (state) => [state.wiresMapNodes, state.wiresMapEdge, state.setWiresMapNodes, state.setWiresMapEdge]
    )

    // const wiresMapNodes = useStore(state => state.wiresMapNodes)

    const [nodesSpec] = useNodesSpec();
    const flowInstance = useReactFlow();

    useEffect(() => {
        if (Object.keys(wiresMapNodes).length !== 0) {
          renderPointsToFlowEditor();
          setWiresMapNodes({});
        }
    }, [])

    const renderPointsToFlowEditor = () => {
        const points: any = wiresMapNodes
        const newNodes: NodeInterface[] = [];

        const x = getRandomArbitrary(-200, 200)
        const y = getRandomArbitrary(-200, 200)

        // generate new nodes
        const parentNode = generateNodes({
          type: 'flow/flow-network',
          name: '',
          isParent: true,
          parentId: undefined,
          x: x,
          y: y
        })
        newNodes.push(parentNode)

        const nodeSpecs: NodeGenInputType[] = [
          {
            type: 'flow/flow-point',
            name: points.pointOne?.name || '',
            isParent: false,
            parentId: parentNode.id,
            x: x,
            y: y
          }, 
          {
            type: 'flow/flow-point-write',
            name: points.pointTwo?.name || '',
            isParent: false,
            parentId: parentNode.id,
            x: x + 800,
            y: y
          }
        ]

        // generate new edge
        let nodeIds: string[] = []
        nodeSpecs.forEach((item: NodeGenInputType) => {
          const node = generateNodes(item)
          nodeIds.push(node.id)
          newNodes.push(node)
        })

        const newEdge: Edge = {
          id: generateUuid(),
          source: nodeIds[0],
          sourceHandle: "out",
          target: nodeIds[1],
          targetHandle: "in16"
        }

        // set new nodes and edges into flow editor
        if (newNodes.length > 0) {
          setTimeout(() => {
            const oldNodes = flowInstance.getNodes();
            console.log('oldNodes are: ', oldNodes)
            flowInstance.setNodes([...oldNodes, ...newNodes]);
            console.log('newNodes are: ', [...oldNodes, ...newNodes])
            
            const oldEdges = flowInstance.getEdges();
            console.log('oldEdges are: ', oldEdges)
            flowInstance.setEdges([...oldEdges, newEdge]);
            console.log('newEdges are: ', [...oldEdges, newEdge])
          }, 500);
        }
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