import { useEffect, useState } from "react";
import { FlowFrameworkNetworkFactory } from "../factory";
import { useParams } from "react-router-dom";
import { Checkbox, Form, Input, Modal } from "antd";
import { DebounceInputForm, SelectOption } from "../../../../../../../common/debounce-form-input";
import { TokenFormInput } from "../../../../../../../common/token-form-input";
import { DefaultOptionType } from "rc-select/lib/Select";
import { HostsFactory } from "../../../../../factory";
import { hasError } from "../../../../../../../utils/response";


export const CreateEditModal = (props: any) => {
  const [form] = Form.useForm();

  const { currentItem, isModalVisible, refreshList, onCloseModal } = props;
  const { connUUID = "", hostUUID = "" } = useParams();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [flowIPOptions, setFlowIPOptions] = useState([] as SelectOption[]);

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
    form.setFieldsValue(currentItem);
  }, [currentItem]);

  const _onCloseModal = () => {
    form.resetFields();
    onCloseModal();
  };

  const handleSubmit = async () => {
    const network = form.validateFields;
    console.log("network", form);
    console.log("name", form.getFieldValue("name"));
    // network.flow_https = false;
    // network.flow_https_local = false;
    // network.is_token_auth = true;
    // network.is_master_slave = false;
    // try {
    //   setConfirmLoading(true);
    //   if (currentItem.uuid) {
    //     network.uuid = currentItem.uuid;
    //     await factory.Update(network.uuid, network);
    //   } else {
    //     await factory.Add(network);
    //   }
    //   refreshList();
    //   onCloseModal();
    // } catch (error) {
    // } finally {
    //   setConfirmLoading(false);
    // }
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
                rules={[
                  {
                    required: true,
                    message: 'Flow IP Remote is a required field',
                  }
                ]}
                options={flowIPOptions}
                onCall={async (ip: string) => {
                  console.log("input", ip)
                  const selectedRecord = flowIPOptions.find(flowIpRecord=> flowIpRecord.value === ip)
                  console.log("selectedRecord?.label", selectedRecord?.uuid)
                  const res = await factory.FFSystemPing(selectedRecord?.uuid as string);
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
                onCall={(username: string, password: string) => Promise.resolve({
                  token: "this is token",
                  success: true
                })}
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
                onCall={(username: string, password: string) => Promise.resolve({
                  token: "this is token",
                  success: true
                })}
              />
            </>
          }
        </Form>
      </Modal>
    </>
  );
};
