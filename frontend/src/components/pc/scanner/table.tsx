import { Spin } from "antd";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Scanner } from "../../../../wailsjs/go/backend/App";
import RbTable from "../../../common/rb-table";
import { RbRefreshButton, RbAddButton } from "../../../common/rb-table-actions";
import { SCANNER_HEADERS } from "../../../constants/headers";
import { openNotificationWithIcon } from "../../../utils/utils";
import { CreateConnectionsModal, CreateHostsModal } from "./create";

export const PcScanner = ({ refreshList }: any) => {
  const { connUUID = "" } = useParams();
  const [data, setData] = useState([]);
  const [selectedIpPorts, setSelectedIpPorts] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isHostsModalVisible, setIsHostsModalVisible] = useState(false);

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
    if (!!connUUID) {
      setIsHostsModalVisible(true);
    } else {
      setIsModalVisible(true);
    }
  };

  const onclose = () => {
    setSelectedRowKeys([]);
    setSelectedIpPorts([]);
    setIsModalVisible(false);
    setIsHostsModalVisible(false);
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
      <CreateConnectionsModal
        isModalVisible={isModalVisible}
        selectedIpPorts={selectedIpPorts}
        refreshList={refreshList}
        onclose={onclose}
      />
      <CreateHostsModal
        isModalVisible={isHostsModalVisible}
        selectedIpPorts={selectedIpPorts}
        refreshList={refreshList}
        onclose={onclose}
      />
    </>
  );
};
