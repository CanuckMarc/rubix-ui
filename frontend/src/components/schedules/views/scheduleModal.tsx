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
    eventException: Boolean,
    timeZone: string,
    setEvents: Function,
    setExceptions: Function,
    setWeeklys: Function,
    okButtonDisable: Boolean,
    setOkButtonDisable: Function
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
                    currentItem={currentItem}
                    setCurrentItem={setCurrentItem}
                    eventException={eventException}
                    timeZone={timeZone}
                    setEvents={setEvents}
                    setExceptions={setExceptions}
                    setWeeklys={setWeeklys}
                    okButtonDisable={okButtonDisable}
                    setOkButtonDisable={setOkButtonDisable}
                />
            )
        });
    }
    return existingElementJSX
}

export const ScheduleModal = (props: any) => {
  const { connUUID, hostUUID, currentItem, setCurrentItem, factory, setScheduleModalVisible, refreshList } = props;
  const createFormRef = useRef<any>();
  const [events, setEvents] = useState<JSX.Element[]>([]);
  const [weeklys, setWeeklys] = useState<JSX.Element[]>([]);
  const [exceptions, setExceptions] = useState<JSX.Element[]>([]);
  const [createCat, setCreateCat] = useState<CreateType>(CreateType.UNSPECIFIED);
  const [okButtonDisable, setOkButtonDisable] = useState(false);

  useEffect(() => {
    // map existing items to tableEntry for display if not empty
    if (currentItem.schedule && currentItem.schedule.schedules) {
        const eventsJSX = generateExistingItems(
            structuredClone(currentItem), 
            'schedule.schedules.events', 
            EventExceptionForm, 
            setCurrentItem, 
            true, 
            currentItem.timezone,
            setEvents,
            setExceptions,
            setWeeklys,
            okButtonDisable,
            setOkButtonDisable
        );
        setEvents(eventsJSX)

        const exceptionJSX = generateExistingItems(
            structuredClone(currentItem), 
            'schedule.schedules.exception', 
            EventExceptionForm, 
            setCurrentItem, 
            true, 
            currentItem.timezone, 
            setEvents,
            setExceptions,
            setWeeklys,
            okButtonDisable,
            setOkButtonDisable
        );
        setExceptions(exceptionJSX)

        const weeklyJSX = generateExistingItems(
            structuredClone(currentItem), 
            'schedule.schedules.weekly', 
            WeeklyForm, 
            setCurrentItem, 
            false, 
            currentItem.timezone, 
            setEvents,
            setExceptions,
            setWeeklys,
            okButtonDisable,
            setOkButtonDisable
        );
        setWeeklys(weeklyJSX)
    // reset existing items when current schedule item is empty
    } else {
        setEvents([])
        setExceptions([])
        setWeeklys([])
    }
  }, [currentItem, okButtonDisable])

  const handleOk = async () => {
    props.setScheduleModalVisible(false);

    if (createCat != CreateType.UNSPECIFIED) {
        handleCreate()
    }

    await props.factory.EditSchedule(connUUID, hostUUID, currentItem.uuid, currentItem),
    
    // after updating schedule, refetch and clear the existing table-entries so that new ones can be loaded correctly
    props.refreshList();
    setEvents([])
    setExceptions([])
    setWeeklys([])
  }

  const parseEvExDateTime = (values: any) => {
    // time is UTC
    const startTemp = values.range[0].toISOString().split(':')
    const endTemp = values.range[1].toISOString().split(':')
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
      const clonedItem = structuredClone(currentItem)
      const scheduleRes = checkNull(clonedItem, 'schedule')
      const schedulesRes = checkNull(clonedItem, 'schedule.schedules')

    let events: any = {}
    let weekly: any = {}
    let exception: any = {}
    let opts: any = {}

    // initialise the opts object if schedule obj is null
    // once submit, this will init all properties on the server side as well
    if (scheduleRes == null || schedulesRes == null) {
        opts = {
            ...clonedItem,
            schedule: {
                schedules: {
                    events: {},
                    weekly: {},
                    exception: {}
                }
            }
        }
    }

    if (createCat == CreateType.EVENT) {
        const newEvent = parseEvExDateTime(values)
        events[crypto.randomUUID()] = newEvent
        const eventsRes = checkNull(clonedItem, 'schedule.schedules.events')
        // when schedule or schedules obj is null, use the initialised opts obj
        if (scheduleRes == null || schedulesRes == null) {
            opts.schedule.schedules.events[crypto.randomUUID()] = newEvent
        // when schedules property on schedule obj is not null but events is null, spread existing item into the new schedules obj
        // in this case, the opts obj is not initialised, but clonedItem will have the correct schedule obj structure
        } else if (schedulesRes != null && eventsRes == null) {
            clonedItem.schedule.schedules = {
                ...clonedItem.schedule.schedules,
                events: events
            }
            opts = clonedItem;
        // clonedItem has the correct schedule obj structure, events object has content, add new event to the opts object
        } else {
            clonedItem.schedule.schedules.events[crypto.randomUUID()] = newEvent;
            opts = clonedItem;
        }
    }

    if (createCat == CreateType.EXCEPTION) {
        const newException = parseEvExDateTime(values)
        exception[crypto.randomUUID()] = newException
        const exceptionRes = checkNull(clonedItem, 'schedule.schedules.exception')

        if (scheduleRes == null || schedulesRes == null) {
            opts.schedule.schedules.exception[crypto.randomUUID()] = newException
        } else if (schedulesRes != null && exceptionRes == null) {
            clonedItem.schedule.schedules = {
                ...clonedItem.schedule.schedules,
                exception: exception
            }
            opts = clonedItem;
        } else {
            clonedItem.schedule.schedules.exception[crypto.randomUUID()] = newException;
            opts = clonedItem;
        }
    }

    if (createCat == CreateType.WEEKLY) {
        const newWeekly = {
            name: values.name,
            days: values.days,
            start: values.start.format("HH:mm"),
            end: values.end.format("HH:mm")
        }

        weekly[crypto.randomUUID()] = newWeekly
        const weeklyRes = checkNull(clonedItem, 'schedule.schedules.weekly')

        if (scheduleRes == null || schedulesRes == null) {
            opts.schedule.schedules.weekly[crypto.randomUUID()] = newWeekly
        } else if (schedulesRes != null && weeklyRes == null) {
            clonedItem.schedule.schedules = {
                ...clonedItem.schedule.schedules,
                weekly: weekly
            }
            opts = clonedItem;
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
    setScheduleModalVisible(false)
    setCreateCat(CreateType.UNSPECIFIED)
  }

  const handleCreate = () => {
    createFormRef.current.click();
    setCreateCat(CreateType.UNSPECIFIED)
  }

  return (
    <Modal
        title="Create schedules"
        visible={props.visible}
        onOk={handleOk}
        onCancel={handleCancel}
        bodyStyle={{overflowX: 'auto', maxHeight: '50vh'}}
        width='50vw'
        okButtonProps={{ disabled: okButtonDisable }}
    >
        <Tabs defaultActiveKey="1">
            <TabPane tab={eventsTag} key={eventsTag}>
                <TabContent
                    timeZone={currentItem.timezone}
                    createCat={createCat}
                    type={CreateType.EVENT}
                    handleOnClick={eventCreate}
                    exisitingElements={events}
                    buttonName={'Add event'}
                    form={<EventExceptionForm eventExceptionData={{}} handleFinish={handleFormFinish} innerRef={createFormRef} timeZone={currentItem.timezone}/>}
                />
            </TabPane>

            <TabPane tab={weeklyTag} key={weeklyTag}>
                <TabContent
                    timeZone={currentItem.timezone}
                    createCat={createCat}
                    type={CreateType.WEEKLY}
                    handleOnClick={weeklyCreate}
                    exisitingElements={weeklys}
                    buttonName={'Add weekly'}
                    form={<WeeklyForm weeklyData={{}} handleFinish={handleFormFinish} innerRef={createFormRef} timeZone={currentItem.timezone}/>}
                />
            </TabPane>

            <TabPane tab={exceptionTag} key={exceptionTag}>
                <TabContent
                    timeZone={currentItem.timezone}
                    createCat={createCat}
                    type={CreateType.EXCEPTION}
                    handleOnClick={exceptionCreate}
                    exisitingElements={exceptions}
                    buttonName={'Add exception'}
                    form={<EventExceptionForm eventExceptionData={{}} handleFinish={handleFormFinish} innerRef={createFormRef} timeZone={currentItem.timezone}/>
                }
                />
            </TabPane>
        </Tabs>

    </Modal>
  );
};

export default ScheduleModal;
