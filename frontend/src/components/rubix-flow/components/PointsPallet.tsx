import { Layout, Tooltip, Collapse, Switch } from "antd";
import { CaretRightOutlined, CaretDownOutlined } from "@ant-design/icons";
import { ChangeEvent, useEffect, useState } from "react";

import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { NodeTreeItem } from "./NodeTreeItem";
import { NodeSpecJSON } from '../lib';
import { FlowSettings } from "./FlowSettingsModal";

import { FlowPointFactory } from '../../hosts/host/flow/points/factory';
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
  isWrite: boolean;
}

type NodeProps = {
  nodes: NodeInterface[];
  gotoNode: (node: NodeInterface) => void;
  nodesSpec: boolean | NodeSpecJSON[] | React.Dispatch<React.SetStateAction<NodeSpecJSON[]>>;
  selectedSubFlowId?: string;
  openNodeMenu: (position: { x: number; y: number }, node: NodeInterface) => void;
  flowSettings: FlowSettings;
};

export const PointsPallet = ({ nodes, flowSettings}: NodeProps) => {
  const [panelKeys, setPanelKeys] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isExpandedAll, setIsExpandedAll] = useState(false);
  
  
  let { connUUID = "", hostUUID = "" } = useParams();
  const [allPoints, setAllPoints] = useState<PluginTableDataType[] | undefined>(undefined);
  const [allPointsBeforeSearch, setAllPointsBeforeSearch] = useState<PluginTableDataType[] | undefined>(undefined);
  const [displayObj, setDisplayObj] = useState<any>({});
  const [activeKeyPanel, setActiveKeyPanel] = useState<string[]>([]);
  const [isFetchingPoints, setIsFetchingPoints] = useState(false);

  useEffect(() => {
    pointFactory.connectionUUID = connUUID;
    pointFactory.hostUUID = hostUUID;
    fetchFlowPoints();
  }, [connUUID, hostUUID]);

  useEffect(() => {
    fetchFlowPoints();
  }, [])

  const fetchFlowPoints = async() => {
    try {
      setIsFetchingPoints(true)
      const res = await pointFactory.GetPointListPayload(connUUID, hostUUID)
      if (res) {
        const mappedRes = res.map((item: backend.PointListPayload) => {
          return {...item, isWrite: false}
        });
        setAllPoints(mappedRes)
        setAllPointsBeforeSearch(mappedRes)
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
      // console.log('localDisplayObj is: ', localDisplayObj)
    }
  }, [allPoints])

  useEffect(() => {
    if (search === "") {
      setAllPoints(allPointsBeforeSearch)
    } else {
      const key = search.toLowerCase().trim();
      const searchRes = allPoints?.filter((item: PluginTableDataType) => {
        return item.name.includes(key) ? true : false;
      })
      setAllPoints(searchRes);
    }
  }, [search])

  const onDragStart = (event: any, namePallet: any, isWrite: boolean) => {
    const nodeTypePallet = isWrite ? 'flow/flow-point-write' : 'flow/flow-point';
    const data = { namePallet, nodeTypePallet };
    event.dataTransfer.setData("from-point-pallet", JSON.stringify(data));
    event.dataTransfer.effectAllowed = "move";
  };


  const onChangeSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const onChangeOpenPanels = (key: string | string[]) => {
    setActiveKeyPanel(typeof key === "string" ? [key] : key);
  };

  const onSwitchChange = (checked: boolean, itemUUID: string) => {
    const mappedAllPoints = allPoints?.map((point: PluginTableDataType) => {
      if (point.uuid === itemUUID) {
        return {...point, isWrite: checked}
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
          Points 
          {activeKeyPanel.length !== Object.keys(displayObj).length ? (
            <Tooltip title={"expand all"}>
                <CaretRightOutlined className="title-icon" onClick={() => onChangeOpenPanels(Object.keys(displayObj))} />
            </Tooltip>
          ) : (
            <Tooltip title={"collapse all"}>
                <CaretDownOutlined className="title-icon" onClick={() => onChangeOpenPanels([])} />
            </Tooltip>
          )}  
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
            activeKey={activeKeyPanel}
            expandIconPosition="right"
            onChange={onChangeOpenPanels}
            className="ant-menu ant-menu-root ant-menu-inline ant-menu-dark border-0"
          >
            {displayObj && Object.keys(displayObj).map((pluginName: string) => (
              <Panel header={pluginName} key={pluginName} className="panel-no-padding border-gray-600">
                <div className="bg-gray-800">
                  {displayObj[`${pluginName}`].map((item: PluginTableDataType, index: number) => (
                    <div
                    key={`${item.name}`}
                    className={`py-2 cursor-po inter text-white flex flex-row justify-between
                      border-gray-600 text-left ${index === 0 ? "" : "border-t"}`}
                    draggable={true}
                    onDragStart={(event) => onDragStart(event, item.name, item.isWrite)}
                    style={{ padding: 14, minHeight: '60px', alignItems: 'center', cursor: 'pointer' }}
                    >
                      <div style={{display: 'flex', flexDirection: 'column'}}>
                        {item.device_name && (
                          <span style={{fontSize: 10}}>
                            {`${item.device_name}`}
                          </span>
                        )}
                        {item.point_name && (
                          <span style={{ fontSize: 14}}>
                            {`${item.point_name}`}
                          </span>
                        )}
                      </div>
                      <div>
                        <Switch 
                          size={'small'} 
                          checkedChildren="Write" 
                          unCheckedChildren="Read"
                          checked={item.isWrite} 
                          onChange={(checked) => onSwitchChange(checked, item.uuid)} 
                        />
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
