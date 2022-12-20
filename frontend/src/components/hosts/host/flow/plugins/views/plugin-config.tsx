import { Drawer } from "antd";
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

  useEffect(() => {
    getPluginConfig();
  }, []);

  return (
    <Drawer title={pluginName} placement="right" onClose={onCloseDrawer} visible={isVisible} maskClosable={false}>
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
