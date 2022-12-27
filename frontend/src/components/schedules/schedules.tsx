import { useEffect, useState } from "react";
import { Typography, Card } from "antd";
import { SchedulesFactory } from "./factory";
import { useParams } from "react-router-dom";
import { SchedulesTable } from "./views/table";

const { Title } = Typography;

export const Schedules = () => {
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const { connUUID = "", hostUUID = "" } = useParams();
  const isRemote = connUUID && hostUUID ? true : false;
  const factory = new SchedulesFactory();

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = await factory.GetSchedules(connUUID, hostUUID);
      setData(res);
    } catch (error) {
      setData([]);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [connUUID, hostUUID]);

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        Schedules
      </Title>
      <Card bordered={false}>
        <SchedulesTable
          data={data}
          isFetching={isFetching}
          refreshList={fetch}
        />
      </Card>
    </>
  );
};

export default Schedules;
