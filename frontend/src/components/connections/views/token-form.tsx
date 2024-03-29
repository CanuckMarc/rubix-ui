import { Button, Card, Form, FormInstance, Input } from "antd";
import { createRef, useEffect, useState } from "react";
import TokenView from "../../../common/token/token-view";
import TokenGeneratorModal from "../../../common/token/token-generator-modal";
import { PlusOutlined } from "@ant-design/icons";
import { externaltoken } from "../../../../wailsjs/go/models";
import { Result, ResultState } from "../../../common/state/state";
import ExternalToken = externaltoken.ExternalToken;

export const TokenForm = (props: any) => {
  const { factory, selectedItem, hostOrConn } = props;
  const [jwtToken, setJwtToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<ExternalToken[]>([]);
  const [listResultState, setListResultState] = useState<Result>({ state: ResultState.initital });
  const [isTokenGenerateModalVisible, setIsTokenGenerateModalVisible] = useState(false);
  const loginFormRef = createRef<FormInstance>();

  useEffect(() => {
    if (hostOrConn === "host") factory.hostUUID = selectedItem.uuid;
    if (hostOrConn === "conn") factory.connectionUUID = selectedItem.uuid;
  }, [selectedItem]);

  const handleClose = () => {
    setJwtToken("");
    setLoading(false);
    setListResultState({ state: ResultState.initital });
    setTokens([]);
    setIsTokenGenerateModalVisible(false);
    loginFormRef?.current?.resetFields();
  };

  useEffect(() => {
    return () => {
      handleClose();
    };
  }, []);

  const onCloseTokenGeneratorModal = () => {
    setIsTokenGenerateModalVisible(false);
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const response = await factory.Login(values.username, values.password);
      if (response?.access_token) {
        setJwtToken(response?.access_token);
      } else {
        setTokens([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const showTokenGenerateModal = () => {
    setIsTokenGenerateModalVisible(true);
  };

  const fetchToken = async () => {
    if (jwtToken != "") {
      setListResultState({ state: ResultState.loading, message: "Loading fetch" });
      try {
        const tokens = await factory.Tokens(jwtToken);
        setTokens(tokens || undefined); // restrict to pass null to child
        setListResultState({ state: ResultState.success });
      } finally {
        setListResultState({ state: ResultState.failure, message: "Something went wrong" });
      }
    }
  };

  useEffect(() => {
    fetchToken().catch(console.error);
  }, [jwtToken]);

  return (
    <Card
      title="Tokens"
      style={{ width: "35vw", backgroundColor: "transparent" }}
      extra={
        jwtToken && <Button type="primary" icon={<PlusOutlined />} size="small" onClick={showTokenGenerateModal} />
      }
    >
      <Form
        name="basic"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
        ref={loginFormRef}
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[
            {
              required: true,
              message: "Please input your username!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit
          </Button>
        </Form.Item>
      </Form>

      <TokenView
        jwtToken={jwtToken}
        tokens={tokens}
        resultState={listResultState}
        factory={factory}
        selectedItem={selectedItem}
        fetchToken={fetchToken}
        setResultState={setListResultState}
        style={{ minHeight: 154, maxHeight: 300, overflowY: "auto" }}
      />
      {isTokenGenerateModalVisible && (
        <TokenGeneratorModal
          isModalVisible={true}
          jwtToken={jwtToken}
          onCloseModal={onCloseTokenGeneratorModal}
          factory={factory}
          fetchToken={fetchToken}
        />
      )}
    </Card>
  );
};
