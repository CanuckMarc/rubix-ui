import { Tabs, Typography, Card, Button, Modal, Space, Select, Form, Input } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import { useState, useEffect, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import {assistcli, model} from "../../../../../../wailsjs/go/models";
import { RbRefreshButton } from "../../../../../common/rb-table-actions";
import { BACNET_HEADERS } from "../../../../../constants/headers";
import { PLUGINS } from "../../../../../constants/plugins";
import { ROUTES } from "../../../../../constants/routes";
import { openNotificationWithIcon } from "../../../../../utils/utils";
import RbxBreadcrumb from "../../../../breadcrumbs/breadcrumbs";
import { BacnetWhoIsTable } from "../bacnet/table";
import { BacnetFactory } from "../bacnet/factory";
import { FlowNetworkFactory } from "../networks/factory";
import { FlowDeviceFactory } from "./factory";
import { FlowDeviceTable } from "./views/table";
import useTitlePrefix from "../../../../../hooks/usePrefixedTitle";
import { setDataLocalStorage } from "../flow-service";
import Device = model.Device;
import { HostNetworkingFactory } from "../../../../edge/system/networking/factory";

const { TabPane } = Tabs;
const { Title } = Typography;

const devices = "DEVICES";
const bacnet = "BACNET";

export const FlowDevices = () => {
  const { connUUID = "", hostUUID = "", networkUUID = "", locUUID = "", netUUID = "", pluginName = "" } = useParams();
  const [pluginUUID, setPluginUUID] = useState<any>();
  const [data, setData] = useState([] as Device[]);
  const [whoIs, setWhoIs] = useState([] as Device[]);
  const [isFetching, setIsFetching] = useState(false);
  const [isFetchingWhoIs, setIsFetchingWhoIs] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectOptions, setSelectOptions] = useState<String[]>([]);
  const [selected, setSelected] = useState("");
  const [broadcast, setBroadcast] = useState(false);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(0);
  const [netNum, setNetNum] = useState(0);
  const { prefixedTitle, addPrefix } = useTitlePrefix("Flow Devices");

  const bacnetFactory = new BacnetFactory();
  const flowDeviceFactory = new FlowDeviceFactory();
  const flowNetworkFactory = new FlowNetworkFactory();
  const hostNetworkingFactory = new HostNetworkingFactory();
  flowDeviceFactory.connectionUUID = bacnetFactory.connectionUUID = flowNetworkFactory.connectionUUID = hostNetworkingFactory.connectionUUID = connUUID;
  flowDeviceFactory.hostUUID = bacnetFactory.hostUUID = flowNetworkFactory.hostUUID = hostNetworkingFactory.hostUUID = hostUUID;


  const routes = [
    {
      path: ROUTES.CONNECTIONS,
      breadcrumbName: "Supervisors",
    },
    {
      path: ROUTES.LOCATIONS.replace(":connUUID", connUUID || ""),
      breadcrumbName: "Location",
    },
    {
      path: ROUTES.LOCATION_NETWORKS.replace(":connUUID", connUUID || "").replace(":locUUID", locUUID || ""),
      breadcrumbName: "Group",
    },
    {
      path: ROUTES.LOCATION_NETWORK_HOSTS.replace(":connUUID", connUUID || "")
        .replace(":locUUID", locUUID || "")
        .replace(":netUUID", netUUID),
      breadcrumbName: "Controllers",
    },
    {
      path: ROUTES.HOST.replace(":connUUID", connUUID || "")
        .replace(":locUUID", locUUID || "")
        .replace(":netUUID", netUUID || "")
        .replace(":hostUUID", hostUUID || ""),
      breadcrumbName: "Controller",
    },
    {
      path: ROUTES.DEVICES.replace(":connUUID", connUUID || "")
        .replace(":locUUID", locUUID || "")
        .replace(":netUUID", netUUID || "")
        .replace(":hostUUID", hostUUID || "")
        .replace(":pluginName", pluginName || "")
        .replace(":networkUUID", networkUUID || ""),
      breadcrumbName: "Devices",
    },
  ];

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    try {
      setIsFetching(true);
      const res = await flowNetworkFactory.GetOne(networkUUID, true);
      const devices = (res.devices || []) as Device[];
      setData(devices);
      setPluginUUID(res.plugin_conf_id);
      addPrefix(res.name);
      setDataLocalStorage(devices); //handle mass edit
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  const runWhois = async () => {
    setIsModalOpen(true)
    try {
      const res = await hostNetworkingFactory.GetNetworks()
      
      const mappedList: String[] = res.map((item: any) => {
        return {
          value: item.interface,
          label: item.interface
        }
      })
      setSelectOptions(mappedList)
    } catch (err) {
      console.log(err);
      openNotificationWithIcon("error", `discovery error: ${err}`);
    }
  };

  const handleModalOk = async() => {
    let opts = new assistcli.WhoIsOpts
    opts.interface_port = selected
    opts.low = low
    opts.high = high
    opts.global_broadcast = broadcast
    opts.network_number = netNum

    setIsModalOpen(false)
    try {
      setIsFetchingWhoIs(true)
      const res = await bacnetFactory.BacnetMasterWhois(networkUUID, opts);
      if (res) {
        openNotificationWithIcon("success", `device count found: ${res.length}`);
      }
      setWhoIs(res);
    } catch (err) {
      console.log(err);
      openNotificationWithIcon("error", `discovery error: ${err}`);
    } finally {
      setIsFetchingWhoIs(false);
    }
  }

  const handleModalCancel = () => {
    setIsModalOpen(false)
  }

  const handleSelectChange = (value: string) => {
    setSelected(value)
  }

  const handleBroadcastSelectChange = (value: boolean) => {
    setBroadcast(value)
  }

  const addDevices = async (selectedUUIDs: Array<Device>) => {
    await flowDeviceFactory.AddBulk(selectedUUIDs);
    fetch();
  };

  const handleLowChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLow(parseInt(event.target.value))
  }

  const handleHighChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHigh(parseInt(event.target.value))
  }

  const handleNetNumChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNetNum(parseInt(event.target.value))
  }

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        {prefixedTitle}
      </Title>
      <Card bordered={false}>
        <RbxBreadcrumb routes={routes} />
        <Tabs defaultActiveKey={devices}>
          <TabPane tab={devices} key={devices}>
            <RbRefreshButton refreshList={fetch} />
            <FlowDeviceTable data={data} pluginUUID={pluginUUID} isFetching={isFetching} refreshList={fetch} />
          </TabPane>
          {pluginName === PLUGINS.bacnetmaster ? (
            <TabPane tab={bacnet} key={bacnet}>
              <Button type="primary" onClick={runWhois} style={{ margin: "0 6px 10px 0", float: "left" }}>
                <RedoOutlined /> WHO-IS
              </Button>
              <BacnetWhoIsTable
                refreshDeviceList={fetch}
                data={whoIs}
                isFetching={isFetchingWhoIs}
                handleAdd={addDevices}
                addBtnText="Create Devices"
                headers={BACNET_HEADERS}
              />
            </TabPane>
          ) : null}
        </Tabs>
      </Card>

      <Modal title="Select net interface" visible={isModalOpen} onOk={handleModalOk} onCancel={handleModalCancel}>
        <Form
          name="basic"
          labelCol={{
            span: 10
          }}
          wrapperCol={{
              span: 18
          }}
          autoComplete="off"
        >
          <Form.Item
            label="Interface ports:"
            name="interfacePorts"
            rules={[{ required: true, message: 'Please select an interface port!' }]}
          >
            <Select
              onChange={handleSelectChange}
              options={selectOptions}
            />
          </Form.Item>

          <Form.Item
            label="Low:"
            name="low"
            rules={[{ required: true, message: 'Please input a low value!' }]}
          >
            <Input value={low} onChange={handleLowChange} />
          </Form.Item>

          <Form.Item
            label="High:"
            name="high"
            rules={[{ required: true, message: 'Please input a high value!' }]}
          >
            <Input value={high} onChange={handleHighChange}/>
          </Form.Item>

          <Form.Item
            label="Network number:"
            name="networkNumber"
            rules={[{ required: true, message: 'Please input network number!' }]}
          >
            <Input value={netNum} onChange={handleNetNumChange}/>
          </Form.Item>

          <Form.Item
            label="Global broadcast:"
            name="globalBroadcast"
            rules={[{ required: true, message: 'Please select broadcase option!' }]}
          >
            <Select
              onChange={handleBroadcastSelectChange}
              options={[
                {
                  value: true,
                  label: 'True'
                },
                {
                  value: false,
                  label: 'False'
                },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
