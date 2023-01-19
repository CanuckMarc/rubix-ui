import { Input, Modal, Form, Select } from "antd";

export const EditModal = (props: any) => {
  const [form] = Form.useForm();

  return (
    <Modal title="Create schedules" visible={props.createModal} onOk={form.submit} onCancel={props.handleCancel} bodyStyle={{maxHeight: '50vh'}} width='30vw'>
        <Form
            form={form}
            name="basic"
            autoComplete="off"
            style={{maxHeight: '40vh', overflowX: 'auto'}}
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

            {props.moreOptions && (
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
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                    label="Global:"
                    name="is_global"
                    rules={[{ required: true, message: 'Please select global option!' }]}
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
