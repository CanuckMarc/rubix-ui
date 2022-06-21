import { storage } from "../../../wailsjs/go/models";
import { useEffect, useState } from "react";
import { isObjectEmpty } from "../../utils/utils";
import RubixConnection = storage.RubixConnection;
import { ConnectionsTable } from "./views/table";
import { AddButton, CreateEditModal } from "./views/create";
import { ConnectionFactory } from "./factory";

export const Connections = () => {
  const [connections, setConnections] = useState([] as RubixConnection[]);
  const [currentConnection, setCurrentConnection] = useState(
    {} as RubixConnection
  );
  const [connectionSchema, setConnectionSchema] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  let factory = new ConnectionFactory();

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      setIsFetching(true);
      let res = await factory.GetAll();
      res = !res ? [] : res;
      setConnections(res);
    } catch (error) {
      setConnections([]);
    } finally {
      setIsFetching(false);
    }
  };

  const getSchema = async () => {
    setIsLoadingForm(true);
    const res = await factory.Schema();
    const jsonSchema = {
      properties: res,
    };
    setConnectionSchema(jsonSchema);
    setIsLoadingForm(false);
  };

  const updateConnections = (connections: RubixConnection[]) => {
    setConnections(connections);
  };

  const refreshList = () => {
    fetchList();
  };

  const showModal = (connection: RubixConnection) => {
    setCurrentConnection(connection);
    setIsModalVisible(true);
    if (isObjectEmpty(connectionSchema)) {
      getSchema();
    }
  };

  const onCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <h1>Connections</h1>
      <AddButton showModal={showModal} />
      <CreateEditModal
        connections={connections}
        currentConnection={currentConnection}
        connectionSchema={connectionSchema}
        isModalVisible={isModalVisible}
        isLoadingForm={isLoadingForm}
        refreshList={refreshList}
        onCloseModal={onCloseModal}
      />
      <ConnectionsTable
        connections={connections}
        isFetching={isFetching}
        showModal={showModal}
        refreshList={refreshList}
      />
    </>
  );
};