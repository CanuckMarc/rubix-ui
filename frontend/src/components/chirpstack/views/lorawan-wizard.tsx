import { useEffect, useState } from "react";
import { Modal, Steps, StepsProps } from "antd";
import { CreateEditForm } from "./create-form";
import { ActiveForm } from "./active-form";
const { Step } = Steps;

export const AddDeviceWizard = (props: any) => {
  const { refreshList, isWizardModalVisible, setIsWizardModalVisible } = props;
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<StepsProps['status']>('process');
  const [devEUI, setDevEUI] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    setStepStatus('process');
    setDevEUI(undefined);
  }, [])

  const handleWizardClose = () => {
    setCurrentStep(0);
    setIsWizardModalVisible(false);
    setStepStatus('process');
    setDevEUI(undefined);
    refreshList();
  }
  
  const data = [
    { id: "1", name: "Step 1", text: 'Create new device', content: (
      <div style={{width: '35vw'}}>
        <CreateEditForm
          refreshList={refreshList}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          setDevEUI={setDevEUI}
          setStepStatus={setStepStatus}
        />
      </div>
    ) },
    { id: "2", name: "Step 2", text: 'Activate new device', content: (
      <div style={{width: '35vw', display: 'flex', flexDirection: 'column', rowGap: '2vh', alignItems: 'center'}}>
        <ActiveForm 
          devEUI={devEUI}
          refreshList={refreshList}
          handleWizardClose={handleWizardClose}
          setStepStatus={setStepStatus}
        />
      </div>
    ) }
  ];

  const onStepsChange = (value: number) => {
    if (stepStatus === 'error') {
      setStepStatus('process');
    }
    setCurrentStep(value);
  };
  
  return (
    <Modal
      title={'Add new Lorawan device'}
      visible={isWizardModalVisible}
      width={'50vw'}
      onCancel={handleWizardClose}
      footer={null}
      destroyOnClose={true}
      maskClosable={false} 
      style={{ textAlign: "start" }}
  >
    <div style={{display: 'flex', flexDirection: 'column', rowGap: '2vh', alignItems: 'center'}}>
      <Steps direction="horizontal" current={currentStep} onChange={onStepsChange} style={{width: '45vw'}} status={stepStatus}>
        {data.map((item, index) => (       
          <Step key={index} title={item.name} description={item.text} />
        ))}
      </Steps>
      <div>{data[currentStep].content}</div>
    </div>
  </Modal>
  )
}

