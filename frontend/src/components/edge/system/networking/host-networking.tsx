import { Space, Tooltip } from "antd";
import { FormOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ScannerTable } from "../../../pc/networking/scanner-table";
import { HostNetworkingFactory } from "./factory";
import { EditModal } from "./views/edit";

export const HostNetworking = () => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const [data, setData] = useState([] as Array<any>);
  const [currentItem, setCurrentItem] = useState({});
  const [rcSchema, setRCSchema] = useState({} as any);
  const [schema, setSchema] = useState({} as any);
  const [prefix, setPrefix] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const factory = new HostNetworkingFactory();
  factory.connectionUUID = connUUID;
  factory.hostUUID = hostUUID;

  const extraColumns = [
    {
      title: "actions",
      key: "actions",
      fixed: "left",
      render: (_: any, item: any) => (
        <Space size="middle">
          {item.editable ? (
            <Tooltip title="Edit">
              <a onClick={() => showModal(item)}>
                <FormOutlined />
              </a>
            </Tooltip>
          ) : null}
        </Space>
      ),
    },
  ] as never[];

  useEffect(() => {
    fetchRCSchema();
  }, []);

  useEffect(() => {
    fetch();
  }, [Object.keys(rcSchema).length]);

  const fetch = async () => {
    try {
      setIsFetching(true);
      let networks = (await factory.GetNetworks()) || [];
      networks = networks.map((network: any, index: number) => {
        return {
          ...network,
          editable: Object.keys(rcSchema).includes(network.interface),
          id: index,
        };
      });
      setData(networks);
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchRCSchema = async () => {
    try {
      const rcSchema = (await factory.GetRcNetworkSchema()) || {};
      setRCSchema(rcSchema);
    } catch (error) {
      console.log(error);
    }
  };

  const showModal = (net: any) => {
    handleConvertSchema(net);
    setCurrentItem(net);
    setIsModalVisible(true);
  };

  const handleConvertSchema = (net: any) => {
    let schema = {};
    const prefix = Object.keys(rcSchema[net.interface])[0].split("_")[0] + "_";
    Object.keys(rcSchema[net.interface]).forEach((key) => {
      const newKey = key.replace(prefix, "");
      schema = { ...schema, [newKey]: rcSchema[net.interface][key] };
    });
    schema = {
      properties: schema,
    };
    setSchema(schema);
    setPrefix(prefix);
  };

  return (
    <>
      <ScannerTable rowKey="id" data={data} isFetching={isFetching} extraColumns={extraColumns} />

      <EditModal
        currentItem={currentItem}
        isModalVisible={isModalVisible}
        schema={schema}
        prefix={prefix}
        onCloseModal={() => setIsModalVisible(false)}
        refreshList={fetch}
      />
    </>
  );
};
