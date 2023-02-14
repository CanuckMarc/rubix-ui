import { useEffect, useState } from "react";
import { FlowFrameworkNetworkFactory } from "../factory";
import { useParams } from "react-router-dom";
import { Checkbox, Form, Input, Modal } from "antd";
import { DebounceInputForm, SelectOption, ValidateStatus } from "../../../../../../../common/debounce-form-input";
import { TokenFormInput } from "../../../../../../../common/token-form-input";
import { HostsFactory } from "../../../../../factory";
import { hasError } from "../../../../../../../utils/response";
import { openNotificationWithIcon } from "../../../../../../../utils/utils";


export const CreateEditModal = (props: any) => {
  const [form] = Form.useForm();

  const { currentItem, isModalVisible, refreshList, onCloseModal } = props;
  const { connUUID = "", hostUUID = "" } = useParams();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [ipValidationStatus, setIpValidationStatus] = useState(ValidateStatus.initial);
  const [flowIPOptions, setFlowIPOptions] = useState([] as SelectOption[]);
  const [remoteHostUUID, setRemoteHostUUID] = useState("");

  const factory = new FlowFrameworkNetworkFactory();
  const factoryHost = new HostsFactory();
  factory.connectionUUID = factoryHost.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  useEffect(() => {
    factoryHost.GetAll().then(hosts => {
      setFlowIPOptions(hosts.map(host => {
        return { label: `${host?.name} (${host.ip})`, value: host?.ip, uuid: host?.uuid };
      }));
    });
  }, []);

  useEffect(() => {
    form.setFieldsValue({ ...currentItem });
  }, [currentItem]);

  useEffect(() => {
    setIpValidationStatus(ValidateStatus.initial);
    if (currentItem.flow_ip) {
      setIpValidationStatus(ValidateStatus.validating);
      const remoteHostUUID = getHostUUIDFromIp(currentItem.flow_ip);
      setRemoteHostUUID(remoteHostUUID);
      if (remoteHostUUID) {
        factory.FFSystemPing(remoteHostUUID).then(res => {
          if (hasError(res)) {
            setIpValidationStatus(ValidateStatus.error);
          } else {
            setIpValidationStatus(ValidateStatus.success);
          }
        });
      } else {
        setIpValidationStatus(ValidateStatus.error);
      }
    }
  }, [currentItem.flow_ip]);

  const _onCloseModal = () => {
    form.resetFields();
    onCloseModal();
  };

  const getIpFromHostUUID = (hostUUID: string): string => {
    const record = flowIPOptions.find(flowIpRecord => flowIpRecord.uuid === hostUUID);
    return record?.value ?? "";
  };

  const getHostUUIDFromIp = (ip: string): string => {
    const record = flowIPOptions.find(flowIpRecord => flowIpRecord.value === ip);
    return record?.uuid ?? "";
  };

  const handleSubmit = async () => {
    const network: any = {
      flow_https: false,
      flow_https_local: false,
      flow_port: 1660,
      flow_port_local: 1660,
      is_token_auth: true,
      is_master_slave: false,
      flow_ip: getIpFromHostUUID(remoteHostUUID),
      flow_ip_local: getIpFromHostUUID(hostUUID),
      name: form.getFieldValue("name"),
      is_remote: form.getFieldValue("is_remote"),
      flow_token: form.getFieldValue("flow_token"),
      flow_token_local: form.getFieldValue("flow_token_local"),
    };
    try {
      setConfirmLoading(true);
      let res;
      if (currentItem.uuid) {
        network.uuid = currentItem.uuid;
        res = await factory.Update(network.uuid, network);
      } else {
        res = await factory.Add(network);
      }
      if (hasError(res)) {
        openNotificationWithIcon("error", res.msg);
      } else {
        refreshList();
        onCloseModal();
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  const showAdditionalFields = Form.useWatch('is_remote', form);

  return (
    <>
      <Modal
        title={currentItem.uuid ? `Edit ${currentItem.name}` : "Add New Flow Network"}
        visible={isModalVisible}
        onOk={() => handleSubmit()}
        onCancel={_onCloseModal}
        confirmLoading={confirmLoading}
        okText="Save"
        maskClosable={false}
        style={{ textAlign: "start" }}
      >
        <Form
          form={form}
          layout="vertical"
          onSubmitCapture={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[
              {
                required: true,
                message: 'Please input the Name',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="is_remote" valuePropName="checked">
            <Checkbox>Is Remote Network</Checkbox>
          </Form.Item>
          {
            showAdditionalFields && <>
              <DebounceInputForm
                name="flow_ip"
                label="Flow IP Remote"
                placeholder="1.1.1.1"
                validationStatus={ipValidationStatus}
                rules={[
                  {
                    required: true,
                    message: 'Flow IP Remote is a required field',
                  }
                ]}
                options={flowIPOptions}
                onCall={async (ip: string) => {
                  if (ip !== currentItem.flow_ip) {
                    form.setFieldsValue({
                      "flow_token": ""
                    });
                  } else {
                    form.setFieldsValue({
                      "flow_token": currentItem.flow_token
                    });
                  }
                  const _remoteHostUUID = getHostUUIDFromIp(ip);
                  setRemoteHostUUID(_remoteHostUUID);
                  const res = await factory.FFSystemPing(_remoteHostUUID);
                  if (hasError(res)) {
                    return Promise.resolve({ error: res.msg, success: false });
                  }
                  return Promise.resolve({ success: true });
                }}
              />
              <TokenFormInput
                form={form}
                name="flow_token_local"
                label="Flow Token Local"
                rules={[
                  {
                    required: true,
                    message: 'Flow IP Remote is a required field',
                  }
                ]}
                onCall={async (username: string, password: string) => {
                  const ffToken = await factory.FFToken(hostUUID, remoteHostUUID, username, password);
                  if (hasError(ffToken)) {
                    return Promise.resolve({
                      msg: ffToken.msg,
                      success: false
                    });
                  }
                  return Promise.resolve({
                    token: ffToken.data,
                    success: true
                  });
                }}
              />
              <TokenFormInput
                form={form}
                name="flow_token"
                label="Flow Token Remote"
                rules={[
                  {
                    required: true,
                    message: 'Flow IP Remote is a required field',
                  }
                ]}
                onCall={async (username: string, password: string) => {
                  const ffToken = await factory.FFToken(remoteHostUUID, hostUUID, username, password);
                  if (hasError(ffToken)) {
                    return Promise.resolve({
                      msg: ffToken.msg,
                      success: false
                    });
                  }
                  return Promise.resolve({
                    token: ffToken.data,
                    success: true
                  });
                }}
              />
            </>
          }
        </Form>
      </Modal>
    </>
  );
};
