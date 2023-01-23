import { Typography, Card, Select, Spin, Button } from "antd";
import { useState, useEffect } from "react";
import { ReloadOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useParams } from "react-router-dom";
import { model } from "../../../wailsjs/go/models";
import { PointsPaneOne } from "./views/pointsPaneOne";
import { PointsPaneTwo } from "./views/pointsPaneTwo";
import { MappingFactory } from "./factory";
import { FlowPointFactory } from '../../components/hosts/host/flow/points/factory';

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
    }, [connUUID, hostUUID]);

    const recordPoints = () => {
        const resObj: PointTableTypeRecord = {}
        resObj['pointOne'] = filterForFullObj(pointList, selectedPointsOne)
        resObj['pointTwo'] = filterForFullObj(pointList, selectedPointsTwo)

        setPointConnections(resObj)
        console.log(resObj)
    }

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