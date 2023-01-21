import { ChangeEvent, useEffect, useState } from "react";
import { Input, Modal, Form, Select, Tabs, TimePicker, DatePicker } from "antd";
import type { SelectProps, RadioChangeEvent } from 'antd';
import moment from 'moment';
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

export const EventExceptionForm = (props: any) => {
  const { eventData, innerRef, setScheduleObject } = props;
  const [form] = Form.useForm();
  const [initData, setInitData] = useState<any>({})


  useEffect(() => {
    const startDateTime = eventData.dates[0].start.split('T');
    const endDateTime = eventData.dates[0].end.split('T');
    const init = {
        name: eventData.name,
        range: [
            moment(`${startDateTime[0]} ${startDateTime[1]}`),
            moment(`${endDateTime[0]} ${endDateTime[1]}`)
        ]
    }
    setInitData(init)
  }, [eventData])

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
        onFinish={props.handleFinish}
    >
        <Form.Item
            label="Name:"
            name="name"
        >
            <Input style={{width: '20vw'}}/>
        </Form.Item>

        <Form.Item
            label="Start and end date:"
            name="range"
        >
            <RangePicker showTime style={{ width: '20vw' }} />
        </Form.Item>

        <button ref={innerRef} type="submit" style={{ display: 'none' }} />
    </Form>

  );
};

export default EventExceptionForm;
