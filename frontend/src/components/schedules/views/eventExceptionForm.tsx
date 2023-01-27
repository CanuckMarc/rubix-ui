import { useEffect, useState } from "react";
import { Input, Form, DatePicker } from "antd";
import moment from 'moment-timezone';
const { RangePicker } = DatePicker;

export const EventExceptionForm = (props: any) => {
  const { eventExceptionData, innerRef, handleFinish, timeZone } = props;
  const [form] = Form.useForm();
  const [initData, setInitData] = useState<any>({})


  useEffect(() => {
    let init = {}
    // moment obj fetched from db is UTC, need to convert to local time string before use
    if (Object.keys(eventExceptionData).length != 0) {
        const startDateTime = eventExceptionData.dates[0].start.split('T');
        const endDateTime = eventExceptionData.dates[0].end.split('T');

        init = {
            name: eventExceptionData.name,
            range: [
                moment.utc(`${startDateTime[0]} ${startDateTime[1]}`).tz(timeZone),
                moment.utc(`${endDateTime[0]} ${endDateTime[1]}`).tz(timeZone)
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
            <RangePicker format="YYYY-MM-DD HH:mm" showTime={{format: "HH:mm"}} style={{ width: '20vw' }} />
        </Form.Item>

        <button ref={innerRef} type="submit" style={{ display: 'none' }} />
    </Form>

  );
};

export default EventExceptionForm;
