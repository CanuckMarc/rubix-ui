import { Tooltip } from "antd";
import { amodel } from "../../../../../wailsjs/go/models";
import { LoadingOutlined, PhoneOutlined, SubnodeOutlined } from "@ant-design/icons";
import { useState } from "react";

export const ConfigureOpenVpn = (props: IConfigureOpenVpn) => {
  const { host, factory } = props;

  const [loading, setLoading] = useState(false);

  const configureOpenVPN = async (e: any) => {
    setLoading(true);
    e.stopPropagation();
    factory.uuid = host.uuid;
    try {
      await factory.ConfigureOpenVPN();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return loading ? <LoadingOutlined /> :
    <Tooltip title="Configure OpenVPN">
      <a onClick={(e) => configureOpenVPN(e)}>
        <SubnodeOutlined />
      </a>
    </Tooltip>;
};

interface IConfigureOpenVpn {
  host: amodel.Host;
  factory: any;
}
