import { Button, Descriptions, Modal, Spin, Space } from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { HostSystemFactory } from "../factory-system";
import { HostTimeFactory } from "./factory";
import { UpdateTimeSetting } from "./update-time-setting-modal";
import { ReloadOutlined } from '@ant-design/icons';

export const HostTime = () => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const [data, setData] = useState({} as any);
  const [isFetching, setIsFetching] = useState(false);

  const factory = new HostTimeFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = await factory.GetHostTime();
      setData(res);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <>
      <Space align="start" direction="vertical">
        <Button type="primary" icon={<ReloadOutlined />} size={"middle"} onClick={fetch}>Refresh</Button>
        <Spin spinning={isFetching}>
          {data && (
            <>
              <Descriptions>
                <Descriptions.Item label="Current Day">{data.current_day}</Descriptions.Item>
                <Descriptions.Item label="Current Day UTC">{data.current_day_utc}</Descriptions.Item>
                <Descriptions.Item label="Date Format Local">{data.date_format_local}</Descriptions.Item>
                <Descriptions.Item label="Date Stamp">{data.date_stamp}</Descriptions.Item>
                <Descriptions.Item label="System Time Zone">{data.system_time_zone}</Descriptions.Item>
                <Descriptions.Item label="Time Local">{data.time_local}</Descriptions.Item>
                <Descriptions.Item label="Time UTC">{data.time_utc}</Descriptions.Item>
              </Descriptions>
              <UpdateTimeSetting />
            </>
          )}

          {!data && <h5>No data</h5>}
        </Spin>
      </Space>
    </>
  );
};
