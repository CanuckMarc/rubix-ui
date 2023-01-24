import { List, Popconfirm, Spin, Tooltip } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EyeOutlined,
  RedoOutlined,
  PlusOutlined, DiffOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import copy from "copy-to-clipboard";
import { amodel, externaltoken, storage } from "../../../wailsjs/go/models";
import { openNotificationWithIcon } from "../../utils/utils";
import { CommonTokenFactory } from "./factory";
import { useParams } from "react-router-dom";
import { ConnectionFactory } from "../../components/connections/factory";
import { HostsFactory } from "../../components/hosts/factory";

import ExternalToken = externaltoken.ExternalToken;
import RubixConnection = storage.RubixConnection;
import Host = amodel.Host;

interface ITokenView {
  jwtToken: string;
  tokens: ExternalToken[];
  isLoading: boolean;
  factory: CommonTokenFactory;
  fetchToken: any;
  setIsLoading: any;
  selectedItem: RubixConnection | Host;
}

export const TokenView = (props: ITokenView) => {
  const { jwtToken, tokens = [], isLoading, factory, fetchToken, setIsLoading, selectedItem } = props;
  const { connUUID = "" } = useParams();
  const [displayToken, setDisplayToken] = useState({} as ExternalToken);
  const [regeneratedToken, setRegeneratedToken] = useState({} as ExternalToken);
  const [isAddingToken, setIsAdddingToken] = useState(false);

  const connectionFactory = new ConnectionFactory();
  const hostsFactory = new HostsFactory();
  hostsFactory.connectionUUID = connUUID;

  useEffect(() => {
    setRegeneratedToken({} as ExternalToken);
    setDisplayToken({} as ExternalToken);
  }, [jwtToken]);

  const getToken = async (token: ExternalToken) => {
    setIsLoading(true);
    try {
      const externalToken = await factory.Token(jwtToken, token.uuid);
      setDisplayToken(externalToken || ({} as ExternalToken));
      if (externalToken && externalToken.token) {
        copy(externalToken.token);
        openNotificationWithIcon("success", "Copied Token to Clipboard!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setToken = async (token: ExternalToken) => {
    try {
      setIsAdddingToken(true);
      const externalToken = await factory.Token(jwtToken, token.uuid);
      if (externalToken && externalToken.token) {
        if (!!connUUID) {
          const host = selectedItem as Host;
          updateHost(host, externalToken.token);
        } else {
          const connection = selectedItem as RubixConnection;
          updateConnection(connection, externalToken.token);
        }
        openNotificationWithIcon("success", `added ${token.name} success`);
      }
    } catch (error) {
      openNotificationWithIcon("error", `added ${token.name} fail`);
    } finally {
      setIsAdddingToken(false);
    }
  };

  const updateHost = async (host: Host, token: string) => {
    host.external_token = token;
    hostsFactory.this = host;
    hostsFactory.uuid = selectedItem.uuid;
    hostsFactory.connectionUUID = connUUID;
    await hostsFactory.Update();
  };

  const updateConnection = async (connection: RubixConnection, token: string) => {
    connection.external_token = token;
    connectionFactory.this = connection;
    connectionFactory.uuid = selectedItem.uuid;
    await connectionFactory.Update();
  };

  const toggleTokenBlockState = async (token: ExternalToken) => {
    await factory.TokenBlock(jwtToken, token.uuid, !token.blocked);
    fetchToken().catch(console.error);
  };

  const regenerateToken = async (token: ExternalToken) => {
    const externalToken = await factory.TokenRegenerate(jwtToken, token.uuid);
    setRegeneratedToken(externalToken);
    fetchToken().catch(console.error);
  };

  const deleteToken = async (token: ExternalToken) => {
    await factory.TokenDelete(jwtToken, token.uuid);
    fetchToken().catch(console.error);
  };

  return (
    <Spin spinning={isLoading}>
      {Object.keys(displayToken).length !== 0 && (
        <div>
          Token of <code>{displayToken.name}</code> is:
          <br />
          <i>
            <code>{displayToken.token}</code>
          </i>
          <br />
          <br />
        </div>
      )}
      {Object.keys(regeneratedToken).length !== 0 && (
        <div>
          Regenerated token of <code>{regeneratedToken.name}</code> is:
          <br />
          <i>
            <code>{regeneratedToken.token}</code>
          </i>
          <br />
          <br />
        </div>
      )}
      {tokens.length > 0 && (
        <List
          itemLayout="horizontal"
          dataSource={tokens}
          loading={isAddingToken}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Tooltip title={`Attach token to ${!!connUUID ? "Host" : "Connection"}`}>
                  <a key="list-block" onClick={() => setToken(item)}>
                    <DiffOutlined />
                  </a>
                </Tooltip>,
                <Tooltip title="View">
                  <a key="list-block" onClick={() => getToken(item)}>
                    <EyeOutlined />
                  </a>
                </Tooltip>,
                <Popconfirm
                  title={`Are you sure to ${item.blocked ? "un" : ""}block this token?`}
                  onConfirm={() => toggleTokenBlockState(item)}
                >
                  <a key="list-block">{item.blocked ? <CloseOutlined /> : <CheckOutlined />}</a>
                </Popconfirm>,
                <Popconfirm
                  title="Are you sure to regenerate/old will get removed out?"
                  onConfirm={() => regenerateToken(item)}
                >
                  <a key="list-regenerate">
                    <RedoOutlined />
                  </a>
                </Popconfirm>,
                <Popconfirm title="Are you sure to delete?" onConfirm={() => deleteToken(item)}>
                  <a key="list-delete">
                    <DeleteOutlined style={{ color: "red" }} />
                  </a>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta title={item.name} description={item.token} />
            </List.Item>
          )}
        />
      )}
    </Spin>
  );
};

export default TokenView;
