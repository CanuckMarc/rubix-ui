import { useRef, useEffect, useState } from "react";
import { Input, Modal, Form, Select, Tabs, Divider, Button, Space } from "antd";
import { EventExceptionForm } from './eventExceptionForm';
import { WeeklyForm } from './weeklyForm';
import { TableEntry } from './tableEntry';
import { PlusOutlined } from '@ant-design/icons';
const { TabPane } = Tabs;

const eventsTag = 'EVENT'
const weeklyTag = 'WEEKLY'
const exceptionTag = 'EXCEPTION'

enum CreateType {
    EVENT = "event",
    WEEKLY = "weekly",
    EXCEPTION = "exception",
    UNSPECIFIED = "unspecified"
  }

const checkNull = (obj: any, key: any) => {
    return key.split(".").reduce(function(o: any, x: any) {
        return (typeof o == "undefined" || o === null) ? o : o[x];
    }, obj);
}

export const ScheduleModal = (props: any) => {
  const { connUUID, hostUUID, currentItem, setCurrentItem, factory, setScheduleModalVisible, refreshList } = props;
  const formRef = useRef<any>();
  const [events, setEvents] = useState<JSX.Element[]>([])
  const [weeklys, setWeeklys] = useState<JSX.Element[]>([])
  const [exceptions, setExceptions] = useState<JSX.Element[]>([])
  const [createCat, setCreateCat] = useState<CreateType>(CreateType.UNSPECIFIED)

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

        let weeklyJSX: JSX.Element[] = []
        const weeklyCheckRes = checkNull(currentItem, 'schedule.schedules.weekly')
        if (weeklyCheckRes != null || weeklyCheckRes != undefined) {
            const weeklys = currentItem.schedule.schedules.weekly
            Object.keys(weeklys).forEach( function(key,index) {
                weeklyJSX.push(
                    <TableEntry 
                        key={key} 
                        EditForm={WeeklyForm} 
                        data={weeklys[key]} 
                        itemUUID={key} 
                        currentItem={structuredClone(currentItem)} 
                        setCurrentItem={setCurrentItem}
                        eventException={false}
                    /> 
                )
            });
        }
        setWeeklys(weeklyJSX)

    }
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

  const parseEvExDateTime = (values: any) => {
    const startTemp = values.range[0]._d.toISOString().split(':')
    const endTemp = values.range[1]._d.toISOString().split(':')
    const newEvEx = {
        name: values.name,
        dates: [{
            start:`${startTemp[0]}:${startTemp[1]}`,
            end: `${endTemp[0]}:${endTemp[1]}`
        }]
    }

    return newEvEx
  }

  const handleFormFinish = async(values: any) => {
    let events: any = {}
    let weekly: any = {}
    let exception: any = {}

    const clonedItem = structuredClone(currentItem)

    let opts: any = {}
    if (createCat == CreateType.EVENT) {
        const newEvent = parseEvExDateTime(values)
        // when events is null
        const res = checkNull(clonedItem, 'schedule.schedules.events')
        if (res == null || res == undefined) {
            events[crypto.randomUUID()] = newEvent
            opts = {
                ...clonedItem,
                schedule: {
                    schedules: {
                        ...clonedItem.schedule.schedules,
                        events: events
                    }
                }
            }
        // when events object has content, just add new event to the events object
        } else {
            clonedItem.schedule.schedules.events[crypto.randomUUID()] = newEvent;
            opts = clonedItem;
        }
    } 
    
    if (createCat == CreateType.EXCEPTION) {
        const newException = parseEvExDateTime(values)
        // when events is null
        const res = checkNull(clonedItem, 'schedule.schedules.exception')
        if (res == null || res == undefined) {
            exception[crypto.randomUUID()] = newException
            opts = {
                ...clonedItem,
                schedule: {
                    schedules: {
                        ...clonedItem.schedule.schedules,
                        exception: exception
                    }
                }
            }
        // when events object has content, just add new event to the events object
        } else {
            clonedItem.schedule.schedules.exception[crypto.randomUUID()] = newException;
            opts = clonedItem;
        }
    }

    if (createCat == CreateType.WEEKLY) {
        const newWeekly = {
            name: values.name,
            days: values.days,
            start: values.start._d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            end: values.end._d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})     
        }
        // when events is null
        const res = checkNull(clonedItem, 'schedule.schedules.weekly')
        if (res == null || res == undefined) {
            weekly[crypto.randomUUID()] = newWeekly
            opts = {
                ...clonedItem,
                schedule: {
                    schedules: {
                        ...clonedItem.schedule.schedules,
                        weekly: weekly
                    }
                }
            }
        // when events object has content, just add new event to the events object
        } else {
            clonedItem.schedule.schedules.weekly[crypto.randomUUID()] = newWeekly;
            opts = clonedItem;
        }
    }
    // setCurrentItem(currentItem)
    // console.log(currentItem)

    setScheduleModalVisible(false);
    const res = await factory.EditSchedule(connUUID, hostUUID, clonedItem.uuid, opts)
    if (res) {
      console.log(res)
    }
    refreshList();
  }

  const eventCreate = () => {
    setCreateCat(CreateType.EVENT)
  }

  const weeklyCreate = () => {
    setCreateCat(CreateType.WEEKLY)
  }

  const exceptionCreate = () => {
    setCreateCat(CreateType.EXCEPTION)
  }
  
  const handleCancel = () => {
      setCreateCat(CreateType.UNSPECIFIED)
  }
    
  const handleCreate = () => {
      formRef.current.click();
      setCreateCat(CreateType.UNSPECIFIED)
  }
  //bodyStyle={{maxHeight: '50vh'}}
  return (
    <Modal title="Create schedules" visible={props.visible} onOk={handleOk} onCancel={props.handleCancel} bodyStyle={{overflowX: 'scroll', maxHeight: '50vh'}} width='50vw'>
        <Tabs defaultActiveKey="1">
            <TabPane tab={eventsTag} key={eventsTag}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '2vh'}}>
                    <Button type="primary" icon={<PlusOutlined />} size={'middle'} disabled={(createCat == CreateType.EVENT)} onClick={eventCreate} style={{width: '5vw'}}>Create</Button>
                        {(createCat == CreateType.EVENT) && (
                            <>
                                <EventExceptionForm eventExceptionData={{}} handleFinish={handleFormFinish} innerRef={formRef}/>
                                <div style={{display: 'flex', flexDirection: 'row', gap: '1vw'}}>
                                    <Button type="primary" danger={true} size={'middle'} onClick={handleCancel}>Cancel</Button>
                                    <Button type="primary" size={'middle'} onClick={handleCreate}>Commit</Button>
                                </div>
                            </>
                        )}
                    <Divider/>
                    {events}
                </div>
            </TabPane>

            <TabPane tab={weeklyTag} key={weeklyTag}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '2vh'}}>
                    <Button type="primary" icon={<PlusOutlined />} size={'middle'} disabled={(createCat == CreateType.WEEKLY)} onClick={weeklyCreate} style={{width: '5vw'}}>Create</Button>
                        {(createCat == CreateType.WEEKLY) && (
                            <>
                                <WeeklyForm weeklyData={{}} handleFinish={handleFormFinish} innerRef={formRef}/>
                                <div style={{display: 'flex', flexDirection: 'row', gap: '1vw'}}>
                                    <Button type="primary" danger={true} size={'middle'} onClick={handleCancel}>Cancel</Button>
                                    <Button type="primary" size={'middle'} onClick={handleCreate}>Commit</Button>
                                </div>
                            </>
                        )}
                    <Divider/>
                    {weeklys}
                </div>
            </TabPane>

            <TabPane tab={exceptionTag} key={exceptionTag}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '2vh'}}>
                    <Button type="primary" icon={<PlusOutlined />} size={'middle'} disabled={(createCat == CreateType.EXCEPTION)} onClick={exceptionCreate} style={{width: '5vw'}}>Create</Button>
                        {(createCat == CreateType.EXCEPTION) && (
                            <>
                                <EventExceptionForm eventExceptionData={{}} handleFinish={handleFormFinish} innerRef={formRef}/>
                                <div style={{display: 'flex', flexDirection: 'row', gap: '1vw'}}>
                                    <Button type="primary" danger={true} size={'middle'} onClick={handleCancel}>Cancel</Button>
                                    <Button type="primary" size={'middle'} onClick={handleCreate}>Commit</Button>
                                </div>
                            </>
                        )}
                    <Divider/>
                    {exceptions}
                </div>
            </TabPane>
        </Tabs>
        
    </Modal>
  );
};

export default ScheduleModal;
