import { Input, Modal, Form, Select } from "antd";
import { useEffect, useState } from "react";
import moment from 'moment-timezone'

export const EditModal = (props: any) => {
  const { currentItem, moreOptions } = props;
  const [form] = Form.useForm();
  const [initData, setInitData] = useState({})

  useEffect(() => {
    if (currentItem) {
    setInitData({
        schedule_name: currentItem.name,
        enable: currentItem.enable,
        is_global: currentItem.is_global,
        timeZone: currentItem.timezone ?? moment.tz.guess()
    })
    }
  }, [currentItem])

  useEffect(() => form.resetFields(), [initData]);

  return (
    <Modal forceRender title={props.title} visible={props.createModal} onOk={form.submit} onCancel={props.handleCancel} bodyStyle={{maxHeight: '50vh'}} width='35vw'>
        <Form
            form={form}
            name="basic"
            autoComplete="off"
            style={{maxHeight: '40vh', overflowX: 'auto'}}
            initialValues={initData}
            labelCol={{
                span: 4
            }}
            wrapperCol={{
                span: 4
            }}
            onFinish={props.handleFormFinish}
        >
            <Form.Item
            label="Name:"
            name="schedule_name"
            rules={[{ required: true, message: 'Please input a schedule name!' }]}
            >
            <Input style={{width: '20vw'}}/>
            </Form.Item>

            <Form.Item
                label="Time zone:"
                name="timeZone"
                rules={[{ required: true, message: 'Please select a time zone!' }]}
            >
                <Select
                    showSearch={true}
                    style={{width: '20vw'}}
                    options={moment.tz.names().map(aTimeZone => ({
                        value: aTimeZone,
                        label: aTimeZone
                    }))}
                />
            </Form.Item>

            {moreOptions && (
                <>
                    <Form.Item
                    label="Enable:"
                    name="enable"
                    rules={[{ required: true, message: 'Please select enable option!' }]}
                    >
                        <Select
                            style={{width: '20vw'}}
                            options={[
                                {
                                    value: true,
                                    label: 'true'
                                },
                                {
                                    value: false,
                                    label: 'false'
                                },
                                {
                                    value: null,
                                    label: 'null'
                                },
                            ]}
                        />
                    </Form.Item>
                </>
            )}

        </Form>
    </Modal>
  );
};

export default EditModal;
