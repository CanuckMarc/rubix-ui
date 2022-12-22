import { ChangeEvent, useEffect, useState } from "react";
import { Input, Modal } from "antd";
import { SettingsFactory } from "../factory";
import { openNotificationWithIcon } from "../../../utils/utils";
import { useSettings } from "../use-settings";
import { hasError } from "../../../utils/response";

export const TokenModal = (props: any) => {
  const { isModalVisible, onClose } = props;
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isTokenChange, setIsTokenChange] = useState(false);
  const [token, setToken] = useState("");
  const [_, setSettings] = useSettings();

  const factory = new SettingsFactory();

  useEffect(() => {
    getToken().then();
  }, [isModalVisible]);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setToken(e.target.value);
    setIsTokenChange(true);
  };

  const getToken = async () => {
    try {
      const res = await factory.GetGitToken();
      if (!hasError(res)) {
        setToken(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleOk = async () => {
    if (!isTokenChange) {
      openNotificationWithIcon("warning", "Token is not changed!");
      onClose();
    } else {
      setConfirmLoading(true);
      try {
        const res = await factory.SetGitToken(token);
        if (!hasError(res)) {
          setSettings(res.data);
          openNotificationWithIcon("success", "Token is updated successfully!");
        }
        onClose();
      } catch {
        setToken("");
      } finally {
        setConfirmLoading(false);
      }
    }
  };

  return (
    <Modal
      title="Token Update"
      centered
      width={600}
      visible={isModalVisible}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={confirmLoading}
    >
      <Input
        placeholder="please enter token..."
        onChange={onChange}
        value={token}
      />
    </Modal>
  );
};
