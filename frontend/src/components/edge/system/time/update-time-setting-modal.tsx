import { Button, Descriptions, Modal, Select, Spin } from "antd";
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
  const [isFetching, setIsFetching] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const factory = new HostTimeFactory();

  const openTimeSetting = () => {
    setIsModalVisible(true);
    if (!timezoneList || timezoneList.length === 0) {
      fetchTimezones();
    }
  };

  const onChange = (value: string) => {
    setSelectedTimezone(value);
  };

  const handleClose = () => {
    setIsModalVisible(false);
    setConfirmLoading(false);
  };

  const handleSubmit = async () => {
    try {
      setConfirmLoading(true);
      await factory.EdgeUpdateTimezone(connUUID, hostUUID, selectedTimezone);
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

  return (
    <>
      <div className="text-start mt-4">
        <Button type="primary" onClick={openTimeSetting}>
          Update Time Setting
        </Button>
      </div>

      <Modal
        title="Update Time"
        okText="Save"
        style={{ textAlign: "start" }}
        visible={isModalVisible}
        confirmLoading={confirmLoading}
        maskClosable={false}
        onOk={handleSubmit}
        onCancel={handleClose}
      >
        <Spin spinning={isFetching}>
          <Select
            showSearch
            placeholder="Select timezone"
            optionFilterProp="children"
            onChange={onChange}
            filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
            options={timezoneList}
            style={{ width: "100%" }}
          />
        </Spin>
      </Modal>
    </>
  );
};
