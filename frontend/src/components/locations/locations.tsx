import { Card, Space, Tooltip, Typography } from "antd";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GetConnection, GetLocations } from "../../../wailsjs/go/backend/App";
import { amodel } from "../../../wailsjs/go/models";
import { RbAddButton, RbRefreshButton } from "../../common/rb-table-actions";
import { ROUTES } from "../../constants/routes";
import { isObjectEmpty } from "../../utils/utils";
import RbxBreadcrumb from "../breadcrumbs/breadcrumbs";
import { LocationFactory } from "./factory";
import { CreateEditModal } from "./views/create";
import { LocationsTable } from "./views/table";
import useTitlePrefix from "../../hooks/usePrefixedTitle";
import { ArrowRightOutlined, FormOutlined } from "@ant-design/icons";
import { LOCATION_HEADERS } from "../../constants/headers";
import Location = amodel.Location;

const { Title } = Typography;

export const Locations = () => {
  const { connUUID } = useParams();
  const { prefixedTitle, addPrefix } = useTitlePrefix("Locations");
  const [locations, setLocations] = useState([] as Location[]);
  const [currentLocation, setCurrentLocation] = useState({} as Location);
  const [locationSchema, setLocationSchema] = useState({});
  const [columns, setColumns] = useState([] as any);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  let locationFactory = new LocationFactory();
  locationFactory.connectionUUID = connUUID as string;

  useEffect(() => {
    getColumns();
  }, []);

  useEffect(() => {
    fetchList();
    getConnection();
  }, [connUUID]);

  const fetchList = async () => {
    try {
      setIsFetching(true);
      let res = await GetLocations(locationFactory.connectionUUID);
      res = !res ? [] : res;
      setLocations(res);
    } catch (error) {
      setLocations([]);
    } finally {
      setIsFetching(false);
    }
  };

  const getConnection = async () => {
    try {
      const res = await GetConnection(locationFactory.connectionUUID);
      addPrefix(res?.name);
    } catch (error) {
      console.log(error);
    }
  };

  const getLocationSchema = async () => {
    setIsLoadingForm(true);
    let jsonSchema = await locationFactory.Schema();
    setLocationSchema(jsonSchema);
    setIsLoadingForm(false);
  };

  const refreshList = () => {
    fetchList();
  };

  const showModal = (location: Location) => {
    setCurrentLocation(location);
    setIsModalVisible(true);
    if (isObjectEmpty(locationSchema)) {
      getLocationSchema();
    }
  };

  const onCloseModal = () => {
    setIsModalVisible(false);
    setCurrentLocation({} as Location);
  };

  const getColumns = async () => {
    try {
      const _columns = [
        {
          title: "Actions",
          key: "actions",
          fixed: "left",
          render: (_: any, location: Location) => (
            <Space size="middle">
              <Tooltip title="Edit">
                <a onClick={() => showModal(location)}>
                  <FormOutlined />
                </a>
              </Tooltip>
              <Link
                to={ROUTES.LOCATION_NETWORKS.replace(":connUUID", connUUID || "").replace(":locUUID", location.uuid)}
              >
                <Tooltip title="View">
                  <ArrowRightOutlined />
                </Tooltip>
              </Link>
            </Space>
          ),
        },
        ...LOCATION_HEADERS,
      ];
      setColumns(_columns);
    } catch (error) {
    }
  };

  const routes = [
    {
      path: ROUTES.CONNECTIONS,
      breadcrumbName: "Supervisors",
    },
    {
      path: ROUTES.LOCATIONS.replace(":connUUID", connUUID || ""),
      breadcrumbName: "Location",
    },
  ];

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        {prefixedTitle}
      </Title>
      <Card bordered={false}>
        <RbxBreadcrumb routes={routes} />
        <RbRefreshButton refreshList={refreshList} />
        <RbAddButton handleClick={() => showModal({} as Location)} />
        <LocationsTable
          locations={locations}
          isFetching={isFetching}
          tableSchema={columns}
          connUUID={connUUID}
          refreshList={refreshList}
        />
        <CreateEditModal
          locations={locations}
          currentLocation={currentLocation}
          locationSchema={locationSchema}
          isModalVisible={isModalVisible}
          isLoadingForm={isLoadingForm}
          connUUID={connUUID}
          refreshList={refreshList}
          onCloseModal={onCloseModal}
          setIsFetching={setIsFetching}
        />
      </Card>
    </>
  );
};
