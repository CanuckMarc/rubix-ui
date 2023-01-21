import { useEffect, useState } from "react";
import { Input, Modal, Form, Select, Tabs, TimePicker, DatePicker } from "antd";
import { EventExceptionForm } from './eventExceptionForm';
import { TableEntry } from './tableEntry';
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
const checkNull = (obj: any, key: any) => {
    return key.split(".").reduce(function(o: any, x: any) {
        return (typeof o == "undefined" || o === null) ? o : o[x];
    }, obj);
}

export const ScheduleModal = (props: any) => {
  const { connUUID, hostUUID, currentItem, setCurrentItem } = props;
  const [form] = Form.useForm();
  const [editedData, setEditedData] = useState<any>({})
  const [events, setEvents] = useState<JSX.Element[]>([])
  const [weeklys, setWeeklys] = useState<JSX.Element[]>([])
  const [exceptions, setExceptions] = useState<JSX.Element[]>([])

  useEffect(() => {
    console.log(currentItem.schedule)
    if (currentItem.schedule && currentItem.schedule.schedules) {
        let eventsJSX: JSX.Element[] = []
        const eventCheckRes = checkNull(currentItem, 'schedule.schedules.events')
        if (eventCheckRes != null || eventCheckRes != undefined) {
            const events = currentItem.schedule.schedules.events
            Object.keys(events).forEach( function(key,index) {
                eventsJSX.push(
                    <TableEntry 
                        key={key} 
                        EditForm={EventExceptionForm} 
                        data={events[key]} itemUUID={key} 
                        currentItem={structuredClone(currentItem)} 
                        setCurrentItem={setCurrentItem}
                        eventException={true}
                    /> 
                )
            });
        }
        setEvents(eventsJSX)
        // console.log(events)

        let exceptionJSX: JSX.Element[] = []
        const exceptionCheckRes = checkNull(currentItem, 'schedule.schedules.exception')
        if (exceptionCheckRes != null || exceptionCheckRes != undefined) {
            const exceptions = currentItem.schedule.schedules.exception
            Object.keys(exceptions).forEach( function(key,index) {
                exceptionJSX.push(
                    <TableEntry 
                        key={key} 
                        EditForm={EventExceptionForm} 
                        data={exceptions[key]} 
                        itemUUID={key} 
                        currentItem={structuredClone(currentItem)} 
                        setCurrentItem={setCurrentItem}
                        eventException={true}
                    /> 
                )
            });
        }
        setExceptions(exceptionJSX)
        // console.log(exceptions)

        let weeklyJSX: JSX.Element[] = []
        const weeklyCheckRes = checkNull(currentItem, 'schedule.schedules.weekly')
        if (weeklyCheckRes != null || weeklyCheckRes != undefined) {
            const weeklys = currentItem.schedule.schedules.weekly
            Object.keys(weeklys).forEach( function(key,index) {
                weeklyJSX.push(
                    <TableEntry 
                        key={key} 
                        EditForm={EventExceptionForm} 
                        data={weeklys[key]} 
                        itemUUID={key} 
                        currentItem={structuredClone(currentItem)} 
                        setCurrentItem={setCurrentItem}
                    /> 
                )
            });
        }
        setWeeklys(weeklyJSX)
        console.log(weeklys)

        // let weeklyJSX: JSX.Element[] = []
        // const weeklys = currentItem.schedule.schedules?.weekly
        // Object.keys(events).forEach( function(key,index) {
        //     weeklyJSX.push(
        //         <TableEntry key={key} EditForm={EventForm} data={events[key]} itemKey={key} currentItem={structuredClone(currentItem)} setCurrentItem={setCurrentItem}/> 
        //     )
        // });
        // setEvents(eventsJSX)
        // console.log(events)
    }
    // const exceptions = currentItem.schedule?.schedules?.exception
    // const weeklys = currentItem.schedule?.schedules?.weekly
  }, [currentItem])

  const handleOk = async () => {
    // props.setTableItem(currentItem)

    props.setScheduleModalVisible(false);
    console.log(currentItem)
    const res = await props.factory.EditSchedule(connUUID, hostUUID, currentItem.uuid, currentItem)
    if (res) {
      console.log(res)
    }
    props.refreshList();
  }

  return (
    <Modal title="Create schedules" visible={props.visible} onOk={handleOk} onCancel={props.handleCancel} bodyStyle={{maxHeight: '50vh'}} width='50vw'>
        {/* <Form
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
        > */}
            <Tabs defaultActiveKey="1">
                <TabPane tab={event} key={event}>
                    {events}
                    {/* <Form.Item
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
                    </Form.Item> */}

                </TabPane>

                <TabPane tab={weekly} key={weekly}>
                    {weeklys}
                    {/* <Form.Item
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
                    </Form.Item> */}
                    
                </TabPane>

                <TabPane tab={exception} key={exception}>
                    {exceptions}
                    {/* <Form.Item
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
                    </Form.Item> */}
                </TabPane>
            </Tabs>
        {/* </Form> */}
        
    </Modal>
  );
};

export default ScheduleModal;
