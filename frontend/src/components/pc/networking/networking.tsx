import { useEffect, useState } from "react";
import { Typography } from "antd";
import { GetPcGetNetworks } from "../../../../wailsjs/go/backend/App";
import { RbRefreshButton } from "../../../common/rb-table-actions";
import { ScannerTable } from "./scanner-table";

const { Title } = Typography;

export const PcNetworking = () => {
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = await GetPcGetNetworks();
      setData(res);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        Networking
      </Title>
      <RbRefreshButton refreshList={fetch} />
      <ScannerTable data={data} isFetching={isFetching} />
    </>
  );
};
