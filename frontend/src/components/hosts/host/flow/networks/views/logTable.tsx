import { ChangeEvent, useEffect, useState } from "react";
import { Spin, Table, Button, Modal, Input, Typography } from "antd";
import { FlowPluginFactory } from "../../plugins/factory";
import { LogTablePropType } from "./table";

const { Title } = Typography;

export const LogTable = (props: LogTablePropType) => {
    let { connUUID, hostUUID, pluginName, isLogTableOpen, setIsLogTableOpen} = props
    const [isFetching, setIsFetching] = useState(false);
    const [allLogs, setAllLogs] = useState<object[]>([]);
    const [duration, setDuration] = useState<number | undefined>(undefined);

    const flowPluginFactory = new FlowPluginFactory();
    flowPluginFactory.connectionUUID = connUUID;
    flowPluginFactory.hostUUID = hostUUID;

    const fetch = async (duration: number) => {
        try {
            setIsFetching(true)
            const logs = await flowPluginFactory.FlowNetworkNewLog(connUUID, hostUUID, pluginName!, duration)
            if (logs) {
                let i = 0;
                setAllLogs(logs.message.map((item: any) => {
                    i++;
                    return {
                        message: item,
                        key: i
                    }
                }))
            }
        } catch (error) {
            console.log('error fetching logs: ', error)
        } finally {
            setIsFetching(false)
        }
    }

    const columns = [
        {
          title: "Logs",
          dataIndex: "message",
          key: "key",
        },
    ];

    const handleLoadButtonClicked = () => {
        if (duration) {
            setAllLogs([]);
            fetch(duration);
        }
    }

    const handleOk = () => {
        setAllLogs([])
        setIsLogTableOpen(false)
    }

    const handleCancel = () => {
        setAllLogs([])
        setIsLogTableOpen(false)
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value !== '') {
            setDuration(parseInt(event.target.value))
        } else {
            setDuration(undefined)
        }
    }


    return (
        <>
            <Modal title="Log table" visible={isLogTableOpen} onOk={handleOk} onCancel={handleCancel} width={'70vw'}>
                    <div style={{display: 'flex', flexDirection: 'column', alignContent: 'flex-start', gap: '2vh'}}>
                        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5vw'}}>
                            <Title level={5}>Duration: </Title>
                            <Input value={duration} onChange={handleInputChange} style={{width: '6vw'}}/>
                            <Button type="primary" style={{width: '6vw'}} disabled={duration === undefined} onClick={handleLoadButtonClicked}>Load Logs</Button>
                        </div>
                        <Table
                            rowKey="uuid"
                            dataSource={allLogs}
                            columns={columns}
                            pagination={{
                                position: ["bottomLeft"],
                                showSizeChanger: true,
                                pageSizeOptions: [10, 50, 100, 1000],
                                locale: { items_per_page: "" },
                            }}
                            loading={{ indicator: <Spin />, spinning: isFetching }}
                        />
                    </div>
            </Modal>
        </>
    );
}