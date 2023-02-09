import { useEffect, useState } from "react";
import { Modal, Spin, Steps, Button, StepsProps } from "antd";
import { CreateHostForm } from "./create-form";
import { TokenForm } from "../../../components/connections/views/token-form";
import { openNotificationWithIcon } from "../../../utils/utils";
import { amodel } from "../../../../wailsjs/go/models";
import Host = amodel.Host;
const { Step } = Steps;

export const CreateHostWizard = (props: any) => {
  const { currentHost, hostSchema, isLoadingForm, refreshList, hostsFactory, tokenFactory, isWizardModalVisible, setIsWizardModalVisible } = props;
  const [newHost, setNewHost] = useState({} as Host)
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<StepsProps['status']>('process');
  const [errorAtPing, setErrorAtPing] = useState(false);

  const pingHost = async (newHost: Host) => {
    hostsFactory.uuid = newHost.uuid;
    try {
      const res = await hostsFactory.PingHost();
      if (res) {
        openNotificationWithIcon("success", `successfully pinged the new host ${newHost.name}!`);
        setCurrentStep(currentStep + 1)
      } else {
        openNotificationWithIcon("error", `failed to ping new host ${newHost.name}!`);
        setStepStatus('error');
        setErrorAtPing(true);
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  const data = [
    { id: "1", name: "Step 1", text: 'Create new host', content: (
      <div style={{width: '35vw'}}>
        <CreateHostForm 
          currentHost={newHost}
          hostSchema={hostSchema} 
          isLoadingForm={isLoadingForm} 
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          refreshList={refreshList}
          setNewHost={setNewHost}
        />
      </div>
    ) },
    { id: "2", name: "Step 2", text: 'Ping new host', content: (
      <div style={{display: 'flex', flexDirection: 'column', rowGap: '20px', alignItems:'center'}}>
        <Button type='primary' onClick={() => pingHost(newHost)} style={{width: '160px'}}>Ping new host</Button>
        {errorAtPing && (<strong style={{color: 'red'}}>Error pinging newly created host, go back to step one.</strong>)}
      </div>
    ) },
    { id: "3", name: "Step 3", text: 'Configure tokens', content: (
      <div style={{width: '35vw', display: 'flex', flexDirection: 'column', rowGap: '2vh', alignItems: 'center'}}>
        {newHost.external_token === '' ? (
            <TokenForm 
              factory={tokenFactory}
              selectedItem={newHost}
              hostOrConn={'host'}
            />
        ) : (
          <strong>Token already included!</strong>
        )}
        <Button type='primary' onClick={() => handleWizardClose()} style={{width: '120px'}}>Finish</Button>
      </div>
    ) }
  ];

  const onStepsChange = (value: number) => {
    if (stepStatus === 'error') {
      setStepStatus('process');
      setErrorAtPing(false);
    }
    setCurrentStep(value);
  };

  const handleWizardClose = () => {
    setNewHost({} as Host)
    setCurrentStep(0)
    setIsWizardModalVisible(false)
  }
  
  return (
    <Modal
      title={'Create Host'}
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

