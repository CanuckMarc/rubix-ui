import { useRef, useState, useEffect } from "react";
import { Descriptions, Button } from "antd";
import { EditOutlined, EnterOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment-timezone';


export const TableEntry = (props: any) => {
  const { itemUUID, data, EditForm, currentItem, setCurrentItem, eventException, timeZone, setEvents, setExceptions, setWeeklys } = props;
  const formRef = useRef<any>();
  const [editButton, setEditButton] = useState(false);
  const [eventExceptionStart, setEventExceptionStart] = useState('');
  const [eventExceptionEnd, setEventExceptionEnd] = useState('');

  useEffect(() => {
    if (eventException) {
        const tempStart = data.dates[0].start.split('T')
        const tempEnd = data.dates[0].end.split('T')
        setEventExceptionStart(moment.utc(`${tempStart[0]} ${tempStart[1]}`).tz(timeZone).format('MMMM Do YYYY, h:mma'))
        setEventExceptionEnd(moment.utc(`${tempEnd[0]} ${tempEnd[1]}`).tz(timeZone).format('MMMM Do YYYY, h:mma'))
    }
  }, [])

  const handleEditClicked = () => {
    setEditButton(true)
  }

  const handleCommitClicked = () => {
    formRef.current.click();
    setEditButton(false)
    // clear the old table and the new one will be loaded automatically
    setEvents([])
    setExceptions([])
    setWeeklys([])
  }

  const handleDeleteClicked = () => {
    if (eventException) {
        if (itemUUID in currentItem.schedule.schedules.events) {
            delete currentItem.schedule.schedules.events[itemUUID]
        } else if (itemUUID in currentItem.schedule.schedules.exception) {
            delete currentItem.schedule.schedules.exception[itemUUID]
        }
    } else {
        if (itemUUID in currentItem.schedule.schedules.weekly) {
            delete currentItem.schedule.schedules.weekly[itemUUID]
        }
    }

    setCurrentItem(currentItem)
  }

  const handleFormFinish = (values: any) => {
    // this needs to be in UTC time
    // RangePicker think its input is UTC time
    if (eventException) {
        const startTemp = values.range[0].toISOString().split(':')
        const endTemp = values.range[1].toISOString().split(':')
        
        const updatedEventException = {
            ...data,
            name: values.name,
            dates: [{
                start:`${startTemp[0]}:${startTemp[1]}`,
                end: `${endTemp[0]}:${endTemp[1]}`
            }]
        }
    
        if (itemUUID in currentItem.schedule.schedules.events) {
            currentItem.schedule.schedules.events[itemUUID] = updatedEventException
        } else if (itemUUID in currentItem.schedule.schedules.exception) {
            currentItem.schedule.schedules.exception[itemUUID] = updatedEventException
        }
    } else {
        const updatedWeekly = {
            ...data,
            name: values.name,
            days: values.days,
            start: values.start.format("HH:mm"),
            end: values.end.format("HH:mm")
            // start: values.start._d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            // end: values.end._d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      
        }
        if (itemUUID in currentItem.schedule.schedules.weekly) {
            currentItem.schedule.schedules.weekly[itemUUID] = updatedWeekly
        }
    }
    setCurrentItem(currentItem)
  }

  return (
    <div style={{display: 'flex', flexDirection: 'row', gap: '1vw'}}>
        {/* if rendering events or exception */}
        {(!editButton && eventException) && (
            <Descriptions>
                <Descriptions.Item label="name">{data.name}</Descriptions.Item>
                <Descriptions.Item label="start">{eventExceptionStart}</Descriptions.Item>
                <Descriptions.Item label="end">{eventExceptionEnd}</Descriptions.Item>
            </Descriptions>
        )}
        {(editButton && eventException) && (
            <EditForm eventExceptionData={data} handleFinish={handleFormFinish} innerRef={formRef} timeZone={timeZone}/>
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
            <EditForm weeklyData={data} handleFinish={handleFormFinish} innerRef={formRef} timeZone={timeZone}/>
        )}
        <Button type="primary" icon={<EditOutlined />} size={'small'} disabled={editButton} onClick={handleEditClicked}>Edit</Button>
        <Button type="primary" icon={<DeleteOutlined />} size={'small'} danger={true} disabled={editButton} onClick={handleDeleteClicked}>Delete</Button>
        <Button type="primary" icon={<EnterOutlined />} size={'small'} disabled={!editButton} onClick={handleCommitClicked}>Commit</Button>
    </div>
  );
};

export default TableEntry;
