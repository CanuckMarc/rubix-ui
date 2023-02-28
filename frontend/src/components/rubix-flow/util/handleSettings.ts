import { FlowFactory } from "../factory";

const factory = new FlowFactory();

export const handleGetSettingType = async (
  connUUID: string,
  hostUUID: string,
  isRemote: boolean,
  nodeType: string
) => {
  const nodeSettings: any = {};
  const type = nodeType.split("/")[1];

  const nodeSchema =
    (await factory.NodeSchema(connUUID, hostUUID, isRemote, type)) || {};
  const properties = Object.entries(nodeSchema?.schema?.properties || {});

  if (Object.entries(properties).length === 0) return nodeSettings;

  for (const [key, item] of properties as [string, any]) {
    nodeSettings[key] = item.default;
  }

  return nodeSettings;
};
