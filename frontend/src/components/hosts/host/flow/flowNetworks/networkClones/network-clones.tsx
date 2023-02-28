import { NetworkClonesTable } from "./views/table";

export const FlowNetworkClones = (props: any) => {
  const { activeKey } = props;
  return <NetworkClonesTable activeKey={activeKey} />;
};
