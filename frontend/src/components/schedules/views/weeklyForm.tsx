import { useEffect, useState } from "react";
import { Input, Form, Select, TimePicker } from "antd";
import type { SelectProps } from 'antd';
import moment from 'moment';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const dayOptions: SelectProps['options'] = [];
for (let i=0; i<7; i++) {
    dayOptions.push({
        value: days[i],
        label: days[i]
    })
}

export const WeeklyForm = (props: any) => {
  const { weeklyData, innerRef, handleFinish } = props;
  const [form] = Form.useForm();
  const [initData, setInitData] = useState<any>({})


  useEffect(() => {
    let init = {}
    if (Object.keys(weeklyData).length != 0) {
        init = {
            name: weeklyData.name,
            start: moment(weeklyData.start,'h:mm'),
            end: moment(weeklyData.end,'h:mm'),
            days: weeklyData.days
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
            label="Days:"
            name="days"
            rules={[{ required: true, message: 'Please input days!' }]}
        >
            <Select
                mode="multiple"
                size={'middle'}
                placeholder="Please select schedule days"
                style={{ width: '20vw' }}
                options={dayOptions}
            />
        </Form.Item>

        <Form.Item
            label="Start time:"
            name="start"
            rules={[{ required: true, message: 'Please input start time!' }]}
        >
            <TimePicker style={{ width: '20vw' }} />
        </Form.Item>
        
        <Form.Item
            label="End time:"
            name="end"
            rules={[{ required: true, message: 'Please input end time!' }]}
        >
            <TimePicker style={{ width: '20vw' }} />
        </Form.Item>

        <button ref={innerRef} type="submit" style={{ display: 'none' }} />
    </Form>

  );
};

export default WeeklyForm;
