import { useEffect, useRef, useState } from "react";
import { Input, Modal, Form, Select, Tabs, TimePicker, DatePicker, Descriptions, Button, Space, Divider } from "antd";
import type { SelectProps, RadioChangeEvent } from 'antd';
import { EditOutlined, EnterOutlined } from '@ant-design/icons';
import moment from 'moment';
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;


export const TableEntry = (props: any) => {
  const { itemUUID, data, EditForm, currentItem, setCurrentItem, eventException } = props;
  const formRef = useRef<any>();
  const [editButton, setEditButton] = useState(false);
//   const [changed, setChanged] = useState(false)
//   const [form] = Form.useForm();
//   const [initData, setInitData] = useState({})

//   useEffect(() => {
//     const startDateTime = data.dates[0].start.split('T');
//     const endDateTime = data.dates[0].end.split('T');
//     setInitData({
//         event_name: data.name,
//         event_range: [
//             moment(`${startDateTime[0]} ${startDateTime[1]}`),
//             moment(`${endDateTime[0]} ${endDateTime[1]}`)
//         ]
//     })
//   }, [])

  

  const handleEditClicked = (values: any) => {
    setEditButton(true)
  }

  const handleCommitClicked = (values: any) => {
    formRef.current.click();
    setEditButton(false)
  }

  const handleFormFinish = (values: any) => {
    // console.log(data)
    // console.log('event form submitted with values: ', values)

    const startTemp = values.range[0]._d.toISOString().split(':')
    const endTemp = values.range[1]._d.toISOString().split(':')
    const updatedEvent = {
        ...data,
        name: values.name,
        dates: [{
            start:`${startTemp[0]}:${startTemp[1]}`,
            end: `${endTemp[0]}:${endTemp[1]}`
        }]
    }

    if (itemUUID in currentItem.schedule.schedules.events) {
        currentItem.schedule.schedules.events[itemUUID] = updatedEvent
    } else if (itemUUID in currentItem.schedule.schedules.exception) {
        currentItem.schedule.schedules.exception[itemUUID] = updatedEvent
    }

    setCurrentItem(currentItem)
    console.log(currentItem)
  }

  return (
    <div style={{display: 'flex', flexDirection: 'row', gap: '1vw'}}>
        {/* if rendering events or exception */}
        {(!editButton && eventException) && (
            <Descriptions>
                <Descriptions.Item label="name">{data.name}</Descriptions.Item>
                <Descriptions.Item label="start">{data.dates[0].start}</Descriptions.Item>
                <Descriptions.Item label="end">{data.dates[0].end}</Descriptions.Item>
            </Descriptions>
        )}
        {(editButton && eventException) && (
            <EditForm eventData={data} handleFinish={handleFormFinish} innerRef={formRef}/>
        )}
        {/* if rendering weekly */}
        {(!editButton && !eventException) && (
            <Descriptions>
                <Descriptions.Item label="name">{data.name}</Descriptions.Item>
                <Descriptions.Item label="start">{data.start}</Descriptions.Item>
                <Descriptions.Item label="end">{data.end}</Descriptions.Item>
                <Descriptions.Item label="days">{data.days.join(', ')}</Descriptions.Item>
            </Descriptions>
        )}
        {(editButton && !eventException) && (
            <EditForm eventData={data} handleFinish={handleFormFinish} innerRef={formRef}/>
        )}
        <Button type="primary" icon={<EditOutlined />} size={'small'} disabled={editButton} onClick={handleEditClicked}>Edit</Button>
        <Button type="primary" icon={<EnterOutlined />} size={'small'} disabled={!editButton} onClick={handleCommitClicked}>Commit</Button>
    </div>
  );
};

export default TableEntry;
