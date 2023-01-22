import { useRef, useEffect, useState } from "react";
import { Modal, Tabs } from "antd";
import { EventExceptionForm } from './eventExceptionForm';
import { WeeklyForm } from './weeklyForm';
import { TableEntry } from './tableEntry';
import { TabContent } from './tab';
import { assistcli } from "../../../../wailsjs/go/models";
const { TabPane } = Tabs;

const eventsTag = 'EVENT'
const weeklyTag = 'WEEKLY'
const exceptionTag = 'EXCEPTION'

export enum CreateType {
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

const generateExistingItems = (
    currentItem: assistcli.Schedule,
    objString: string,
    form: React.FC,
    setCurrentItem: Function,
    eventException: Boolean
) => {
    let existingElementJSX: JSX.Element[] = []
    const res = checkNull(currentItem, objString)
    if (res != null || res != undefined) {
        Object.keys(res).forEach( function(key,index) {
            existingElementJSX.push(
                <TableEntry 
                    key={key} 
                    EditForm={form} 
                    data={res[key]} itemUUID={key}
                    currentItem={structuredClone(currentItem)} 
                    setCurrentItem={setCurrentItem}
                    eventException={eventException}
                /> 
            )
        });
    }
    return existingElementJSX
}

export const ScheduleModal = (props: any) => {
  const { connUUID, hostUUID, currentItem, setCurrentItem, factory, setScheduleModalVisible, refreshList } = props;
  const formRef = useRef<any>();
  const [events, setEvents] = useState<JSX.Element[]>([]);
  const [weeklys, setWeeklys] = useState<JSX.Element[]>([]);
  const [exceptions, setExceptions] = useState<JSX.Element[]>([]);
  const [createCat, setCreateCat] = useState<CreateType>(CreateType.UNSPECIFIED);

  useEffect(() => {
    // map existing items to tableEntry for display if not empty
    if (currentItem.schedule && currentItem.schedule.schedules) {
        const eventsJSX = generateExistingItems(currentItem, 'schedule.schedules.events', EventExceptionForm, setCurrentItem, true);
        setEvents(eventsJSX)

        const exceptionJSX = generateExistingItems(currentItem, 'schedule.schedules.exception', EventExceptionForm, setCurrentItem, true);
        setExceptions(exceptionJSX)

        const weeklyJSX = generateExistingItems(currentItem, 'schedule.schedules.weekly', WeeklyForm, setCurrentItem, false);
        setWeeklys(weeklyJSX)
    // reset existing items when current schedule item is empty
    } else {
        setEvents([])
        setExceptions([])
        setWeeklys([])
    }
  }, [currentItem])

  const handleOk = async () => {
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

    setScheduleModalVisible(false);
    await factory.EditSchedule(connUUID, hostUUID, clonedItem.uuid, opts)
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

  return (
    <Modal 
        title="Create schedules" 
        visible={props.visible} 
        onOk={handleOk} 
        onCancel={props.handleCancel} 
        bodyStyle={{overflowX: 'scroll', maxHeight: '50vh'}} 
        width='50vw'
        okButtonProps={{ disabled: createCat != CreateType.UNSPECIFIED  }}
    >
        <Tabs defaultActiveKey="1">
            <TabPane tab={eventsTag} key={eventsTag}>
                <TabContent 
                    createCat={createCat}
                    type={CreateType.EVENT}
                    handleOnClick={eventCreate}
                    exisitingElements={events}
                    handleCancel={handleCancel}
                    handleCreate={handleCreate}
                    form={<EventExceptionForm eventExceptionData={{}} handleFinish={handleFormFinish} innerRef={formRef}/>}
                />
            </TabPane>

            <TabPane tab={weeklyTag} key={weeklyTag}>
                <TabContent 
                    createCat={createCat}
                    type={CreateType.WEEKLY}
                    handleOnClick={weeklyCreate}
                    exisitingElements={weeklys}
                    handleCancel={handleCancel}
                    handleCreate={handleCreate}
                    form={<WeeklyForm weeklyData={{}} handleFinish={handleFormFinish} innerRef={formRef}/>}
                />
            </TabPane>

            <TabPane tab={exceptionTag} key={exceptionTag}>
                <TabContent 
                    createCat={createCat}
                    type={CreateType.EXCEPTION}
                    handleOnClick={exceptionCreate}
                    exisitingElements={exceptions}
                    handleCancel={handleCancel}
                    handleCreate={handleCreate}
                    form={<EventExceptionForm eventExceptionData={{}} handleFinish={handleFormFinish} innerRef={formRef}/>
                }
                />
            </TabPane>
        </Tabs>
        
    </Modal>
  );
};

export default ScheduleModal;
