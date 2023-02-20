import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Modal, Spin, Steps, Button, StepsProps, Select, Form, Input } from "antd";
import { openNotificationWithIcon } from "../../../../../utils/utils";
import { HostNetworkingFactory } from "../factory";
import { backend } from "../../../../../../wailsjs/go/models";
import { HostSystemFactory } from "../../../../edge/system/factory-system";
import RcNetworkBody = backend.RcNetworkBody;
const { Step } = Steps;

interface FormDataType {
  ip: string;
  gateway: string;
  netmask: string;
}

const formItemLayout = { labelCol: { span: 10 }, wrapperCol: { span: 15 } };

export const IpWizard = (props: any) => {
  const { currentItem, prefix, refreshList, isModalVisible, onCloseModal } = props;
  const { connUUID = "", hostUUID = "" } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<StepsProps['status']>('process');
  const [select, setSelect] = useState<string | undefined>(undefined);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [selectedData, setSelectedData] = useState({} as RcNetworkBody);
  const [initData, setInitData] = useState({} as FormDataType);
  const [isRebooting, setIsRebooting] = useState(false);
  const [form] = Form.useForm();

  const hostSystemFactory = new HostSystemFactory();
  const factory = new HostNetworkingFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  useEffect(() => {
    setSelectedData(currentItem);
    setInitData({ip: currentItem.ip, gateway: currentItem.gateway, netmask: currentItem.netmask})
  }, [currentItem]);

  useEffect(() => {
    setStepStatus('process');
  }, [isModalVisible])

  useEffect(() => {
    form.setFieldsValue({
      ip: initData.ip,
      netmask: initData.netmask,
      gateway: initData.gateway
    })
  }, [initData])

  const handleSelectChange = (value: string) => {
    setSelect(value);
  }

  const handleStepOneNext = () => {
    if (select) {
      setStepStatus('process');
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
      handleSubmit(undefined)
    }
  }

  const handleSubmit = async (formValues: FormDataType | undefined) => {
    let combinedPayload = {};
    if (formValues) {
      combinedPayload = {
        ...selectedData, 
        ip_settings: select, 
        ip_settings_state: '', 
        ip: formValues.ip,
        netmask: formValues.netmask,
        gateway: formValues.gateway
      }
    } else {
      combinedPayload = {
        ...selectedData, 
        ip_settings: select, 
        ip_settings_state: '', 
        ip: '',
        netmask: '',
        gateway: ''
      }
    }
    try {
      setConfirmLoading(true);
      const payload = handleConvertBody(combinedPayload) as RcNetworkBody;
      await factory.RcSetNetworks(payload);
      setCurrentStep(currentStep + 1);
      refreshList();
    } catch (error) {
      console.log(error);
    } finally {
      setConfirmLoading(false);
    }
  }

  const handleConvertBody = (item: any) => {
    let body = {};
    Object.keys(item).forEach((key) => {
      const newKey = prefix + key;
      body = { ...body, [newKey]: item[key] };
    });
    return body;
  };

  const rebootHost = async () => {
    try {
      setIsRebooting(true);
      await hostSystemFactory.EdgeHostReboot(connUUID, hostUUID);
    } finally {
      setIsRebooting(false);
    }
  };

  const handleStepThree = async () => {
    rebootHost();
    handleWizardClose();
  }

  const onStepsChange = (value: number) => {
    if (stepStatus === 'error') {
      setStepStatus('process');
    }

    if (!select) {
      setStepStatus('error');
      openNotificationWithIcon('warning', 'please select an IP type.')
    } else {
      setCurrentStep(value);
    }
  };

  const handleWizardClose = () => {
    setSelectedData({} as RcNetworkBody);
    setInitData({} as FormDataType);
    setSelect(undefined);
    setCurrentStep(0);
    onCloseModal();
    refreshList();
  }

  const data = [
    { id: "1", name: "Step 1", text: 'Select network type', content: (
      <div style={{display: 'flex', flexDirection: 'column', rowGap: '20px', alignItems: 'center', width: '35vw'}}>
        <div style={{display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center',}}>
          <strong>Select type: </strong>
          <Select
            style={{ width: 240 }}
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
    { id: "2", name: "Step 2", text: 'IP settings', content: (
      <div style={{display: 'flex', flexDirection: 'column', rowGap: '20px', alignItems:'center'}}>
        {select === 'static' && (
          <Form {...formItemLayout} form={form} onFinish={handleSubmit}>
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
        <Button type='primary' onClick={handleStepTwoNext} loading={confirmLoading} style={{width: '120px'}}>Next</Button>
      </div>
    ) },
    { id: "3", name: "Step 3", text: 'Reboot device', content: (
      <div style={{width: '35vw', display: 'flex', flexDirection: 'column', rowGap: '2vh', alignItems: 'center'}}>
        <strong style={{color: 'orange'}}>Warning: This will reboot the device!</strong>
        <div style={{display: 'flex', flexDirection: 'row', gap: '10px'}}>
          <Button type='primary' loading={isRebooting} onClick={handleStepThree} style={{width: '120px'}}>Reboot</Button>
          <Button type='dashed' loading={isRebooting} onClick={handleWizardClose} style={{width: '120px'}}>Skip</Button>
        </div>
      </div>
    ) }
  ];
  
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

