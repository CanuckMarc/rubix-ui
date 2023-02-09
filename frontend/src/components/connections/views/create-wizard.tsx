import { useEffect, useState } from "react";
import { Modal, Spin, Steps, Button } from "antd";
import { CreateConnectionForm } from "./create-form";
import { TokenForm } from "./token-form";
import { storage } from "../../../../wailsjs/go/models";
import { openNotificationWithIcon } from "../../../utils/utils";
import { PingRubixAssist } from "../../../../wailsjs/go/backend/App";
import RubixConnection = storage.RubixConnection;

const { Step } = Steps;


// enum Status {
//   wait = 'wait',
//   process = 'process',
//   finish = 'finish',
//   error = 'error'
// }

interface WizardDataType {
  id: number;
  name: string;
  // status: Status | undefined;
  text: string;
  content: JSX.Element
}

export const CreateConnectionWizard = (props: any) => {
  const { currentConnection, connectionSchema, isLoadingForm, refreshList, tokenFactory, isWizardModalVisible, setIsWizardModalVisible } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [newConnection, setNewConnection] = useState({} as RubixConnection)
  const [currentStep, setCurrentStep] = useState(0);

  const pingConnection = (conn: RubixConnection) => {
    PingRubixAssist(conn.uuid).then((ok) => {
      if (ok) {
        openNotificationWithIcon("success", `new connection ${conn.name} is able to access rubix assist server!`);
        setCurrentStep(currentStep + 1)
      } else {
        openNotificationWithIcon("error", `new connection ${conn.name} cannot access rubix assist server!`);
      }
    });
    // fetch().catch(console.error);
  };
  
  const data = [
    { id: "1", name: "Step 1", text: 'Create connection', content: (
      <div style={{width: '35vw'}}>
        <CreateConnectionForm 
          currentConnection={currentConnection} 
          connectionSchema={connectionSchema} 
          isLoadingForm={isLoadingForm} 
          refreshList={refreshList}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          setNewConnection={setNewConnection}
        />
      </div>
    ) },
    { id: "2", name: "Step 2", text: 'Ping connection', content: (
      <div>
        <Button onClick={() => pingConnection(newConnection)}>Ping connection</Button>
      </div>
    ) },
    { id: "3", name: "Step 3", text: 'Configure tokens', content: (
      <div style={{width: '35vw'}}>
        <TokenForm 
          factory={tokenFactory}
          selectedItem={newConnection}
        />
      </div>
    ) }
  ];

  const onStepsChange = (value: number) => {
    console.log('onChange:', value);
    setCurrentStep(value);
  };

  const handleWizardClose = () => {
    setCurrentStep(0)
    setIsWizardModalVisible(false)
  }
  
  return (
    <Modal
      title={'Create Connection'}
      visible={isWizardModalVisible}
      width={'50vw'}
      onCancel={handleWizardClose}
      footer={null}
      destroyOnClose={true}
      confirmLoading={isLoading}
      maskClosable={false} 
      style={{ textAlign: "start" }}
  >
    <div style={{display: 'flex', flexDirection: 'column', rowGap: '2vh', alignItems: 'center'}}>
      <Steps direction="horizontal" current={currentStep} onChange={onStepsChange} style={{width: '45vw'}}>
        {data.map((item, index) => (       
          <Step key={index} title={item.name} description={item.text} />
        ))}
      </Steps>
      <div>{data[currentStep].content}</div>
    </div>
  </Modal>
  )
}

