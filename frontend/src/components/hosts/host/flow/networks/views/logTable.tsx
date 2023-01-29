import { useEffect, useState } from "react";
import { Layout, Spin, Table, Card, Button, Modal } from "antd";
import { Link, useParams } from "react-router-dom";
import { Typography } from 'antd';
import { FlowPluginFactory } from "../../plugins/factory";
import { LogTablePropType } from "./table";
import { streamlog } from "../../../../../../../wailsjs/go/models";

const { Title } = Typography;

//props: LogTablePropType

export const LogTable = (props: LogTablePropType) => {
    let { connUUID, hostUUID, pluginName, isLogTableOpen, setIsLogTableOpen} = props
    // let { connUUID = "", hostUUID = "", pluginName = ""} = useParams();
    const [isFetching, setIsFetching] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [logsObj, setLogsObj] = useState<streamlog.Log | {}>({});
    const [allLogs, setAllLogs] = useState<object[]>([]);

    const flowPluginFactory = new FlowPluginFactory();
    flowPluginFactory.connectionUUID = connUUID;
    flowPluginFactory.hostUUID = hostUUID;

    useEffect(() => {
        // const sider = window.document.getElementById('sidebarMenu')
        // console.log(sider)
        // if (sider) {
        //     console.log(sider.style.display)
        //     if (sider.style.display === "none") {
        //         sider.style.display = "block";
        //     } else {
        //         sider.style.display = "none";
        //     }
        // }
        if (isLogTableOpen) {
            fetch();
        }
    }, [isLogTableOpen])

    const fetch = async () => {

        try {
            setIsFetching(true)
            // console.log('logNetwork is: ', props.logNetwork)
            // props.logNetwork!.plugin_name!
            const logs = await flowPluginFactory.FlowNetworkNewLog(connUUID, hostUUID, pluginName!, 10)
            if (logs) {
                // console.log(logs)
                // setLogsObj(logs)
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


    // const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    //     // console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    //     setSelectedRowKeys(newSelectedRowKeys);
    // };
    
    // const rowSelection = {
    //     selectedRowKeys,
    //     onChange: onSelectChange,
    // };

    const handleCloseButtonClicked = () => {
        console.log('clicked!')
        window.close();
    }

    const handleRefreshButtonClicked = () => {
        fetch();
    }

    const handleOk = () => {
        setIsLogTableOpen(false)
    }

    const handleCancel = () => {
        setIsLogTableOpen(false)
    }


    return (
        <>
            <Modal title="Log table" visible={isLogTableOpen} onOk={handleOk} onCancel={handleCancel} width={'60vw'}>
                {/* <Title style={{ textAlign: "left" }}>Log table</Title> */}
                {/* <Card bordered={false}> */}
                    <div style={{display: 'flex', flexDirection: 'column', alignContent: 'flex-start', gap: '2vh'}}>
                        {/* <div style={{display: 'flex', flexDirection: 'row', gap: '2vh'}}>
                            <Button type="primary" danger={true} style={{width: '6vw'}} onClick={handleCloseButtonClicked}>Close Log</Button>
                        </div> */}
                        <Button type="primary" style={{width: '6vw'}} onClick={handleRefreshButtonClicked}>Refresh</Button>
                        <Table
                            rowKey="uuid"
                            // rowSelection={rowSelection}
                            dataSource={allLogs}
                            columns={columns}
                            pagination={{
                                position: ["bottomLeft"],
                                showSizeChanger: true,
                                pageSizeOptions: [10, 50, 100, 1000],
                                locale: { items_per_page: "" },
                            }}
                            // scroll={{ y: 'auto' }}
                            loading={{ indicator: <Spin />, spinning: isFetching }}
                        />
                    </div>
                {/* </Card> */}
            </Modal>
        </>
    );
}