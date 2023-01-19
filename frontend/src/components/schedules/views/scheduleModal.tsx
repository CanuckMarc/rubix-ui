import { useEffect, useState } from "react";
import { Input, Modal, Form, Select, Tabs, TimePicker, DatePicker } from "antd";
import type { SelectProps, RadioChangeEvent } from 'antd';
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const event = 'EVENT'
const weekly = 'WEEKLY'
const exception = 'EXCEPTION'
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const dayOptions: SelectProps['options'] = [];
for (let i=0; i<7; i++) {
    dayOptions.push({
        value: days[i],
        label: days[i]
    })
}

export const ScheduleModal = (props: any) => {
  const [form] = Form.useForm();



  return (
    <Modal title="Create schedules" visible={props.visible} onOk={form.submit} onCancel={props.handleCancel} bodyStyle={{maxHeight: '50vh'}} width='40vw'>
        <Form
                form={form}
                name="basic"
                autoComplete="off"
                style={{maxHeight: '40vh', overflowX: 'auto'}}
                labelCol={{
                    span: 8
                }}
                wrapperCol={{
                    span: 4
                }}
                onFinish={props.handleFormFinish}
            >
            <Tabs defaultActiveKey="1">
                <TabPane tab={event} key={event}>
                    <Form.Item
                        label="Name:"
                        name="event_name"
                        >
                        <Input style={{width: '20vw'}}/>
                    </Form.Item>

                    <Form.Item
                        label="Start and end date:"
                        name="event_range"
                    >
                        <RangePicker showTime style={{ width: '20vw' }} />
                    </Form.Item>

                </TabPane>

                <TabPane tab={weekly} key={weekly}>
                    
                        <Form.Item
                        label="Name:"
                        name="weekly_schedule_name"
                        >
                            <Input style={{width: '20vw'}}/>
                        </Form.Item>

                        <Form.Item
                        label="Days:"
                        name="schedule_days"
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
                        name="schedule_start"
                        >
                            <TimePicker style={{ width: '20vw' }} />
                        </Form.Item>
                        
                        <Form.Item
                        label="End time:"
                        name="schedule_end"
                        >
                            <TimePicker style={{ width: '20vw' }} />
                        </Form.Item>
                    
                </TabPane>

                <TabPane tab={exception} key={exception}>
                    <Form.Item
                        label="Name:"
                        name="exception_name"
                    >
                        <Input style={{width: '20vw'}}/>
                    </Form.Item>

                    <Form.Item
                        label="Start and end date:"
                        name="exception_range"
                    >
                        <RangePicker showTime style={{ width: '20vw' }} />
                    </Form.Item>
                </TabPane>
            </Tabs>
        </Form>
        
        
        
    </Modal>
  );
};

export default ScheduleModal;
