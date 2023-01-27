import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FlowFrameworkNetworkFactory } from "./factory";
import { model } from "../../../../../../../wailsjs/go/models";
import { FlowNetworksTable } from "./views/table";

import FlowNetwork = model.FlowNetwork;

export const FlowNetworks = () => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const [networks, setNetworks] = useState([] as FlowNetwork[]);
  const [isFetching, setIsFetching] = useState(false);

  const factory = new FlowFrameworkNetworkFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    try {
      setIsFetching(true);
      let res = (await factory.GetAll(false)) || [];
      setNetworks(res);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <FlowNetworksTable
      data={networks}
      isFetching={isFetching}
      refreshList={fetch}
    />
  );
};
