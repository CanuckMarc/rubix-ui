import { Button, Input, Tooltip } from "antd";
import { FormOutlined } from "@ant-design/icons";
import { useState, ChangeEvent, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ChirpFactory } from "../factory";
import { generateUuid } from "../../rubix-flow/lib/generateUuid";

export const ActiveForm = (props: any) => {
  const { devEUI, refreshList, handleWizardClose } = props;
  const { connUUID = "", hostUUID = "" } = useParams();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [key, setKey] = useState("");

  const factory = new ChirpFactory();

  const handleSubmit = async () => {
    try {
      setConfirmLoading(true);
      await factory.CSDeviceOTAKeys(connUUID, hostUUID, devEUI.devEUI, key);
      refreshList();
      handleWizardClose();
    } catch (err) {
      console.log(err);
    } finally {
      setConfirmLoading(false);
    }
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setKey(event.target.value);
  };

  const generateKey = () => {
    setKey(generateUuid());
  }

  useEffect(() => {
    setKey("");
  }, []);

  if (!devEUI) return <span>No device EUI</span>;

  return (
    <>
      <div style={{display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'center'}}>
        <Input value={key} onChange={onChange} style={{width: '500px'}} placeholder="Please enter a key..." />
        <Tooltip title="Generate key">
            <a onClick={() => generateKey()}>
              <FormOutlined />
            </a>
          </Tooltip>
      </div>
      <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>Activate</Button>
    </>
  );
};
