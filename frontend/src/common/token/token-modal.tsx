import { Alert, Button, Card, Col, Dropdown, Form, FormInstance, Input, Menu, Modal, PageHeader, Row, Space } from "antd";
import { createRef, useEffect, useState } from "react";
import TokenView from "./token-view";
import { amodel, externaltoken, storage } from "../../../wailsjs/go/models";
import { PlusOutlined, MoreOutlined, } from "@ant-design/icons";
import TokenGeneratorModal from "./token-generator-modal";
import { useSettings } from "../../components/settings/use-settings";
import { LIGHT_THEME } from "../../themes/use-theme";
import { CommonTokenFactory } from "./factory";

import ExternalToken = externaltoken.ExternalToken;
import RubixConnection = storage.RubixConnection;
import Host = amodel.Host;
import { Result, ResultState } from "../state/state";

interface ITokenModel {
  isModalVisible: boolean;
  displayName: string;
  onCloseModal: any;
  factory: CommonTokenFactory;
  selectedItem: RubixConnection | Host;
}

enum FormState {
  LOGIN, CHANGE_PASSWORD, LIST
}

export const TokenModal = (props: ITokenModel) => {
  const { isModalVisible, displayName, onCloseModal, factory, selectedItem } = props;
  const [settings] = useSettings();

  const [jwtToken, setJwtToken] = useState("");
  const [state, setState] = useState(FormState.LOGIN)
  const [tokens, setTokens] = useState<ExternalToken[]>([]);
  const [resultState, setResultState] = useState<Result>({ state: ResultState.initital });
  const [listResultState, setListResultState] = useState<Result>({ state: ResultState.initital });
  const [isTokenGenerateModalVisible, setIsTokenGenerateModalVisible] = useState(false);
  const loginFormRef = createRef<FormInstance>();

  const handleClose = () => {
    setJwtToken("");
    setResultState({ state: ResultState.initital });
    setListResultState({ state: ResultState.initital });
    setTokens([]);
    setState(FormState.LOGIN)
    setIsTokenGenerateModalVisible(false);
    loginFormRef?.current?.resetFields();
    onCloseModal();
  };

  const onCloseTokenGeneratorModal = () => {
    setIsTokenGenerateModalVisible(false);
  };

  const toggleChangePassword = () => {
    if (state == FormState.CHANGE_PASSWORD) {
      setState(FormState.LIST)
    } else {
      setState(FormState.CHANGE_PASSWORD)
      setResultState({ state: ResultState.initital })
    }
  }

  const getSubtitle = () => {
    switch (state) {
      case FormState.LOGIN: return "Login"
      case FormState.CHANGE_PASSWORD: return "Change Password"
    }
    return ""
  }

  async function login(username: string, password: string) {
    try {
      setResultState({ state: ResultState.loading, message: "Loading login" });
      const response = await factory.Login(username, password);

      if (response) {
        setResultState({ state: ResultState.success });
        setState(FormState.LIST)
        if (response?.access_token) {
          setJwtToken(response?.access_token);
        } else {
          setTokens([]);
        }
      } else {
        setResultState({ state: ResultState.failure, message: "Failed login" });
      }
    } catch (e) {
      setResultState({ state: ResultState.failure, message: `Failed login` });
    }
  }

  async function changePassword(username: string, password: string) {
    try {
      setResultState({ state: ResultState.loading, message: "Loading login" });
      // TODO : Change password
      const response = {} as any;
      setResultState({ state: ResultState.success });
      setState(FormState.LIST)
    } catch (e) {
      setResultState({ state: ResultState.failure, message: `Failed login` });
    }
  }

  const onFinish = async (values: any) => {
    if (state == FormState.LOGIN) {
      await login(values.username, values.password);
    } else if (state == FormState.CHANGE_PASSWORD) {
      await changePassword(values.username, values.password);
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
      } catch (e) {
        setListResultState({ state: ResultState.failure, message: "Something went wrong" });
      }
    }
  };

  useEffect(() => {
    fetchToken().catch(console.error);
  }, [jwtToken]);

  const titleWidget = <Row align="middle" style={{ marginTop: - 2 }}>
    <Col className="ant-page-header-heading-title">{displayName + `: Tokens`}</Col>
    <Col className="ant-page-header-heading-sub-title" flex="auto" style={{ marginTop: 4 }}>{getSubtitle()}</Col>
    {jwtToken &&
      <Col flex="110px">
        <Dropdown.Button placement="bottomRight" type="primary"
          overlay={
            <Menu>
              <Menu.Item key="change-password" onClick={toggleChangePassword}>
                Change Password
              </Menu.Item>
            </Menu>
          }
          onClick={showTokenGenerateModal}
        >
          <PlusOutlined />
        </Dropdown.Button>
      </Col>}
  </Row>

  return (
    <Modal
      centered
      title={titleWidget}
      visible={isModalVisible}
      maskClosable={false}
      footer={null}
      onCancel={handleClose}
      style={{ textAlign: "start" }}
      bodyStyle={{ backgroundColor: settings.theme == LIGHT_THEME ? "fff" : "", }}
      width="50%"
    >
      {state != FormState.LIST && <Form
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
          <Space wrap>
            <Button type="primary" htmlType="submit" loading={resultState.state == ResultState.loading}>
              Submit
            </Button>
            {state == FormState.CHANGE_PASSWORD && <Button onClick={toggleChangePassword}>
              Cancel
            </Button>}
          </Space>
        </Form.Item>
      </Form>}
      {
        resultState.state == ResultState.failure &&
        resultState.message &&
        <Alert message={resultState.message} type="error" />
      }

      {state != FormState.LOGIN && <TokenView
        jwtToken={jwtToken}
        tokens={tokens}
        resultState={listResultState}
        factory={factory}
        selectedItem={selectedItem}
        fetchToken={fetchToken}
        setResultState={setListResultState}
        style={{ minHeight: 154, maxHeight: 300, overflowY: "auto" }}
      />}
      {isTokenGenerateModalVisible && (
        <TokenGeneratorModal
          isModalVisible={true}
          jwtToken={jwtToken}
          onCloseModal={onCloseTokenGeneratorModal}
          factory={factory}
          fetchToken={fetchToken}
        />
      )}
    </Modal>
  );
};
