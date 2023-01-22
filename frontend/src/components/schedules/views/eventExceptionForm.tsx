import { useEffect, useState } from "react";
import { Input, Form, DatePicker } from "antd";
import moment from 'moment';
const { RangePicker } = DatePicker;

export const EventExceptionForm = (props: any) => {
  const { eventExceptionData, innerRef, handleFinish } = props;
  const [form] = Form.useForm();
  const [initData, setInitData] = useState<any>({})


  useEffect(() => {
    let init = {}
    if (Object.keys(eventExceptionData).length != 0) {
        const startDateTime = eventExceptionData.dates[0].start.split('T');
        const endDateTime = eventExceptionData.dates[0].end.split('T');
        init = {
            name: eventExceptionData.name,
            range: [
                moment(`${startDateTime[0]} ${startDateTime[1]}`),
                moment(`${endDateTime[0]} ${endDateTime[1]}`)
            ]
        }
    }
    setInitData(init)
  }, [])

  useEffect(() => form.resetFields(), [initData]);

  return (
    <Form
        form={form}
        name="basic"
        autoComplete="off"
        style={{maxHeight: '40vh', overflowX: 'auto'}}
        initialValues={initData}
        labelCol={{
            span: 8
        }}
        wrapperCol={{
            span: 4
        }}
        onFinish={handleFinish}
    >
        <Form.Item
            label="Name:"
            name="name"
            rules={[{ required: true, message: 'Please input name!' }]}
        >
            <Input style={{width: '20vw'}}/>
        </Form.Item>

        <Form.Item
            label="Start and end date:"
            name="range"
            rules={[{ required: true, message: 'Please input date and time!' }]}
        >
            <RangePicker showTime style={{ width: '20vw' }} />
        </Form.Item>

        <button ref={innerRef} type="submit" style={{ display: 'none' }} />
    </Form>

  );
};

export default EventExceptionForm;
