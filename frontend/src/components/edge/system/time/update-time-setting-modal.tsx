import { Button, DatePicker, DatePickerProps, Descriptions, Modal, Select, Spin, Popover } from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { HostTimeFactory } from "./factory";

interface OptionDTO {
  value: string;
  label: string;
}

export const UpdateTimeSetting = () => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const [timezoneList, setTimezoneList] = useState([] as OptionDTO[]);
  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isTimezoneModalVisible, setIsTimezoneModalVisible] = useState(false);
  const [isTimeModalVisible, setIsTimeModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const factory = new HostTimeFactory();

  const openTimezoneSetting = () => {
    setIsTimezoneModalVisible(true);
    if (!timezoneList || timezoneList.length === 0) {
      fetchTimezones();
    }
  };

  const openTimeSetting = () => {
    setIsTimeModalVisible(true);
  };

  const onChangeTimezone = (value: string) => {
    setSelectedTimezone(value);
  };

  const onChangeTime = (value: DatePickerProps["value"], dateString: string) => {
    setSelectedTime(dateString);
  };

  const handleClose = () => {
    setIsTimeModalVisible(false);
    setIsTimezoneModalVisible(false);
    setConfirmLoading(false);
  };

  const handleSubmitTimezone = async () => {
    try {
      setConfirmLoading(true);
      await factory.EdgeUpdateTimezone(connUUID, hostUUID, selectedTimezone);
      handleClose();
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleSubmitTime = async () => {
    try {
      setConfirmLoading(true);
      await factory.EdgeUpdateSystemTime(connUUID, hostUUID, selectedTime);
      handleClose();
    } finally {
      setConfirmLoading(false);
    }
  };

  const fetchTimezones = async () => {
    try {
      setIsFetching(true);
      const res = await factory.EdgeGetTimeZoneList(connUUID, hostUUID);
      const list = res.map((timezone) => {
        return { value: timezone, label: timezone };
      });
      setTimezoneList(list);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleNPTEnable = async () => {
    const res = await factory.EdgeNTPEnable(connUUID, hostUUID)
    console.log(res)
  }

  const handleNPTDisable = async () => {
    const res = await factory.EdgeNTPDisable(connUUID, hostUUID)
    console.log(res)
  }

  const content = (
    <div>
      <Button type="primary" className="mr-3" onClick={handleNPTEnable}>
        Enable
      </Button>
      <Button type="primary" danger className="mr-3" onClick={handleNPTDisable}>
        Disable
      </Button>
    </div>
  );

  return (
    <>
      <div className="text-start mt-4 justify-between">
        <Button type="primary" onClick={openTimeSetting} className="mr-3">
          Update Time
        </Button>
        <Button type="primary" onClick={openTimezoneSetting} className="mr-3">
          Update Timezone
        </Button>
        <Button type="primary" className="mr-3">
          <Popover content={content} title="Actions" trigger="hover">
            Update NPT Service
          </Popover>
        </Button>
      </div>

      <Modal
        title="Update Timezone"
        okText="Save"
        style={{ textAlign: "start" }}
        visible={isTimezoneModalVisible}
        confirmLoading={confirmLoading}
        maskClosable={false}
        onOk={handleSubmitTimezone}
        onCancel={handleClose}
      >
        <Spin spinning={isFetching}>
          <Select
            showSearch
            placeholder="Select timezone"
            optionFilterProp="children"
            onChange={onChangeTimezone}
            filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
            options={timezoneList}
            style={{ width: "100%" }}
          />
        </Spin>
      </Modal>

      <Modal
        title="Update Time"
        okText="Save"
        style={{ textAlign: "start" }}
        visible={isTimeModalVisible}
        confirmLoading={confirmLoading}
        maskClosable={false}
        onOk={handleSubmitTime}
        onCancel={handleClose}
      >
        <DatePicker showTime onChange={onChangeTime} style={{ width: "100%" }} />
      </Modal>
    </>
  );
};
