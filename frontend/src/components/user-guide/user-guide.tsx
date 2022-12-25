import { Card, Input, Typography } from "antd";
import { ChangeEvent, useEffect, useState } from "react";
import { JsonTable } from "react-json-to-html";
import { useParams } from "react-router-dom";
import { RbSearchInput } from "../../common/rb-search-input";
import { FlowFactory } from "../rubix-flow/factory";
import "./user-guide.css";

const { Title } = Typography;

const NodeHelpTable = (props: any) => {
  const { item } = props;
  const data = JSON.parse(JSON.stringify(item)); //cloneDeep
  delete data.name;
  if (data.settings) {
    //fix duplicate key 'help'
    Object.keys(data.settings.schema.properties).forEach((key) => {
      data.settings.schema.properties[key][`${key}_help`] = data.settings.schema.properties[key].help || "";
      delete data.settings.schema.properties[key].help;
    });
  }

  return (
    <div id={`table__${item.name}`} className="help-list_item__table">
      <JsonTable json={data} />
    </div>
  );
};

export const UserGuide = () => {
  const { connUUID = "", hostUUID = "" } = useParams();
  const isRemote = connUUID && hostUUID ? true : false;
  const [nodeHelps, setNodeHelps] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);

  const factory = new FlowFactory();

  const config = {
    originData: nodeHelps,
    setFilteredData: setFilteredData,
  };

  const fetchNodeHelp = async () => {
    const res = (await factory.NodesHelp(connUUID, hostUUID, isRemote)) || [];
    setNodeHelps(res);
    setFilteredData(res);
  };

  useEffect(() => {
    fetchNodeHelp();
  }, []);

  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        User Guide
      </Title>
      <Card bordered={false} className="help-list">
        {nodeHelps.length > 0 && <RbSearchInput config={config} size="large" />}

        {filteredData &&
          filteredData.map((item: any, i: number) => (
            <div key={i} className="help-list_item">
              <div className="help-list_item__title">{item.name}</div>
              <NodeHelpTable item={item} />
            </div>
          ))}
      </Card>
    </>
  );
};

export default UserGuide;
