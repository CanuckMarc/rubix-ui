import { Tooltip } from "antd";
import { amodel } from "../../../../../wailsjs/go/models";
import { LoadingOutlined, PhoneOutlined } from "@ant-design/icons";
import { useState } from "react";

export const Ping = (props: IPing) => {
  const { host, factory } = props;

  const [loading, setLoading] = useState(false);

  const handlePing = async (e: any) => {
    setLoading(true);
    e.stopPropagation();
    factory.uuid = host.uuid;
    try {
      await factory.PingHost();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return loading ? <LoadingOutlined /> :
    <Tooltip title="Ping">
      <a onClick={(e) => handlePing(e)}>
        <PhoneOutlined />
      </a>
    </Tooltip>;
};

interface IPing {
  host: amodel.Host;
  factory: any;
}
