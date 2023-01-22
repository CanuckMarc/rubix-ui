import { Button, Modal, Spin, Space, Input, Descriptions, Empty, Form, Select, Divider, InputNumber } from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BACnetFactory } from "../factory";
import { assistcli } from "../../../../../../wailsjs/go/models";
import { ReloadOutlined, EditOutlined } from '@ant-design/icons';

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
    const [flatConfigData, setFlatConfigData] = useState({})
    const [form] = Form.useForm();


    const factory = new BACnetFactory()

    useEffect(() => {
        fetch();
    }, [])

    const fetch = async() => {
        try {
            setIsFetching(true)
            const res = await factory.BACnetReadConfig(connUUID, hostUUID)
            if (res) {
                setConfigData(res)
                const clone = structuredClone(res)
                delete clone.mqtt
                setFlatConfigData({...clone, ...res.mqtt})
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
    
    const handleCancel = () => {
        setModalOpen(false)
    }

    const handleFormFinish = async(values: any) => {        
        const mqtt: MqttConfig = {
            broker_ip: values.broker_ip,
            broker_port: values.broker_port,
            debug: values.debug,
            enable: values.enable,
            retry_enable: values.retry_enable,
            retry_interval: values.retry_interval,
            retry_limit: values.retry_limit,
            write_via_subscribe: values.write_via_subscribe
        }
        for (const prop in mqtt) {
            delete values[prop]
        }

        const config: assistcli.ConfigBACnetServer = {...values, mqtt}
        await factory.BACnetWriteConfig(connUUID, hostUUID, config)
        fetch()

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


            <Modal forceRender title="Edit BACnet Configurations" visible={modalOpen} onOk={form.submit} onCancel={handleCancel} bodyStyle={{maxHeight: '50vh'}} width='25vw'>
                <Form
                form={form}
                name="basic"
                autoComplete="off"
                initialValues={flatConfigData}
                style={{maxHeight: '40vh', overflowX: 'auto'}}
                labelCol={{
                    span: 10
                }}
                wrapperCol={{
                    span: 18
                }}
                onFinish={handleFormFinish}
                >
                    <Form.Item
                        label="server_name:"
                        name="server_name"
                        rules={[{ required: true, message: 'Please input server_name!' }]}
                    >
                        <Input style={{width: '10vw'}}/>
                    </Form.Item>

                    <Form.Item
                        label="port:"
                        name="port"
                        rules={[{ required: true, message: 'Please input port number!' }]}
                    >
                        <InputNumber style={{width: '10vw'}} />
                    </Form.Item>

                    <Form.Item
                        label="iface:"
                        name="iface"
                        rules={[{ required: true, message: 'Please input net interface!' }]}
                    >
                        <Input style={{width: '10vw'}}/>
                    </Form.Item>

                    <Form.Item
                        label="device_id:"
                        name="device_id"
                        rules={[{ required: true, message: 'Please input device_id!' }]}
                    >
                        <InputNumber style={{width: '10vw'}} />
                    </Form.Item>

                    <Form.Item
                        label="ai_max:"
                        name="ai_max"
                        rules={[{ required: true, message: 'Please input ai_max!' }]}
                    >
                        <InputNumber style={{width: '10vw'}} />
                    </Form.Item>

                    <Form.Item
                        label="ao_max:"
                        name="ao_max"
                        rules={[{ required: true, message: 'Please input ao_max!' }]}
                    >
                        <InputNumber style={{width: '10vw'}} />
                    </Form.Item>

                    <Form.Item
                        label="av_max:"
                        name="av_max"
                        rules={[{ required: true, message: 'Please input av_max!' }]}
                    >
                        <InputNumber style={{width: '10vw'}} />
                    </Form.Item>

                    <Form.Item
                        label="bi_max:"
                        name="bi_max"
                        rules={[{ required: true, message: 'Please input bi_max!' }]}
                    >
                        <InputNumber style={{width: '10vw'}} />
                    </Form.Item>

                    <Form.Item
                        label="bo_max:"
                        name="bo_max"
                        rules={[{ required: true, message: 'Please input bo_max!' }]}
                    >
                        <InputNumber style={{width: '10vw'}} />
                    </Form.Item>

                    <Form.Item
                        label="bv_max:"
                        name="bv_max"
                        rules={[{ required: true, message: 'Please input bv_max!' }]}
                    >
                        <InputNumber style={{width: '10vw'}} />
                    </Form.Item>

                    <Divider orientation="left">Mqtt settings:</Divider>

                    <Form.Item
                        label="broker_ip:"
                        name="broker_ip"
                        rules={[{ required: true, message: 'Please input broker_ip!' }]}
                    >
                        <Input style={{width: '10vw'}}/>
                    </Form.Item>

                    <Form.Item
                        label="broker_port:"
                        name="broker_port"
                        rules={[{ required: true, message: 'Please input broker_port!' }]}
                    >
                        <InputNumber style={{width: '10vw'}} />
                    </Form.Item>

                    <Form.Item
                        label="debug:"
                        name="debug"
                        rules={[{ required: true, message: 'Please select debug option!' }]}
                    >
                        <Select
                            style={{width: '10vw'}}
                            options={[
                                {
                                value: true,
                                label: 'true'
                                },
                                {
                                value: false,
                                label: 'false'
                                },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        label="enable:"
                        name="enable"
                        rules={[{ required: true, message: 'Please select enable option!' }]}
                    >
                        <Select
                            style={{width: '10vw'}}
                            options={[
                                {
                                value: true,
                                label: 'true'
                                },
                                {
                                value: false,
                                label: 'false'
                                },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        label="retry_enable:"
                        name="retry_enable"
                        rules={[{ required: true, message: 'Please select retry_enable option!' }]}
                    >
                        <Select
                            style={{width: '10vw'}}
                            options={[
                                {
                                value: true,
                                label: 'true'
                                },
                                {
                                value: false,
                                label: 'false'
                                },
                            ]}
                        />
                    </Form.Item>
                    
                    <Form.Item
                        label="retry_interval:"
                        name="retry_interval"
                        rules={[{ required: true, message: 'Please input retry_interval!' }]}
                    >
                        <InputNumber style={{width: '10vw'}} />
                    </Form.Item>
                    
                    <Form.Item
                        label="retry_limit:"
                        name="retry_limit"
                        rules={[{ required: true, message: 'Please input retry_limit!' }]}
                    >
                        <InputNumber style={{width: '10vw'}} />
                    </Form.Item>

                    <Form.Item
                        label="write_via_subscribe:"
                        name="write_via_subscribe"
                        rules={[{ required: true, message: 'Please select write_via_subscribe option!' }]}
                    >
                        <Select
                            style={{width: '10vw'}}
                            options={[
                                {
                                value: true,
                                label: 'true'
                                },
                                {
                                value: false,
                                label: 'false'
                                },
                            ]}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
