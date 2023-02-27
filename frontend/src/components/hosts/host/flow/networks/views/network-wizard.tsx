import { useEffect, useState } from "react";
import { Modal, Spin, Steps, StepsProps, Image, Card } from "antd";
import { pluginLogo } from "../../../../../../utils/utils";
import { FlowPluginFactory } from "../../plugins/factory";
import { useParams } from "react-router-dom";
import { LoraForm } from "./lora-form";
import { BacnetForm } from "./bacnet-form";
import { ModbusForm } from "./modbus-form";
import { SystemForm } from "./system-form";
import { FlowNetworkFactory } from "../factory";
import { ReleasesFactory } from "../../../../../release/factory";

const { Step } = Steps;

type FlexDirection =
  | "column"
  | "inherit"
  | "-moz-initial"
  | "initial"
  | "revert"
  | "unset"
  | "column-reverse"
  | "row"
  | "row-reverse"
  | undefined;
interface LabelStyleType {
  display: string;
  flexDirection: FlexDirection;
  alignItems: string;
  rowGap: string;
}

interface PluginInstalledType {
  name: string;
  isInstalled: boolean;
}

enum WizardTypes {
  system = "system",
  lora = "lora",
  bacnet = "bacnet",
  modbusSerial = "modbusSerial",
  modbusTcp = "modbusTcp",
}

const systemImage = pluginLogo("system");
const loraImage = pluginLogo("lora");
const bacnetImage = pluginLogo("bacnet");
const modbusImage = pluginLogo("modbus");
const imageBoxStyle = {
  width: 150,
  height: 100,
  backgroundColor: "rgba(68,87,96,255)",
  border: "5px solid gray",
  padding: "10px",
  margin: "4px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};
const labelStyle: LabelStyleType = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  rowGap: "4px",
};

