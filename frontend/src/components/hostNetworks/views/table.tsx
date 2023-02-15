import { Space, Spin, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { backend, amodel } from "../../../../wailsjs/go/models";
import RbTable from "../../../common/rb-table";
import { RbAddButton, RbDeleteButton, RbRefreshButton } from "../../../common/rb-table-actions";
import { HOST_NETWORK_HEADERS } from "../../../constants/headers";
import { ROUTES } from "../../../constants/routes";
import { isObjectEmpty } from "../../../utils/utils";
import { LocationFactory } from "../../locations/factory";
import { NetworksFactory } from "../factory";
import { CreateEditModal } from "./create";
import { ArrowRightOutlined, FormOutlined } from "@ant-design/icons";
import Network = amodel.Network;
import Location = amodel.Location;
import UUIDs = backend.UUIDs;
import { RbSearchInput } from "../../../common/rb-search-input";

export const NetworksTable = () => {
  const { connUUID = "", locUUID = "" } = useParams();
  const [selectedUUIDs, setSelectedUUIDs] = useState([] as Array<UUIDs>);
  const [networks, setNetworks] = useState([] as Network[]);
  const [filteredData, setFilteredData] = useState<Network[]>([]);
  const [locations, setLocations] = useState([] as Location[]);
  const [currentNetwork, setCurrentNetwork] = useState({} as Network);
  const [networkSchema, setNetworkSchema] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  const factory = new NetworksFactory();
  const locationFactory = new LocationFactory();
  factory.connectionUUID = locationFactory.connectionUUID = connUUID;

  const config = {
    originData: networks,
    setFilteredData: setFilteredData,
  };

  const columns = [
    {
      title: "Actions",
      key: "actions",
      fixed: "left",
      render: (_: any, network: amodel.Network) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <a onClick={() => showModal(network)}>
              <FormOutlined />
            </a>
          </Tooltip>
          <Link
            to={ROUTES.LOCATION_NETWORK_HOSTS.replace(":connUUID", connUUID)
              .replace(":locUUID", locUUID)
              .replace(":netUUID", network.uuid)}
          >
            <Tooltip title="View">
              <ArrowRightOutlined />
            </Tooltip>
          </Link>
        </Space>
      ),
    },
    ...HOST_NETWORK_HEADERS,
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      setSelectedUUIDs(selectedRows);
    },
  };

  const fetch = async () => {
    try {
      setIsFetching(true);
      const networks = await factory.GetAll(locUUID);
      setNetworks(networks);
      setFilteredData(networks);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchLocations = async () => {
    const res = await locationFactory.GetAll();
    setLocations(res);
  };

  const getSchema = async () => {
    setIsLoadingForm(true);
    const res = await factory.Schema();
    setNetworkSchema(res);
    setIsLoadingForm(false);
  };

  const bulkDelete = async () => {
    await factory.BulkDelete(selectedUUIDs);
    fetch();
  };

  const showModal = (network: amodel.Network) => {
    setCurrentNetwork(network);
    setIsModalVisible(true);
    if (isObjectEmpty(networkSchema)) {
      getSchema();
    }
  };

  const onCloseModal = () => {
    setIsModalVisible(false);
    setCurrentNetwork({} as amodel.Network);
  };

  useEffect(() => {
    if (locations.length === 0) {
      fetchLocations();
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [locUUID, connUUID]);

  return (
    <div>
      <RbRefreshButton refreshList={fetch} />
      <RbAddButton handleClick={() => showModal({} as amodel.Network)} />
      <RbDeleteButton bulkDelete={bulkDelete} />
      {networks?.length > 0 && <RbSearchInput config={config} className="mb-4" />}

      <RbTable
        rowKey="uuid"
        rowSelection={rowSelection}
        dataSource={networks?.length > 0 ? filteredData : []}
        columns={columns}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
      <CreateEditModal
        networks={networks}
        currentNetwork={currentNetwork}
        schema={networkSchema}
        isModalVisible={isModalVisible}
        isLoadingForm={isLoadingForm}
        onCloseModal={onCloseModal}
        refreshList={fetch}
      />
    </div>
  );
};
