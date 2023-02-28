import { List, Popconfirm, Spin, Tooltip } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  DiffOutlined,
  EyeOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import copy from "copy-to-clipboard";
import { amodel, externaltoken, storage } from "../../../wailsjs/go/models";
import { openNotificationWithIcon } from "../../utils/utils";
import { CommonTokenFactory } from "./factory";
import { useParams } from "react-router-dom";
import { ConnectionFactory } from "../../components/connections/factory";
import { HostsFactory } from "../../components/hosts/factory";
import { Result, ResultState } from "../state/state";
import ExternalToken = externaltoken.ExternalToken;
import RubixConnection = storage.RubixConnection;
import Host = amodel.Host;

interface ITokenView {
  jwtToken: string;
  tokens: ExternalToken[];
  resultState: Result;
  factory: CommonTokenFactory;
  fetchToken: any;
  setResultState: (input: Result) => void;
  style: any;
  selectedItem: RubixConnection | Host;
}


export const TokenView = (props: ITokenView) => {
  const { jwtToken, tokens = [], resultState, factory, fetchToken, setResultState, selectedItem } = props;
  const { connUUID = "" } = useParams();
  const [displayToken, setDisplayToken] = useState(new Map<string, ExternalToken>());
  const [isAddingToken, setIsAdddingToken] = useState(false);

  const connectionFactory = new ConnectionFactory();
  const hostsFactory = new HostsFactory();
  hostsFactory.connectionUUID = connUUID;

  useEffect(() => {
    setDisplayToken(new Map<string, ExternalToken>());
  }, [jwtToken]);

  const getToken = async (token: ExternalToken) => {
    setResultState({ state: ResultState.loading });
    try {
      const externalToken = await factory.Token(jwtToken, token.uuid);
      displayToken.set(externalToken.uuid, externalToken);

      setDisplayToken(displayToken);
      setResultState({ state: ResultState.success });
      if (externalToken && externalToken.token) {
        copy(externalToken.token);
        openNotificationWithIcon("success", "Copied Token to Clipboard!");
      }
    } finally {
      setResultState({ state: ResultState.failure, message: "Something went wrong" });
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
    const externalToken: ExternalToken = await factory.TokenRegenerate(jwtToken, token.uuid);
    displayToken.set(externalToken.uuid, externalToken);
    setDisplayToken(displayToken);
    fetchToken().catch(console.error);
  };

  const deleteToken = async (token: ExternalToken) => {
    await factory.TokenDelete(jwtToken, token.uuid);
    fetchToken().catch(console.error);
  };

  function renderName(item: externaltoken.ExternalToken) {
    const token = displayToken.get(item.uuid);
    if (token) return token.token;
    return item.token;
  }

  return (
    <Spin spinning={resultState.state == ResultState.loading}>
      <List
        itemLayout="horizontal"
        dataSource={tokens}
        loading={isAddingToken}
        style={props.style}
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
            <List.Item.Meta title={item.name} description={renderName(item)}>
            </List.Item.Meta>
          </List.Item>
        )}
      />
    </Spin>
  );
};

export default TokenView;
