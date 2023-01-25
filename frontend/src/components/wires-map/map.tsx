import { Typography, Card, Select, Spin, Button } from "antd";
import { useState, useEffect } from "react";
import { ReloadOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useParams } from "react-router-dom";
import { model } from "../../../wailsjs/go/models";
import { PointsPaneOne } from "./views/pointsPaneOne";
import { PointsPaneTwo } from "./views/pointsPaneTwo";
import { MappingFactory } from "./factory";
import { FlowPointFactory } from '../../components/hosts/host/flow/points/factory';
import { useStore } from '../../App';

import { Edge, useEdges, useNodes, useReactFlow } from "react-flow-renderer/nocss";
import { NodeInterface, OutputNodeValueType } from "../rubix-flow/lib/Nodes/NodeInterface";
import { handleGetSettingType } from "../rubix-flow/util/handleSettings";
import { useNodesSpec, convertDataSpec, getNodeSpecDetail } from "../rubix-flow/use-nodes-spec";
import { NodeSpecJSON } from "../rubix-flow/lib";
import { generateUuid } from "../rubix-flow/lib/generateUuid";

const { Title } = Typography;

export interface PointTableType {
    key: string;
    name: string;
    uuid: string;
}

export interface PointTableTypeRecord {
    [key: string]: model.Point
 }

const filterForFullObj = (pointList: model.Point[], selectedPoints: PointTableType[]) => {
    const filteredPoint = pointList.filter(item => {
        if (item.uuid === selectedPoints[0].uuid) {
            return item
        }
    })
    return filteredPoint[0]
}

export const WiresMap = () => {
    let { connUUID = "", hostUUID = "" } = useParams();
    const [isFetching, setIsFetching] = useState(false);
    const [pointList, setPointList] = useState<model.Point[]>([]);
    const [selectedPointsOne, setSelectedPointsOne] = useState<PointTableType[]>([]);
    const [selectedPointsTwo, setSelectedPointsTwo] = useState<PointTableType[]>([]);
    const [pointConnections, setPointConnections] = useState<PointTableTypeRecord>({});

    // const mappingFactory = new MappingFactory();
    const pointFactory = new FlowPointFactory();


    // const getVotes = useStore(state => state.votes);
    const [votes, setVotes] = useStore(
        (state) => [state.votes, state.setVotes]
    )



    const fetch = async() => {
        try {
            setIsFetching(true);
            const pointRes = await pointFactory.GetAll();
            console.log(pointRes)
            setPointList(pointRes);

            // const flowNetRes = await mappingFactory.GetNodesAllFlowNetworks(connUUID, hostUUID, true)
            // console.log(flowNetRes)
        } catch (error) {
            setPointList([]);
        } finally {
            setIsFetching(false);
        }
    }

    useEffect(() => {
        pointFactory.connectionUUID = connUUID;
        pointFactory.hostUUID = hostUUID;
        fetch();
        // console.log('the stored value is: ', votes)
    }, [connUUID, hostUUID]);

    const recordPoints = () => {
        const resObj: PointTableTypeRecord = {}
        resObj['pointOne'] = filterForFullObj(pointList, selectedPointsOne)
        resObj['pointTwo'] = filterForFullObj(pointList, selectedPointsTwo)

        setPointConnections(resObj)
        console.log(resObj)
        setVotes(10);
    }

    // const renderPointsToFlowEditor = () => {
    //     const allNodes: NodeInterface[] = [];
    //     const node = generateNodes()
    //     allNodes.push(node)

    //     if (allNodes.length > 0) {
    //         setTimeout(() => {
    //           flowInstance.addNodes(allNodes);
    //         }, 50);
    //     }
    // }

    // const generateNodes = () => {
    //     const nodeSettings = handleGetSettingType(connUUID, hostUUID, !!connUUID && !!hostUUID, 'constant/const-num');
    //     const spec: NodeSpecJSON = getNodeSpecDetail(nodesSpec, 'constant/const-num');

    //     return {
    //         id: generateUuid(),
    //         isParent: false,
    //         // style: null,
    //         type: 'constant/const-num',
    //         info: { nodeName: 'my_first_node' },
    //         position: {
    //           x: 269.99187629189623,
    //           y: -46.35749312825459,
    //         },
    //         data: {
    //           inputs: convertDataSpec(spec.inputs || []),
    //           out: convertDataSpec(spec.outputs || []),
    //         },
    //         // parentId: parentNode.id,
    //         settings: nodeSettings,
    //         selected: false,
    //         pin: 'in',
    //       };
    // }

    return (
        <>
            <Title level={3} style={{ textAlign: "left" }}>
                Wires Map
            </Title>
            <Card bordered={false}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '2vw'}}>
                    <div style={{display: 'flex', flexDirection: 'row', gap: '2vw', alignItems: 'center'}}>
                        <span>Select flow network:</span>
                        <Select
                            mode="multiple"
                            allowClear
                            style={{ width: '50%' }}
                            placeholder="Please select"
                            defaultValue={['a10', 'c12']}
                            // onChange={handleChange}
                            // options={options}
                        />
                    </div>
                    <Spin spinning={isFetching} style={{ width: '100%' }}>
                        <div style={{display: 'flex', flexDirection: 'row', gap: '2vw', alignItems: 'center', justifyContent: 'space-around'}}>
                            <PointsPaneOne pointList={pointList} selectedPoints={selectedPointsTwo} setSelectedPoints={setSelectedPointsOne}/>
                            <PointsPaneTwo pointList={pointList} selectedPoints={selectedPointsOne} setSelectedPoints={setSelectedPointsTwo}/>
                        </div>
                    </Spin>
                    <Button type="primary" icon={<PlusOutlined />} onClick={recordPoints} style={{width: '8vw'}}>Generate</Button>
                </div>
            </Card>
        </>
    );
}

export default WiresMap;