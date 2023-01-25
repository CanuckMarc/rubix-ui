import { Tooltip } from "antd";
import { amodel } from "../../../../../wailsjs/go/models";
import { DiffOutlined, LoadingOutlined } from "@ant-design/icons";
import { useState } from "react";
import { openNotificationWithIcon } from "../../../../utils/utils";

export const AttachVirtualIP = (props: IAttachVirtualIp) => {
  const { host, factory } = props;

  const [loading, setLoading] = useState(false);

  const attachVirtualIP = async (e: any) => {
    setLoading(true);
    e.stopPropagation();
    factory.uuid = host.uuid;
    if (host.virtual_ip == "") {
      openNotificationWithIcon("error", "There is no configured Virtual IP!");
      setLoading(false);
      return
    }
    host.ip = host.virtual_ip;
    factory.this = host;
    try {
      await factory.Update();
      openNotificationWithIcon("success", "Configured Virtual IP successfully!");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return loading ? <LoadingOutlined /> :
    <Tooltip title="Attach Virtual IP">
      <a onClick={(e) => attachVirtualIP(e)}>
        <DiffOutlined />
      </a>
    </Tooltip>;
};

interface IAttachVirtualIp {
  host: amodel.Host;
  factory: any;
}
