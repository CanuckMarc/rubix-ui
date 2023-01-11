import { List, Popconfirm, Spin, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { CheckOutlined, CloseOutlined, DeleteOutlined, EyeOutlined, RedoOutlined } from "@ant-design/icons";
import { externaltoken } from "../../../wailsjs/go/models";
import { CommonTokenFactory } from "./factory";
import { copyTextToClipboard } from "../../utils/utils";

export const TokenView = (props: ITokenView) => {
  const { jwtToken, tokens = [], isLoading, factory, fetchToken, setIsLoading } = props;
  const [displayToken, setDisplayToken] = useState({} as externaltoken.ExternalToken);
  const [regeneratedToken, setRegeneratedToken] = useState({} as externaltoken.ExternalToken);

  useEffect(() => {
    setRegeneratedToken({} as externaltoken.ExternalToken);
    setDisplayToken({} as externaltoken.ExternalToken);
  }, [jwtToken]);

  const getToken = async (token: externaltoken.ExternalToken) => {
    setIsLoading(true);
    try {
      const externalToken = await factory.Token(jwtToken, token.uuid);
      setDisplayToken(externalToken || ({} as externaltoken.ExternalToken));
      if (externalToken && externalToken.token) {
        copyTextToClipboard(externalToken.token, "Copy TOKEN to clipboard!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTokenBlockState = async (token: externaltoken.ExternalToken) => {
    await factory.TokenBlock(jwtToken, token.uuid, !token.blocked);
    fetchToken().catch(console.error);
  };

  const regenerateToken = async (token: externaltoken.ExternalToken) => {
    const externalToken = await factory.TokenRegenerate(jwtToken, token.uuid);
    setRegeneratedToken(externalToken);
    fetchToken().catch(console.error);
  };

  const deleteToken = async (token: externaltoken.ExternalToken) => {
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
          renderItem={(item) => (
            <List.Item
              actions={[
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

interface ITokenView {
  jwtToken: string;
  tokens: externaltoken.ExternalToken[];
  isLoading: boolean;
  factory: CommonTokenFactory;
  fetchToken: any;
  setIsLoading: any;
}

export default TokenView;