export const NetworkWizard = (props: any) => {
  const { refreshList, isWizardModalVisible, setIsWizardModalVisible } = props;
  const { connUUID = "", hostUUID = "" } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<StepsProps["status"]>("process");
  const [isFetching, setIsFetching] = useState(false);
  const [confirmInstall, setConfirmInstall] = useState(false);
  const [plugins, setPlugins] = useState<any[]>([]);
  const [pluginStatusArray, setPluginStatusArray] = useState<PluginInstalledType[] | undefined>(undefined);
  const [selectedWizard, setSelectedWizard] = useState<WizardTypes | undefined>(undefined);

  const pluginFactory = new FlowPluginFactory();
  const networkFactory = new FlowNetworkFactory();
  const releaseFactory = new ReleasesFactory();
  networkFactory.connectionUUID = pluginFactory.connectionUUID = connUUID;
  networkFactory.hostUUID = pluginFactory.hostUUID = hostUUID;

  useEffect(() => {
    setStepStatus("process");
    setCurrentStep(0);
    setSelectedWizard(undefined);
    fetchPlugins();
  }, [isWizardModalVisible]);

  useEffect(() => {
    if (selectedWizard) {
      setCurrentStep(currentStep + 1);
    }
  }, [selectedWizard]);

  useEffect(() => {
    const names = ["lora", "bacnetmaster", "modbus", "system"];
    if (plugins.length !== 0) {
      let resArray: PluginInstalledType[] = [];
      names.forEach((name: string) => {
        const resObj = plugins.find((item: any) => {
          return item.name === name;
        });
        resArray.push({ name: name, isInstalled: resObj.is_installed });
      });
      setPluginStatusArray(resArray);
    }
  }, [plugins]);

  const fetchPlugins = async () => {
    try {
      setIsFetching(true);
      const { data = [] } = await pluginFactory.GetPluginsDistribution(connUUID, hostUUID);
      setPlugins(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  const installPlugin = async (pluginName: string) => {
    if (pluginName) {
      try {
        setConfirmInstall(true);
        await pluginFactory.InstallPlugin(connUUID, hostUUID, pluginName);
        await releaseFactory.EdgeServiceAction(
          "restart",
          connUUID,
          hostUUID,
          "nubeio-flow-framework.service",
          "flow-framework"
        );
        fetchPlugins();
      } finally {
        setConfirmInstall(false);
      }
    }
  };

  const isPluginInstalled = (name: string) => {
    if (pluginStatusArray && pluginStatusArray.length !== 0) {
      const resObj = pluginStatusArray.find((item: PluginInstalledType) => {
        return item.name === name;
      });
      return resObj?.isInstalled;
    } else {
      return true;
    }
  };

  const onStepsChange = (value: number) => {
    if (stepStatus === "error") {
      setStepStatus("process");
    }
    setCurrentStep(value);
  };

  const handleWizardClose = () => {
    setCurrentStep(0);
    setIsWizardModalVisible(false);
    refreshList();
  };

  const data = [
    {
      id: "1",
      name: "Step 1",
      text: "Network type selection",
      content: (
        <div style={{ width: "55vw" }}>
          <div style={{ display: "flex", flexDirection: "row", gap: "5px", justifyContent: "center" }}>
            <NetworkCard
              setSelectedWizard={setSelectedWizard}
              isFetching={isFetching}
              type={WizardTypes.system}
              name={"System"}
              image={systemImage}
            />
            <NetworkCard
              setSelectedWizard={setSelectedWizard}
              isFetching={isFetching}
              type={WizardTypes.lora}
              name={"LoRa"}
              image={loraImage}
            />
            <NetworkCard
              setSelectedWizard={setSelectedWizard}
              isFetching={isFetching}
              type={WizardTypes.bacnet}
              name={"BACnet"}
              image={bacnetImage}
            />
            <NetworkCard
              setSelectedWizard={setSelectedWizard}
              isFetching={isFetching}
              type={WizardTypes.modbusSerial}
              name={"Modbus Serial"}
              image={modbusImage}
            />
            <NetworkCard
              setSelectedWizard={setSelectedWizard}
              isFetching={isFetching}
              type={WizardTypes.modbusTcp}
              name={"Modbus TCP"}
              image={modbusImage}
            />
          </div>
        </div>
      ),
    },
    {
      id: "2",
      name: "Step 2",
      text: "Configure new network",
      content: (
        <div style={{ width: "40vw" }}>
          {selectedWizard === WizardTypes.lora ? (
            <LoraForm
              connUUID={connUUID}
              hostUUID={hostUUID}
              refreshList={refreshList}
              factory={networkFactory}
              pluginFactory={pluginFactory}
              isPluginInstalled={isPluginInstalled}
              installPlugin={installPlugin}
              confirmInstall={confirmInstall}
              handleWizardClose={handleWizardClose}
            />
          ) : selectedWizard === WizardTypes.bacnet ? (
            <BacnetForm
              connUUID={connUUID}
              hostUUID={hostUUID}
              refreshList={refreshList}
              factory={networkFactory}
              pluginFactory={pluginFactory}
              isPluginInstalled={isPluginInstalled}
              installPlugin={installPlugin}
              confirmInstall={confirmInstall}
              handleWizardClose={handleWizardClose}
            />
          ) : selectedWizard === WizardTypes.modbusSerial ? (
            <ModbusForm
              type={WizardTypes.modbusSerial}
              connUUID={connUUID}
              hostUUID={hostUUID}
              refreshList={refreshList}
              factory={networkFactory}
              pluginFactory={pluginFactory}
              isPluginInstalled={isPluginInstalled}
              installPlugin={installPlugin}
              confirmInstall={confirmInstall}
              handleWizardClose={handleWizardClose}
            />
          ) : selectedWizard === WizardTypes.modbusTcp ? (
            <ModbusForm
              type={WizardTypes.modbusTcp}
              connUUID={connUUID}
              hostUUID={hostUUID}
              refreshList={refreshList}
              factory={networkFactory}
              pluginFactory={pluginFactory}
              isPluginInstalled={isPluginInstalled}
              installPlugin={installPlugin}
              confirmInstall={confirmInstall}
              handleWizardClose={handleWizardClose}
            />
          ) : selectedWizard === WizardTypes.system ? (
            <SystemForm
              refreshList={refreshList}
              factory={networkFactory}
              pluginFactory={pluginFactory}
              isPluginInstalled={isPluginInstalled}
              installPlugin={installPlugin}
              confirmInstall={confirmInstall}
              handleWizardClose={handleWizardClose}
            />
          ) : (
            <span>Does not exist.</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={"Create Connection"}
      visible={isWizardModalVisible}
      width={"60vw"}
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
          style={{ width: "55vw" }}
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

const NetworkCard = (props: any) => {
  const { setSelectedWizard, isFetching, type, name, image } = props;
  return (
    <Card
      hoverable={true}
      onClick={() => {
        setSelectedWizard(type);
      }}
    >
      {isFetching ? (
        <Spin
          style={{
            width: "100px",
            height: "100px",
          }}
        />
      ) : (
        <div style={labelStyle}>
          <div style={imageBoxStyle}>
            <Image width={100} preview={false} src={image} />
          </div>
          <strong>{name}</strong>
        </div>
      )}
    </Card>
  );
};
