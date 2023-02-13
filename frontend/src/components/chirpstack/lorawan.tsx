import { Typography, Card } from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { chirpstack } from "../../../wailsjs/go/models";
import Schedules from "../schedules/schedules";
import { ChirpFactory } from "./factory";

import DeviceProfiles = chirpstack.DeviceProfiles;

const { Title } = Typography;

export const Lorawan = () => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const [data, setData] = useState<DeviceProfiles | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(false);
  const [createModal, showCreateModal] = useState(false);
  const [selectedUUIDs, setSelectedUUIDs] = useState([]);

  const factory = new ChirpFactory();

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = await factory.CSGetDeviceProfiles(connUUID, hostUUID);
      console.log(res);
      setData(res);
    } catch (error) {
      setData(undefined);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [connUUID, hostUUID]);

  const handleRefreshClick = () => {
    fetch();
  };

  const handleCreateClick = () => {
    showCreateModal(true);
  };

  const handleCancel = () => {
    showCreateModal(false);
  };

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        Lorawan
      </Title>
      <Card bordered={false}>aaaaaaaa</Card>
    </>
  );
};

export default Schedules;
