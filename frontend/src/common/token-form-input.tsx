import { Button, Col, Form, Input, Row, Tooltip } from "antd";
import { FormInstance, Rule, } from "antd/lib/form";
import { ArrowLeftOutlined, ArrowRightOutlined, LoadingOutlined, ScanOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

export interface TokenFormInputProps {
  name: string;
  form: FormInstance<any>;
  label?: string;
  placeholder?: string;
  rules?: Rule[];
  onCall: (username: string, password: string) => Promise<TokenFormLoginResponse>;
}

export interface TokenFormLoginResponse {
  token?: string,
  success: boolean,
}

export const TokenFormInput = (props: TokenFormInputProps) => {
  const [useAuth, setUseAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");

  const [form] = Form.useForm();
  const [, forceUpdate] = useState({});

  const toggleAuth = () => {
    setUseAuth(!useAuth);
  };

  useEffect(() => {
    props.form.setFieldsValue({
      [props.name]: token
    });
  }, [useAuth]);

  const onLogin = () => {
    setIsLoading(true);
    const username = form.getFieldValue("username");
    const password = form.getFieldValue("password");

    props.onCall(username, password).then((response) => {
      setIsLoading(false);
      if (response.success) {
        setToken(response.token ?? "");
        setUseAuth(false);
      }
    });
  };

  return useAuth ?
    <Form.Item label={props.label} required>
      <Form
        form={form}
        onFinish={onLogin}
        component={false}
      >
        <Row align="top" style={{ maxHeight: 32 }} wrap={false}>
          <Col flex="none">
            <Form.Item
              help=""
              validateStatus="">
              <Tooltip title="Go back to manual entry">
                <Button icon={<ArrowLeftOutlined />} onClick={toggleAuth} />
              </Tooltip>
            </Form.Item>
          </Col>
          <Col flex="auto">
            <Form.Item
              name="username"
              help=""
              validateStatus=""
              rules={[
                {
                  required: true,
                  message: 'Please input your username!'
                }
              ]}
            >
              <Input placeholder="Username" />
            </Form.Item>
          </Col>
          <Col flex="auto">
            <Form.Item
              name="password"
              help=""
              validateStatus=""
              rules={[
                {
                  required: true,
                  message: 'Please input your password!'
                }
              ]}
            >
              <Input.Password
                type="password"
                placeholder="Password"
              />
            </Form.Item>
          </Col>
          <Col flex="none">
            <Form.Item shouldUpdate>
              {() => <Tooltip title="Login">
                <Button
                  icon={isLoading ? <LoadingOutlined /> : <ArrowRightOutlined />}
                  onClick={onLogin}
                  disabled={
                    !form.isFieldsTouched(true) ||
                    !!form.getFieldsError().filter(({ errors }) => errors.length).length
                  }
                />
              </Tooltip>
              }
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Form.Item>
    :
    <Row align="bottom">
      <Col flex="auto">
        <Form.Item
          name={props.name}
          label={props.label}
          rules={props.rules}
          initialValue={token}
          shouldUpdate={(prevValues, curValues) => {
            return prevValues.token !== curValues.token;
          }}
        >
          <Input
            placeholder={props.placeholder}
          >
          </Input>
        </Form.Item>
      </Col>
      <Col flex="32px">
        <Form.Item>
          <Tooltip title="Login to generate token">
            <Button icon={<ScanOutlined />} onClick={toggleAuth} />
          </Tooltip>
        </Form.Item>
      </Col>
    </Row>;
};
