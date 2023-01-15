import { Button, Card, Form, FormInstance, Input, Modal } from "antd";
import { createRef, useEffect, useState } from "react";
import TokenView from "./token-view";
import { amodel, externaltoken, storage } from "../../../wailsjs/go/models";
import { PlusOutlined } from "@ant-design/icons";
import TokenGeneratorModal from "./token-generator-modal";
import { useSettings } from "../../components/settings/use-settings";
import { LIGHT_THEME } from "../../themes/use-theme";
import { CommonTokenFactory } from "./factory";

import ExternalToken = externaltoken.ExternalToken;
import RubixConnection = storage.RubixConnection;
import Host = amodel.Host;

interface ITokenModel {
  isModalVisible: boolean;
  displayName: string;
  onCloseModal: any;
  factory: CommonTokenFactory;
  selectedItem: RubixConnection | Host;
}

export const TokenModal = (props: ITokenModel) => {
  const { isModalVisible, displayName, onCloseModal, factory, selectedItem } = props;
  const [settings] = useSettings();

  const [jwtToken, setJwtToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<ExternalToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenGenerateModalVisible, setIsTokenGenerateModalVisible] = useState(false);
  const loginFormRef = createRef<FormInstance>();

  const handleClose = () => {
    setJwtToken("");
    setLoading(false);
    setTokens([]);
    setIsLoading(false);
    setIsTokenGenerateModalVisible(false);
    loginFormRef?.current?.resetFields();
    onCloseModal();
  };

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
      setIsLoading(true);
      try {
        const tokens = await factory.Tokens(jwtToken);
        setTokens(tokens || undefined); // restrict to pass null to child
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchToken().catch(console.error);
  }, [jwtToken]);

  return (
    <Modal
      centered
      title={displayName}
      visible={isModalVisible}
      maskClosable={false}
      footer={null}
      onCancel={handleClose}
      style={{ textAlign: "start" }}
      width="50%"
    >
      <Card
        title="Tokens"
        style={{ backgroundColor: settings.theme == LIGHT_THEME ? "fff" : "" }}
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
          isLoading={isLoading}
          factory={factory}
          selectedItem={selectedItem}
          fetchToken={fetchToken}
          setIsLoading={setIsLoading}
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
    </Modal>
  );
};
