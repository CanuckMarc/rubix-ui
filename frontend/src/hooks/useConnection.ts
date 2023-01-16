import { DataNode } from "antd/lib/tree";
import { useEffect, useState } from "react";
import { storage } from "../../wailsjs/go/models";
import { ConnectionFactory } from "../components/connections/factory";
import { LocationFactory } from "../components/locations/factory";
import { getTreeDataIterative } from "../components/searchable-tree/searchable-tree.ui-service";

import RubixConnection = storage.RubixConnection;

interface TDataNode extends DataNode {
  name?: string;
}

export const useConnections = () => {
  const [connections, setConnections] = useState([] as any[]);
  const [routeData, updateRouteData] = useState([] as TDataNode[]);
  const [isFetching, setIsFetching] = useState(false);

  const locationFactory = new LocationFactory();
  const connectionFactory = new ConnectionFactory();

  const getLocations = async (connUUID: string) => {
    try {
      locationFactory.connectionUUID = connUUID;
      return await locationFactory.GetAll();
    } catch (err) {
      return [];
    }
  };

  const fetchConnections = async () => {
    try {
      setIsFetching(true);
      const connections = ((await connectionFactory.GetAll()) || []) as any[];
      const enabledConnections = connections.filter(
        (c: RubixConnection) => c.enable
      );
      for (const c of enabledConnections) {
        let locations = [];
        locations = await getLocations(c.uuid);
        c.locations = locations;
      }
      setConnections(enabledConnections);
      updateRouteData(getTreeDataIterative(enabledConnections));
    } catch (error) {
      setConnections([]);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  return { connections, routeData, isFetching };
};
