import { useEffect, useState } from "react";
import { Modal, Spin, Steps, Button, StepsProps, Image } from "antd";
import { CreateConnectionForm } from "./create-form";
import { TokenForm } from "./token-form";
import { storage } from "../../../../wailsjs/go/models";
import { openNotificationWithIcon } from "../../../utils/utils";
import { PingRubixAssist } from "../../../../wailsjs/go/backend/App";
import RubixConnection = storage.RubixConnection;

const { Step } = Steps;

export const CreateConnectionWizard = (props: any) => {
  const { connectionSchema, isLoadingForm, refreshList, tokenFactory, isWizardModalVisible, setIsWizardModalVisible } =
    props;
  const [newConnection, setNewConnection] = useState({} as RubixConnection);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<StepsProps["status"]>("process");
  const [errorAtPing, setErrorAtPing] = useState(false);

  useEffect(() => {
    setStepStatus("process");
  }, [isWizardModalVisible]);

  const pingConnection = (conn: RubixConnection) => {
    PingRubixAssist(conn.uuid).then((ok) => {
      if (ok) {
        openNotificationWithIcon("success", `new connection ${conn.name} is able to access rubix assist server!`);
        setCurrentStep(currentStep + 1);
      } else {
        openNotificationWithIcon("error", `new connection ${conn.name} cannot access rubix assist server!`);
        setStepStatus("error");
        setErrorAtPing(true);
      }
    });
  };

  const data = [
    {
      id: "1",
      name: "Step 1",
      text: "Create connection",
      content: (
        <div style={{ width: "35vw" }}>
          <CreateConnectionForm
            currentConnection={newConnection}
            connectionSchema={connectionSchema}
            isLoadingForm={isLoadingForm}
            refreshList={refreshList}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            setNewConnection={setNewConnection}
          />
        </div>
      ),
    },
    {
      id: "2",
      name: "Step 2",
      text: "Ping connection",
      content: (
        <div style={{ display: "flex", flexDirection: "column", rowGap: "20px", alignItems: "center" }}>
          <Button type="primary" onClick={() => pingConnection(newConnection)} style={{ width: "160px" }}>
            Ping new connection
          </Button>
          {errorAtPing && (
            <strong style={{ color: "red" }}>Error accessing rubix assist server, go back to step one.</strong>
          )}
        </div>
      ),
    },
    {
      id: "3",
      name: "Step 3",
      text: "Configure tokens",
      content: (
        <div style={{ width: "35vw", display: "flex", flexDirection: "column", rowGap: "2vh", alignItems: "center" }}>
          {newConnection.external_token === "" ? (
            <TokenForm factory={tokenFactory} selectedItem={newConnection} hostOrConn={"conn"} />
          ) : (
            <strong>Token already included!</strong>
          )}
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
    setNewConnection({} as RubixConnection);
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
