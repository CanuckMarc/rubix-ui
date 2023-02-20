import { Button, Input, Tooltip } from "antd";
import { RetweetOutlined } from "@ant-design/icons";
import { useState, ChangeEvent, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ChirpFactory } from "../factory";
import { generateUuid } from "../../rubix-flow/lib/generateUuid";

export const ActiveForm = (props: any) => {
  const { devEUI, refreshList, handleWizardClose, setStepStatus } = props;
  const { connUUID = "", hostUUID = "" } = useParams();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [key, setKey] = useState("");

  const factory = new ChirpFactory();

  const handleSubmit = async () => {
    try {
      setConfirmLoading(true);
      const res = await factory.CSDeviceOTAKeys(connUUID, hostUUID, devEUI, key);
      if (res) {
        refreshList();
        handleWizardClose();
      } else {
        setStepStatus('error');
      }
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

  if (!devEUI) return <span style={{color: 'red'}}>Warning: No device EUI set, complete step one first!</span>;

  return (
    <>
      <div style={{display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'center'}}>
        <Input value={key} onChange={onChange} style={{width: '500px'}} placeholder="Please enter a key..." />
        <Tooltip title="Generate key">
            <a onClick={() => generateKey()}>
              <RetweetOutlined />
            </a>
          </Tooltip>
      </div>
      <div style={{display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'center'}}>
        <Button type="primary" loading={confirmLoading} onClick={handleSubmit}>Activate</Button>
        <Button type='dashed' onClick={() => handleWizardClose()}>Skip</Button>
      </div>
    </>
  );
};
