import { Button, Modal, Table, Spin, Space, Switch, Input, Descriptions, Empty } from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BACnetFactory } from "../factory";
import { ReloadOutlined, EditOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { system } from "../../../../../../wailsjs/go/models";
import type { ColumnsType } from 'antd/es/table';

interface BACnetConfig {
  server_name: string;
  port: number;
    mqtt: MqttConfig;
    iface: string;
    device_id: number;
    ai_max: number;
    ao_max: number;
    av_max: number;
    bi_max: number;
    bo_max: number;
    bv_max: number;
}

interface MqttConfig {
    broker_ip: string;
    broker_port: number;
    debug: boolean;
    enable: boolean;
    retry_enable: boolean;
    retry_interval: number;
    retry_limit: number;
    write_via_subscribe: boolean
}

export const Bacnet = () => {
    const { connUUID = "", hostUUID = "" } = useParams();
    const [modalOpen, setModalOpen] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [configData, setConfigData] = useState({} as BACnetConfig)


    const factory = new BACnetFactory()

    useEffect(() => {
        fetch();
    }, [])

    const fetch = async() => {
        try {
            setIsFetching(true)
            const res = await factory.BACnetReadConfig(connUUID, hostUUID)
            if (res) {
                console.log(res)
                setConfigData(res)
            }

        } catch (err) {
            console.log('err is:', err)
        } finally {
            setIsFetching(false)
        }
    }

    const handleEditClick = () => {
        setModalOpen(true)
    }

    const handleReloadClick = () => {
        fetch()
    }

    const handleOk = () => {
        setModalOpen(false)
    }
    
    const handleCancel = () => {
        setModalOpen(false)
    }

    return (
        <>
            <div id="bacnet-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <Space direction="horizontal">
                    <Button type="primary" icon={<ReloadOutlined />} onClick={handleReloadClick}>Refresh</Button>
                    <Button type="primary" icon={<EditOutlined />} onClick={handleEditClick}>Edit</Button>
                </Space>

                <Spin spinning={isFetching} style={{ width: '100%' }}>
                    {Object.keys(configData).length != 0 ? (
                        <Descriptions title="BACnet configurations" bordered>
                            <Descriptions.Item label="server_name">{configData.server_name}</Descriptions.Item>
                            <Descriptions.Item label="port">{configData.port}</Descriptions.Item>
                            <Descriptions.Item label="iface">{configData.iface}</Descriptions.Item>
                            <Descriptions.Item label="device_id">{configData.device_id}</Descriptions.Item>
                            <Descriptions.Item label="bv_max">{configData.bv_max}</Descriptions.Item>
                            <Descriptions.Item label="bo_max">{configData.bo_max}</Descriptions.Item>
                            <Descriptions.Item label="bi_max">{configData.bi_max}</Descriptions.Item>
                            <Descriptions.Item label="av_max">{configData.av_max}</Descriptions.Item>
                            <Descriptions.Item label="ao_max">{configData.ao_max}</Descriptions.Item>
                            <Descriptions.Item label="ai_max">{configData.ai_max}</Descriptions.Item>
                            
                            <Descriptions.Item label="MQTT">
                                broker_ip: {configData.mqtt.broker_ip}
                                <br />
                                broker_port: {configData.mqtt.broker_port}
                                <br />
                                debug: {configData.mqtt.debug ? 'true' : 'false'}
                                <br />
                                enable: {configData.mqtt.enable ? 'true' : 'false'}
                                <br />
                                retry_enable: {configData.mqtt.retry_enable ? 'true' : 'false'}
                                <br />
                                retry_interval: {configData.mqtt.retry_interval}
                                <br />
                                retry_limit: {configData.mqtt.retry_limit}
                                <br />
                                write_via_subscribe: {configData.mqtt.write_via_subscribe ? 'true' : 'false'}
                                <br />
                            </Descriptions.Item>
                        </Descriptions>
                    ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                </Spin>

            </div>


            <Modal title="Edit BACnet Configurations" visible={modalOpen} onOk={handleOk} onCancel={handleCancel}>
             
            </Modal>
        </>
    );
};
