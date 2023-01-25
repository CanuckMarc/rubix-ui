import { Typography, Card, Select, Spin, Button } from "antd";
import { useState, useEffect } from "react";
import { ReloadOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useParams } from "react-router-dom";
import { useStore } from '../../../App';

import { Edge, useEdges, useNodes, useReactFlow } from "react-flow-renderer/nocss";
import { NodeInterface, OutputNodeValueType } from "../lib/Nodes/NodeInterface";
import { handleGetSettingType } from "../util/handleSettings";
import { useNodesSpec, convertDataSpec, getNodeSpecDetail } from "../use-nodes-spec";
import { NodeSpecJSON } from "../lib";
import { generateUuid } from "../lib/generateUuid";



export const TestComponent = () => {
    let { connUUID = "", hostUUID = "" } = useParams();
    // const [isFetching, setIsFetching] = useState(false);
    // const [pointList, setPointList] = useState<model.Point[]>([]);
    // const [selectedPointsOne, setSelectedPointsOne] = useState<PointTableType[]>([]);
    // const [selectedPointsTwo, setSelectedPointsTwo] = useState<PointTableType[]>([]);
    // const [pointConnections, setPointConnections] = useState<PointTableTypeRecord>({});
    const getVotes = useStore(state => state.votes);
    const [nodesSpec] = useNodesSpec();
    const flowInstance = useReactFlow();

    useEffect(() => {
        renderPointsToFlowEditor();
        console.log(getVotes)
    }, [getVotes])


    // useEffect(() => {
    //     console.log(pointConnections)
    // }, [pointConnections])


    const renderPointsToFlowEditor = () => {
        const allNodes: NodeInterface[] = [];
        const node = generateNodes()
        allNodes.push(node)

        if (allNodes.length > 0) {
            setTimeout(() => {
              flowInstance.addNodes(allNodes);
            }, 500);
        }
    }

    const generateNodes = () => {
        const nodeSettings = handleGetSettingType(connUUID, hostUUID, !!connUUID && !!hostUUID, 'constant/const-num');
        const spec: NodeSpecJSON = getNodeSpecDetail(nodesSpec, 'constant/const-num');

        return {
            id: generateUuid(),
            isParent: false,
            // style: null,
            type: 'constant/const-num',
            info: { nodeName: 'my_first_node' },
            position: {
              x: 269.99187629189623,
              y: -46.35749312825459,
            },
            data: {
              inputs: convertDataSpec(spec.inputs || []),
              out: convertDataSpec(spec.outputs || []),
            },
            // parentId: parentNode.id,
            settings: nodeSettings,
            selected: false,
            pin: 'in',
          };
    }

    return (
        <>
            
        </>
    );
}