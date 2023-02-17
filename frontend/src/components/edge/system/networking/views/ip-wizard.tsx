import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Modal, Spin, Steps, Button, StepsProps, Select, Form, Input } from "antd";
import { openNotificationWithIcon } from "../../../../../utils/utils";
import { HostNetworkingFactory } from "../factory";
import { backend } from "../../../../../../wailsjs/go/models";
import RcNetworkBody = backend.RcNetworkBody;
const { Step } = Steps;

export const IpWizard = (props: any) => {
  const { refreshList, isModalVisible, onCloseModal } = props;
  const { connUUID = "", hostUUID = "" } = useParams();
//   const [newConnection, setNewConnection] = useState({} as RubixConnection)
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<StepsProps['status']>('process');
  // const [errorAtPing, setErrorAtPing] = useState(false);
  

  const [select, setSelect] = useState<string | undefined>(undefined);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();

  const factory = new HostNetworkingFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  const handleSelectChange = (value: string) => {
    setSelect(value);
  }

  const handleStepOneNext = () => {
    if (select) {
      setCurrentStep(currentStep + 1);
    } else {
      setStepStatus('error');
      openNotificationWithIcon('warning', 'please select an IP type.')
    }
  }

  const handleStepTwoNext = () => {
    if (select === 'static') {
      form.submit();
    } else {
      setCurrentStep(currentStep + 1);
    }
  }

  // const handleConvertBody = (item: any) => {
  //   let body = {};
  //   Object.keys(item).forEach((key) => {
  //     const newKey = prefix + key;
  //     body = { ...body, [newKey]: item[key] };
  //   });
  //   return body;
  // };

  const handleSubmit = async (formValues: any) => {
    try {
      setConfirmLoading(true);
      // const payload = handleConvertBody(item) as RcNetworkBody;
      const payload = {} as RcNetworkBody;
      await factory.RcSetNetworks(payload);
      refreshList();
    } catch (error) {
      console.log(error);
    } finally {
      setConfirmLoading(false);
    }
  }


  
  const data = [
    { id: "1", name: "Step 1", text: 'Select network type', content: (
      <div style={{width: '35vw'}}>
        <div style={{display: 'flex', flexDirection: 'row', gap: '10px'}}>
          <strong>Select type: </strong>
          <Select
            style={{ width: 120 }}
            onChange={handleSelectChange}
            options={[
                { value: 'static', label: 'static' },
                { value: 'DHCP', label: 'DHCP' }
            ]}
          />

        </div>
        <Button type='primary' onClick={handleStepOneNext} style={{width: '120px'}}>Next</Button>
      </div>
    ) },
    { id: "2", name: "Step 2", text: 'Ping connection', content: (
      <div style={{display: 'flex', flexDirection: 'column', rowGap: '20px', alignItems:'center'}}>
        {select === 'static' && (
          <Form labelAlign="left" form={form} onFinish={handleSubmit}>
            <Form.Item
              label="IP address:"
              name="ip"
              rules={[{ required: true, message: "Please input an IP address!" }]}
            >
              <Input />
            </Form.Item>
    
            <Form.Item 
              label="Netmask:" 
              name="netmask" 
              rules={[{ required: true, message: "Please input a netmask!" }]}
            >
              <Input />
            </Form.Item>
    
            <Form.Item
              label="Gateway:"
              name="gateway"
              rules={[{ required: true, message: "Please input a gateway!" }]}
            >
              <Input />
            </Form.Item>
          </Form>
        )}
        <Button type='primary' onClick={handleStepTwoNext} style={{width: '120px'}}>Next</Button>
      </div>
    ) },
    { id: "3", name: "Step 3", text: 'Configure tokens', content: (
      <div style={{width: '35vw', display: 'flex', flexDirection: 'column', rowGap: '2vh', alignItems: 'center'}}>
        {/* {newConnection.external_token === '' ? (
          <TokenForm 
            factory={tokenFactory}
            selectedItem={newConnection}
            hostOrConn={'conn'}
          />
        ) : (
          <strong>Token already included!</strong>
        )} */}
        <strong>Step three</strong>
        <Button type='primary' onClick={() => handleWizardClose()} style={{width: '120px'}}>Finish</Button>
      </div>
    ) }
  ];

  const onStepsChange = (value: number) => {
    if (stepStatus === 'error') {
      setStepStatus('process');
      // setErrorAtPing(false);
    }
    setCurrentStep(value);
  };

  const handleWizardClose = () => {
    // setNewConnection({} as RubixConnection);
    setCurrentStep(0);
    onCloseModal();
    refreshList();
  }
  
  return (
    <Modal
      title={'Create Connection'}
      visible={isModalVisible}
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

