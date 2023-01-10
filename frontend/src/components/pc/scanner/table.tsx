import { useEffect, useState } from "react";
import { Spin } from "antd";
import { openNotificationWithIcon } from "../../../utils/utils";
import { Scanner } from "../../../../wailsjs/go/backend/App";
import { SCANNER_HEADERS } from "../../../constants/headers";
import RbTable from "../../../common/rb-table";
import { RbAddButton, RbRefreshButton } from "../../../common/rb-table-actions";
import { CreateModal } from "./create";

const ScannerTable = (props: any) => {
  let { data, isFetching, setSelectedIpPorts } = props;

  if (!data) return <></>;

  const columns = SCANNER_HEADERS;

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedIpPorts(selectedRows);
    },
  };

  return (
    <RbTable
      rowKey="ip"
      rowSelection={rowSelection}
      dataSource={data}
      columns={columns}
      loading={{ indicator: <Spin />, spinning: isFetching }}
    />
  );
};




export const PcScanner = () => {
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedIpPorts, setSelectedIpPorts] = useState([]);


  const fakeDate = {
    "hosts": [
      {
        "ip": "192.168.15.122222",
        "ports": [
          {
            "service": "rubix-assist",
            "port": "1662"
          }
        ]
      },
      {
        "ip": "192.168.15.11",
        "ports": [
          {
            "service": "rubix-assist",
            "port": "1662"
          }
        ]
      },
      {
        "ip": "192.168.15.190",
        "ports": [
          {
            "service": "rubix-assist",
            "port": "1662"
          }
        ]
      }
    ]
  }

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    setIsFetching(true);
    const res = await Scanner("", "", 0, ["1662"]);
    if (res != undefined) {
      setData(res["hosts"]);
      setIsFetching(false);
    } else {
      setIsFetching(false);
    }
  };

  const refreshList = () => {
    fetch();
  };

  const showModal = () => {
    if (selectedIpPorts.length === 0) {
      return openNotificationWithIcon("warning", `Please select Ip`);
    }
    setIsModalVisible(true);
  };

  return (
    <>
      <RbRefreshButton refreshList={refreshList} />
      <RbAddButton handleClick={showModal} />
      <ScannerTable
        data={data}
        isFetching={isFetching}
        setSelectedIpPorts={setSelectedIpPorts}
      />
      <CreateModal
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        selectedIpPorts={selectedIpPorts}
      />
    </>
  );
};
