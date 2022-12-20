import { Button, Drawer, Space } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import Highlight, { defaultProps } from "prism-react-renderer";
import theme from "prism-react-renderer/themes/nightOwl";
import { useState, Fragment, useEffect } from "react";
import { useParams } from "react-router-dom";
import Editor from "react-simple-code-editor";
import { FlowPluginFactory } from "../factory";

export const PluginConfig = (props: any) => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const { isVisible, pluginName, onclose } = props;
  const [code, setCode] = useState<string>(``);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const factory = new FlowPluginFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  const highlight = () => (
    <Highlight {...defaultProps} theme={theme} code={code} language="jsx">
      {({ className, style, tokens, getLineProps, getTokenProps }) => {
        return (
          <Fragment>
            {tokens.map((line, i) => (
              <div {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </Fragment>
        );
      }}
    </Highlight>
  );

  const saveButton = () => {
    return (
      <Space>
        <Button type="link" icon={<SaveOutlined />} loading={confirmLoading} onClick={updateConfig} />
      </Space>
    );
  };

  const onCloseDrawer = () => {
    onclose();
    setCode(``);
  };

  const onValueChange = (value: any) => {
    setCode(value);
  };

  const getPluginConfig = async () => {
    const { data } = await factory.EdgeGetConfigPlugin(connUUID, hostUUID, pluginName);
    setCode(data);
  };

  const updateConfig = async () => {
    try {
      setConfirmLoading(true);
      await factory.EdgeUpdateConfigPlugin(connUUID, hostUUID, pluginName, code);
      onCloseDrawer();
    } finally {
      setConfirmLoading(false);
    }
  };

  useEffect(() => {
    getPluginConfig();
  }, []);

  return (
    <Drawer
      title={pluginName}
      placement="right"
      onClose={onCloseDrawer}
      visible={isVisible}
      maskClosable={false}
      extra={saveButton()}
    >
      <Editor
        value={code}
        onValueChange={onValueChange}
        highlight={highlight}
        padding={10}
        style={{
          boxSizing: "border-box",
          fontFamily: '"Dank Mono", "Fira Code", monospace',
          ...theme.plain,
        }}
      />
    </Drawer>
  );
};
