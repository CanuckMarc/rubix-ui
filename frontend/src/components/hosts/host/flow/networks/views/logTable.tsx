import { useEffect, useState } from "react";
import { Spin, Table, Button, Modal } from "antd";
import { FlowPluginFactory } from "../../plugins/factory";
import { LogTablePropType } from "./table";

export const LogTable = (props: LogTablePropType) => {
    let { connUUID, hostUUID, pluginName, isLogTableOpen, setIsLogTableOpen} = props
    const [isFetching, setIsFetching] = useState(false);
    const [allLogs, setAllLogs] = useState<object[]>([]);

    const flowPluginFactory = new FlowPluginFactory();
    flowPluginFactory.connectionUUID = connUUID;
    flowPluginFactory.hostUUID = hostUUID;

    useEffect(() => {
        if (isLogTableOpen) {
            fetch();
        }
    }, [isLogTableOpen])

    const fetch = async () => {
        try {
            setIsFetching(true)
            const logs = await flowPluginFactory.FlowNetworkNewLog(connUUID, hostUUID, pluginName!, 10)
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

    const handleRefreshButtonClicked = () => {
        fetch();
    }

    const handleOk = () => {
        setAllLogs([])
        setIsLogTableOpen(false)
    }

    const handleCancel = () => {
        setAllLogs([])
        setIsLogTableOpen(false)
    }


    return (
        <>
            <Modal title="Log table" visible={isLogTableOpen} onOk={handleOk} onCancel={handleCancel} width={'70vw'}>
                    <div style={{display: 'flex', flexDirection: 'column', alignContent: 'flex-start', gap: '2vh'}}>
                        <Button type="primary" style={{width: '6vw'}} onClick={handleRefreshButtonClicked}>Refresh</Button>
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