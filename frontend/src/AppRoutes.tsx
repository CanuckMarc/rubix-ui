import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES as routes } from "./constants/routes";
import { Backups } from "./components/backups/backups";
import ConnectionPage from "./components/connections/connection-page";
import { Connections } from "./components/connections/connections";
import { Networks } from "./components/hostNetworks/networks";
import { FlowDevices } from "./components/hosts/host/flow/devices/flow-devices";
import { Consumers } from "./components/hosts/host/flow/flowNetworks/consumers/consumers";
import { Producers } from "./components/hosts/host/flow/flowNetworks/producers/producers";
import { StreamClones } from "./components/hosts/host/flow/flowNetworks/streamClones/streamClones";
import { Streams } from "./components/hosts/host/flow/flowNetworks/streams/streams";
import { WriterClones } from "./components/hosts/host/flow/flowNetworks/writerClones/writer-clones";
import { Writers } from "./components/hosts/host/flow/flowNetworks/writers/writers";
import { FlowPoints } from "./components/hosts/host/flow/points/flow-points";
import { Host } from "./components/hosts/host/host";
import { Hosts } from "./components/hosts/hosts";
import { Locations } from "./components/locations/locations";
import { Logs } from "./components/logs/logs";
import { PcNetworking } from "./components/pc/networking/networking";
import RubixFlow from "./components/rubix-flow/rubix-flow";
import WiresConnections from "./components/wires-connections/wires-connections";
import UserGuide from "./components/user-guide/user-guide";
import Schedules from "./components/schedules/schedules";
import { WiresMap } from "./components/wires-map/map";
import { AppDetails } from "./components/hosts/views/appDetails";
import Lorawan from "./components/chirpstack/lorawan";

import { AppTabContent } from "./App";

function AppRoutes(props: AppTabContent) {
  return (
    <Routes>
      <Route path={routes.ROOT} element={<Navigate replace to={routes.CONNECTIONS} />} />
      <Route path={routes.FLOW_DEVICES} element={<FlowDevices />} />
      <Route path={routes.FLOW_POINTS} element={<FlowPoints />} />
      <Route path={routes.LOGS} element={<Logs />} />
      <Route path={routes.BACKUPS} element={<Backups />} />
      <Route path={routes.NETWORKING} element={<PcNetworking />} />
      <Route path={routes.CONNECTIONS} element={<ConnectionPage />}>
        <Route key={routes.CONNECTIONS} path={routes.CONNECTIONS} element={<Connections />} />
        <Route key={routes.LOCATIONS} path={routes.LOCATIONS} element={<Locations />} />
        <Route key={routes.LOCATION_NETWORKS} path={routes.LOCATION_NETWORKS} element={<Networks />} />
        <Route key={routes.LOCATION_NETWORK_HOSTS} path={routes.LOCATION_NETWORK_HOSTS} element={<Hosts />} />
        <Route key={routes.HOST} path={routes.HOST} element={<Host />} />
        <Route key={routes.DEVICES} path={routes.DEVICES} element={<FlowDevices />} />
        <Route key={routes.APP_DETAILS} path={routes.APP_DETAILS} element={<AppDetails />} />
        <Route key={routes.POINTS} path={routes.POINTS} element={<FlowPoints />} />
        <Route key={routes.STREAMS} path={routes.STREAMS} element={<Streams />} />
        <Route key={routes.PRODUCERS} path={routes.PRODUCERS} element={<Producers />} />
        <Route key={routes.STREAMCLONES} path={routes.STREAMCLONES} element={<StreamClones />} />
        <Route key={routes.CONSUMERS} path={routes.CONSUMERS} element={<Consumers />} />
        <Route key={routes.WRITERS} path={routes.WRITERS} element={<Writers />} />
        <Route key={routes.WRITERCLONES} path={routes.WRITERCLONES} element={<WriterClones />} />
      </Route>
      <Route path={routes.RUBIX_FLOW} element={<RubixFlow {...props} />} />
      <Route path={routes.RUBIX_FLOW_REMOTE} element={<RubixFlow {...props} />} />
      <Route key={routes.WIRES_CONNECTIONS} path={routes.WIRES_CONNECTIONS} element={<WiresConnections />} />
      <Route key={routes.WIRES_CONNECTIONS} path={routes.WIRES_CONNECTIONS_REMOTE} element={<WiresConnections />} />
      <Route key={routes.SCHEDULES} path={routes.SCHEDULES_REMOTE} element={<Schedules />} />
      <Route key={routes.USER_GUIDE} path={routes.USER_GUIDE} element={<UserGuide />} />
      <Route key={routes.USER_GUIDE} path={routes.USER_GUIDE_REMOTE} element={<UserGuide />} />
      <Route key={routes.WIRES_MAP_REMOTE} path={routes.WIRES_MAP_REMOTE} element={<WiresMap />} />
      <Route key={routes.LORAWAN_REMOTE} path={routes.LORAWAN_REMOTE} element={<Lorawan />} />
    </Routes>
  );
}

export default AppRoutes;
