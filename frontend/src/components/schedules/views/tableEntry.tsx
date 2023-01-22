import { useRef, useState } from "react";
import { Descriptions, Button } from "antd";
import { EditOutlined, EnterOutlined, DeleteOutlined } from '@ant-design/icons';


export const TableEntry = (props: any) => {
  const { itemUUID, data, EditForm, currentItem, setCurrentItem, eventException } = props;
  const formRef = useRef<any>();
  const [editButton, setEditButton] = useState(false);

  const handleEditClicked = () => {
    setEditButton(true)
  }

  const handleCommitClicked = () => {
    formRef.current.click();
    setEditButton(false)
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
    // console.log(currentItem)
  }

  const handleFormFinish = (values: any) => {
    if (eventException) {
        const startTemp = values.range[0]._d.toISOString().split(':')
        const endTemp = values.range[1]._d.toISOString().split(':')
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
            start: values.start._d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            end: values.end._d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      
        }
        if (itemUUID in currentItem.schedule.schedules.weekly) {
            currentItem.schedule.schedules.weekly[itemUUID] = updatedWeekly
        }
    }
    setCurrentItem(currentItem)
    // console.log(currentItem)
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
            <EditForm eventExceptionData={data} handleFinish={handleFormFinish} innerRef={formRef}/>
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
            <EditForm weeklyData={data} handleFinish={handleFormFinish} innerRef={formRef}/>
        )}
        <Button type="primary" icon={<EditOutlined />} size={'small'} disabled={editButton} onClick={handleEditClicked}>Edit</Button>
        <Button type="primary" icon={<DeleteOutlined />} size={'small'} danger={true} disabled={editButton} onClick={handleDeleteClicked}>Delete</Button>
        <Button type="primary" icon={<EnterOutlined />} size={'small'} disabled={!editButton} onClick={handleCommitClicked}>Commit</Button>
    </div>
  );
};

export default TableEntry;
