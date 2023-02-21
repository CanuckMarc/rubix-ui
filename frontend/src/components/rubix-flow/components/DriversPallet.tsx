import { Layout, Tooltip, Collapse, Switch } from "antd";
import { CaretRightOutlined, CaretDownOutlined } from "@ant-design/icons";
import { ChangeEvent, useEffect, useState } from "react";

import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { NodeTreeItem } from "./NodeTreeItem";
import { NodeSpecJSON } from '../lib';
import { FlowSettings } from "./FlowSettingsModal";

import { FlowPointFactory } from '../../../components/hosts/host/flow/points/factory';
import { backend, model, rumodel, storage, } from "../../../../wailsjs/go/models";
import { PointTableType } from "../../../App";
import { useParams } from "react-router-dom";
const pointFactory = new FlowPointFactory();

const { Sider } = Layout;
const { Panel } = Collapse;

interface PluginTableDataType {
  uuid: string;
  name: string;
  plugin_name: string;
  network_name: string;
  device_name: string;
  point_name: string;
  isRead: boolean;
}

type NodeProps = {
  nodes: NodeInterface[];
  gotoNode: (node: NodeInterface) => void;
  nodesSpec: boolean | NodeSpecJSON[] | React.Dispatch<React.SetStateAction<NodeSpecJSON[]>>;
  selectedSubFlowId?: string;
  openNodeMenu: (position: { x: number; y: number }, node: NodeInterface) => void;
  flowSettings: FlowSettings;
};

export const DriversPallet = ({ nodes, flowSettings}: NodeProps) => {
  const [panelKeys, setPanelKeys] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isExpandedAll, setIsExpandedAll] = useState(false);
  
  
  let { connUUID = "", hostUUID = "" } = useParams();
  const [allPoints, setAllPoints] = useState<PluginTableDataType[] | undefined>(undefined);
  const [displayObj, setDisplayObj] = useState<any>(undefined)

  const [isFetchingPoints, setIsFetchingPoints] = useState(false);

  useEffect(() => {
    pointFactory.connectionUUID = connUUID;
    pointFactory.hostUUID = hostUUID;
    fetchFlowPoints();
  }, [connUUID, hostUUID]);

  const fetchFlowPoints = async() => {
    try {
      setIsFetchingPoints(true)
      const res = await pointFactory.GetPointListPayload(connUUID, hostUUID)
      if (res) {
        console.log("all points are: ", res)
        setAllPoints(res.map((item: backend.PointListPayload) => {
          return {...item, isRead: false}
        }));
      }
    } catch (err) {
      console.log("error on fetching: ", err)
    } finally {
      setIsFetchingPoints(false)
    }
  }

  useEffect(() => {    
    if (allPoints) {
      let localDisplayObj = {} as any;
      let usedNames: string[] = [];
      allPoints.forEach((point: backend.PointListPayload) => {
        if (usedNames.includes(point.plugin_name)) {
          localDisplayObj[`${point.plugin_name}`].push(point);
        } else {
          usedNames.push(point.plugin_name);
          localDisplayObj[`${point.plugin_name}`] = [point];
        }
      })
      setDisplayObj(localDisplayObj)
      console.log('localDisplayObj is: ', localDisplayObj)
    }
  }, [allPoints])

  const onDragStart = (event: any, name: any, isRead: boolean) => {
    // const data = { isParent, nodeType };
    // event.dataTransfer.setData("from-node-sidebar", JSON.stringify(data));
    // event.dataTransfer.effectAllowed = "move";
  };


  const onChangeSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const onChangeOpenPanels = (isExpanded: boolean) => () => {
    const ids = nodes.filter((n) => (isExpanded ? n.isParent : false)).map((n) => n.id);

    setIsExpandedAll(isExpanded);
    setPanelKeys(ids);
  };

  const onSwitchChange = (checked: boolean, itemUUID: string) => {
    const mappedAllPoints = allPoints?.map((point: PluginTableDataType) => {
      if (point.uuid === itemUUID) {
        return {...point, isRead: checked}
      } else {
        return point
      }
    })
    setAllPoints(mappedAllPoints)
  }

  return (
    <div>
      <Sider className="rubix-flow__node-sidebar node-picker z-10 text-white border-l border-gray-600">
        <div className="p-2">
          Drivers {flowSettings.showCount ? `(${nodes.length})` : ""}
          <Tooltip title={isExpandedAll ? "collapse all" : "expand all"}>
            {isExpandedAll ? (
              <CaretDownOutlined className="title-icon" onClick={onChangeOpenPanels(false)} />
            ) : (
              <CaretRightOutlined className="title-icon" onClick={onChangeOpenPanels(true)} />
            )}
          </Tooltip>
        </div>
        <div className="p-2">
          <input
            type="text"
            autoFocus
            placeholder="Type to filter"
            className="bg-gray-600 disabled:bg-gray-700 w-full py-1 px-2"
            value={search}
            onChange={onChangeSearch}
          />
        </div>
        <div className="overflow-y-scroll" style={{ height: "calc(100vh - 110px)" }}>
          <Collapse
            defaultActiveKey={['1']}
            expandIconPosition="right"
            // onChange={onChangeOpenPanels}
            className="ant-menu ant-menu-root ant-menu-inline ant-menu-dark border-0"
          >
            {displayObj && Object.keys(displayObj).map((pluginName: string) => (
              <Panel header={pluginName} key={pluginName} className="panel-no-padding border-gray-600">
                <div className="bg-gray-800">
                  {displayObj[`${pluginName}`].map((item: PluginTableDataType, index: number) => (
                    <div
                    key={`${item.name}`}
                    className={`py-2 cursor-po inter text-white flex flex-row justify-between
                      border-gray-600 text-left ant-menu-item ${index === 0 ? "" : "border-t"}`}
                    draggable={true}
                    onDragStart={(event) => onDragStart(event, item.name, item.isRead)}
                    style={{ paddingLeft: 24 }}
                  >
                    <div>
                      {item.device_name && item.point_name && (
                        <span className="pr-3" style={{ fontSize: 12 }}>
                          {`${item.device_name}-${item.point_name}`}
                        </span>
                      )}
                    </div>
                    <div>
                      <Switch checked={item.isRead} onChange={(checked) => onSwitchChange(checked, item.uuid)} />
                    </div>
                  </div>
                  ))}
                </div>
              </Panel>
            ))}
          </Collapse>
        </div>
      </Sider>
    </div>
  );
};
