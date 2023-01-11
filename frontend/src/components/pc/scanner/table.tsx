import { Spin } from "antd";
import { useState, useEffect } from "react";
import { Scanner } from "../../../../wailsjs/go/backend/App";
import RbTable from "../../../common/rb-table";
import { RbRefreshButton, RbAddButton } from "../../../common/rb-table-actions";
import { SCANNER_HEADERS } from "../../../constants/headers";
import { openNotificationWithIcon } from "../../../utils/utils";
import { CreateModal } from "./create";

export const PcScanner = ({ refreshConnections }: any) => {
  const [data, setData] = useState([]);
  const [selectedIpPorts, setSelectedIpPorts] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const columns = SCANNER_HEADERS;

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedIpPorts(selectedRows);
    },
  };

  const showModal = () => {
    if (selectedIpPorts.length === 0) {
      return openNotificationWithIcon("warning", `Please select Ip`);
    }
    setIsModalVisible(true);
  };

  const onclose = () => {
    setSelectedRowKeys([]);
    setSelectedIpPorts([]);
    setIsModalVisible(false);
  };

  const fetch = async () => {
    try {
      setIsFetching(true);
      const { hosts = [] } = await Scanner("", "", 0, ["1662"]);
      setData(hosts || []);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <>
      <RbRefreshButton refreshList={fetch} />
      <RbAddButton handleClick={showModal} />

      <RbTable
        rowKey="ip"
        rowSelection={rowSelection}
        dataSource={data}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
      <CreateModal
        isModalVisible={isModalVisible}
        selectedIpPorts={selectedIpPorts}
        refreshConnections={refreshConnections}
        onclose={onclose}
      />
    </>
  );
};
