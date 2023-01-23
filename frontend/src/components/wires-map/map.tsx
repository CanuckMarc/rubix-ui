import { Typography, Card, Select, Spin } from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { model } from "../../../wailsjs/go/models";
import { PointsPane } from "./views/pointsPane";
import { MappingFactory } from "./factory";
import { FlowPointFactory } from '../../components/hosts/host/flow/points/factory';

const { Title } = Typography;

export const WiresMap = () => {
    let { connUUID = "", hostUUID = "" } = useParams();
    const [isFetching, setIsFetching] = useState(false);
    const [data, setData] = useState<model.Point[]>([]);

    // const mappingFactory = new MappingFactory();
    const pointFactory = new FlowPointFactory();

    const fetch = async() => {
        try {
            setIsFetching(true);
            const pointRes = await pointFactory.GetAll();
            console.log(pointRes)
            setData(pointRes);

            // const flowNetRes = await mappingFactory.GetNodesAllFlowNetworks(connUUID, hostUUID, true)
            // console.log(flowNetRes)
        } catch (error) {
            setData([]);
        } finally {
            setIsFetching(false);
        }
    }

    useEffect(() => {
        pointFactory.connectionUUID = connUUID;
        pointFactory.hostUUID = hostUUID;
        fetch();
    }, [connUUID, hostUUID]);

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
                            <PointsPane title={'Point 1 name'} pointList={data}/>
                            {/* <PointsPane title={'Point 2 name'} pointList={data}/> */}
                        </div>
                    </Spin>
                </div>
            </Card>
        </>
    );
}

export default WiresMap;