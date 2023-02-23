import { useEffect, useState } from "react";
import { Modal, Spin, Steps, Button, StepsProps, Image } from "antd";
import { pluginLogo } from "../../../../../../utils/utils";

// import { CreateConnectionForm } from "./create-form";
// import { TokenForm } from "./token-form";
// import { storage } from "../../../../wailsjs/go/models";
// import { openNotificationWithIcon } from "../../../utils/utils";
// import { PingRubixAssist } from "../../../../wailsjs/go/backend/App";
// import RubixConnection = storage.RubixConnection;

const { Step } = Steps;

const loraImage = pluginLogo("lora");
const bacnetImage = pluginLogo("bacnet");
const modbusImage = pluginLogo("modbus");
const imageBoxStyle = {
  width: 150,
  height: 100,
  backgroundColor: "rgba(68,87,96,255)",
  border: "5px solid gray",
  padding: "10px",
  margin: "10px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

export const NetworkWizard = (props: any) => {
  const { connectionSchema, isLoadingForm, refreshList, tokenFactory, isWizardModalVisible, setIsWizardModalVisible } =
    props;
  //   const [newConnection, setNewConnection] = useState({} as RubixConnection);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<StepsProps["status"]>("process");
  const [errorAtPing, setErrorAtPing] = useState(false);

  useEffect(() => {
    setStepStatus("process");
  }, [isWizardModalVisible]);

  //   const pingConnection = (conn: RubixConnection) => {
  //     PingRubixAssist(conn.uuid).then((ok) => {
  //       if (ok) {
  //         openNotificationWithIcon("success", `new connection ${conn.name} is able to access rubix assist server!`);
  //         setCurrentStep(currentStep + 1);
  //       } else {
  //         openNotificationWithIcon("error", `new connection ${conn.name} cannot access rubix assist server!`);
  //         setStepStatus("error");
  //         setErrorAtPing(true);
  //       }
  //     });
  //   };

  const data = [
    {
      id: "1",
      name: "Step 1",
      text: "Network selection",
      content: (
        <div style={{ width: "50vw" }}>
          <div style={{ display: "flex", flexDirection: "row", gap: "5px" }}>
            <div style={imageBoxStyle}>
              <Image width={100} preview={false} src={loraImage} />
            </div>
            <div style={imageBoxStyle}>
              <Image width={100} preview={false} src={bacnetImage} />
            </div>
            <div style={imageBoxStyle}>
              <Image width={100} preview={false} src={modbusImage} />
            </div>
            <div style={imageBoxStyle}>
              <Image width={100} preview={false} src={modbusImage} />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "2",
      name: "Step 2",
      text: "Ping connection",
      content: (
        <div style={{ display: "flex", flexDirection: "column", rowGap: "20px", alignItems: "center" }}>
          <span>Step2</span>
        </div>
      ),
    },
    {
      id: "3",
      name: "Step 3",
      text: "Configure tokens",
      content: (
        <div style={{ width: "35vw", display: "flex", flexDirection: "column", rowGap: "2vh", alignItems: "center" }}>
          <span>step3</span>
          <Button type="primary" onClick={() => handleWizardClose()} style={{ width: "120px" }}>
            Finish
          </Button>
        </div>
      ),
    },
  ];

  const onStepsChange = (value: number) => {
    if (stepStatus === "error") {
      setStepStatus("process");
      setErrorAtPing(false);
    }
    setCurrentStep(value);
  };

  const handleWizardClose = () => {
    // setNewConnection({} as RubixConnection);
    setCurrentStep(0);
    setIsWizardModalVisible(false);
    refreshList();
  };

  return (
    <Modal
      title={"Create Connection"}
      visible={isWizardModalVisible}
      width={"50vw"}
      onCancel={handleWizardClose}
      footer={null}
      destroyOnClose={true}
      maskClosable={false}
      style={{ textAlign: "start" }}
    >
      <div style={{ display: "flex", flexDirection: "column", rowGap: "2vh", alignItems: "center" }}>
        <Steps
          direction="horizontal"
          current={currentStep}
          onChange={onStepsChange}
          style={{ width: "45vw" }}
          status={stepStatus}
        >
          {data.map((item, index) => (
            <Step key={index} title={item.name} description={item.text} />
          ))}
        </Steps>
        <div>{data[currentStep].content}</div>
      </div>
    </Modal>
  );
};
