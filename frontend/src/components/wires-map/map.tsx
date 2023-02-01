import { Typography, Card, Select, Spin, Button } from "antd";
import { useState, useEffect } from "react";
import { PlusOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from "react-router-dom";
import { PointsPane } from "./views/pointsPane";
import { MappingFactory } from "./factory";
import { FlowPointFactory } from '../../components/hosts/host/flow/points/factory';
import { useStore, PointTableTypeRecord, PointTableType } from '../../App';
import { ROUTES } from "../../constants/routes";
import { node } from "../../../wailsjs/go/models";

const { Title } = Typography;

export interface FlowNetOptionType {
    value: string;
    label: string;
}

const filterForFullObj = (pointList: PointTableType[], selectedPoints: PointTableType) => {
    const filteredPoint = pointList.filter(item => {
        if (item.uuid === selectedPoints.uuid) {
            return item
        }
    })
    return filteredPoint[0]
}

export const WiresMap = () => {
    let { connUUID = "", hostUUID = "" } = useParams();
    const nav = useNavigate();
    const [isFetching, setIsFetching] = useState(false);
    const [pointList, setPointList] = useState<PointTableType[]>([]);
    const [flowNetList, setFlowNetList] = useState<node.Schema[]>([]);
    const [flowNetOptionList, setFlowNetOptionList] = useState<FlowNetOptionType[]>([]);
    const [selectedFlowNet, setSelectedFlowNet] = useState<node.Schema | undefined>(undefined);
    const [selectedPointsOne, setSelectedPointsOne] = useState<PointTableType>({} as PointTableType);
    const [selectedPointsTwo, setSelectedPointsTwo] = useState<PointTableType>({} as PointTableType);

    const mappingFactory = new MappingFactory();
    const pointFactory = new FlowPointFactory();

    // const isRemote = !!connUUID && !!hostUUID;

    const [wiresMapNodes, existingFlowNet, setWiresMapNodes, setExistingFlowNet] = useStore(
        (state) => [state.wiresMapNodes, state.existingFlowNet, state.setWiresMapNodes, state.setExistingFlowNet]
    )

    const fetch = async() => {
        try {
            setIsFetching(true);
            const res = await pointFactory.GetPointListPayload(connUUID, hostUUID);
            setPointList(res.map(item => ({
                key: item.uuid,
                name: item.name,
                uuid: item.uuid
            })));
            // TODO: this func only works when isRemote is false
            const flowNetRes = await mappingFactory.GetNodesAllFlowNetworks(connUUID, hostUUID, false)
            if (flowNetRes) {
                setFlowNetList(flowNetRes)
                setFlowNetOptionList(flowNetRes.map((item: any) => ({
                    value: item.id,
                    label: item.hasOwnProperty('nodeName') ? item.nodeName : item.id
                })))
            }
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
    }, [connUUID, hostUUID]);

    const recordPoints = () => {
        const resObj = {} as PointTableTypeRecord
        resObj['pointOne'] = filterForFullObj(pointList, selectedPointsOne)
        resObj['pointTwo'] = filterForFullObj(pointList, selectedPointsTwo)

        setWiresMapNodes([resObj])
        setExistingFlowNet(selectedFlowNet)
        nav(ROUTES.RUBIX_FLOW)
    }

    const handleChange = (value: string | string[]) => {
        setSelectedFlowNet(flowNetList.find((item: node.Schema) => {
            return item.id === value
        } ));
    };


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
                            allowClear
                            style={{ width: '50%' }}
                            placeholder="Please select"
                            onChange={handleChange}
                            options={flowNetOptionList}
                        />
                    </div>
                    <Spin spinning={isFetching} style={{ width: '100%' }}>
                        <div style={{display: 'flex', flexDirection: 'row', gap: '2vw', alignItems: 'center', justifyContent: 'space-around'}}>
                            <PointsPane pointList={pointList} selectedPoints={selectedPointsTwo} setSelectedPoints={setSelectedPointsOne}/>
                            <PointsPane pointList={pointList} selectedPoints={selectedPointsOne} setSelectedPoints={setSelectedPointsTwo}/>
                        </div>
                    </Spin>
                    <Button type="primary" icon={<PlusOutlined />} onClick={recordPoints} style={{width: '8vw'}}>Generate</Button>
                </div>
            </Card>
        </>
    );
}

export default WiresMap;
