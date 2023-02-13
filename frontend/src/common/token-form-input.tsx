import { Button, Col, Form, Input, Row, Tooltip } from "antd";
import { FormInstance, Rule, } from "antd/lib/form";
import { ArrowLeftOutlined, ArrowRightOutlined, LoadingOutlined, ScanOutlined } from "@ant-design/icons";
import { useState } from "react";
import { ValidateStatus } from "antd/lib/form/FormItem";

export interface TokenFormInputProps {
  name: string;
  form: FormInstance;
  label?: string;
  placeholder?: string;
  rules?: Rule[];
  onCall: (username: string, password: string) => Promise<TokenFormLoginResponse>;
}

export interface TokenFormLoginResponse {
  token?: string,
  success: boolean,
  msg?: string,
}

export const TokenFormInput = (props: TokenFormInputProps) => {
  const [useAuth, setUseAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validateStatus, setValidateStatus] = useState("success" as ValidateStatus);

  const [form] = Form.useForm();

  const toggleAuth = () => {
    setUseAuth(!useAuth);
  };

  const onChange = () => {
    setError("");
    setValidateStatus("success");
  };

  const onLogin = () => {
    setIsLoading(true);
    const username = form.getFieldValue("username");
    const password = form.getFieldValue("password");

    props.onCall(username, password).then((response) => {
      setIsLoading(false);
      if (response.success) {
        props.form.setFieldsValue({
          [props.name]: response.token ?? ""
        });
        setUseAuth(false);
        form.resetFields()
      } else {
        setError(response?.msg ?? "");
        setValidateStatus("error");
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
            <Form.Item>
              <Tooltip title="Go back to manual entry">
                <Button icon={<ArrowLeftOutlined />} onClick={toggleAuth} />
              </Tooltip>
            </Form.Item>
          </Col>
          <Col flex="auto">
            <Form.Item
              name="username"
              help={error}
              validateStatus={validateStatus}
              rules={[
                {
                  required: true,
                  message: 'Please input your username'
                }
              ]}
            >
              <Input
                placeholder="Username"
                onChange={onChange}
              />
            </Form.Item>
          </Col>
          <Col flex="auto">
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Please input your password'
                }
              ]}
            >
              <Input.Password
                type="password"
                placeholder="Password"
                onChange={onChange}
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
