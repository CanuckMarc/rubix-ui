import { useEffect, useState } from "react";
import { Modal, Spin, Steps } from "antd";
import { CreateConnectionForm } from "./create-form";

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
  const { currentConnection, connectionSchema, isLoadingForm, refreshList, isWizardModalVisible, setIsWizardModalVisible } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // useEffect(() => {
  //   setCurrentStep(0)
  //   return () => {
  //     setCurrentStep(0)
  //   }
  // }, [])

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
        />
      </div>
    ) },
    { id: "2", name: "Step 2",  text: 'Ping connection', content: (<span>Yo</span>) },
    { id: "3", name: "Step 3", text: 'Configurate tokens', content: (<span>WHAT</span>) }
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
      // onOk={() => setIsWizardModalVisible(false)}
      width={'50vw'}
      onCancel={handleWizardClose}
      footer={null}
      destroyOnClose={true}
      confirmLoading={isLoading}
      // okButtonProps={{ disabled: validationError }}
      maskClosable={false} // prevent modal from closing on click outside
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

