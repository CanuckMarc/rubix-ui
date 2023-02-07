import { ChangeEvent, useEffect, useState } from "react";
import { Spin, Table, Button, Modal, Input, Typography, Tag, DatePicker, Form } from "antd";
import { SearchOutlined } from '@ant-design/icons';
import { FlowPluginFactory } from "../../plugins/factory";
import { LogTablePropType } from "./table";
import type { ColumnsType, ColumnType } from 'antd/es/table';
import type { FilterConfirmProps } from 'antd/es/table/interface';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export interface LogTableType {
    key: number;
    time: string;
    level: string;
    msg: string;
}

export const LogTable = (props: LogTablePropType) => {
    let { connUUID, hostUUID, pluginName, isLogTableOpen, setIsLogTableOpen} = props
    const [isFetching, setIsFetching] = useState(false);
    const [allLogs, setAllLogs] = useState<LogTableType[]>([]);
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
                    let tableItem: any = {};
                    const remainderMsg = item.split(' ').splice(3, item.split(' ').length).join(' ')
                    item.split(' ').splice(0, 3).forEach((el: string, index: number) => {
                        const [name, value] = el.split('=')
                        tableItem['key'] = i
                        index === 2 ? tableItem[name] = value + ' ' + remainderMsg : tableItem[name] = value
                    });
                    return tableItem
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
          title: "Time",
          dataIndex: "time",
          key: "time"
        },
        {
          title: "Level",
          dataIndex: "level",
          key: "key",
          render: (level: any) => {
            let colour = "blue";
            if (level === 'error') {
              colour = "red";
            }
            return <Tag color={colour}>{level}</Tag>;
          }
        },
        {
          title: "Message",
          dataIndex: "msg",
          key: "msg"
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