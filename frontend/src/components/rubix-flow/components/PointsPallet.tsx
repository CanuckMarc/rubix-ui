import { Layout, Tooltip, Collapse, Switch, Spin } from "antd";
import { CaretRightOutlined, CaretDownOutlined } from "@ant-design/icons";
import { ChangeEvent, useEffect, useState } from "react";

import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { NodeTreeItem } from "./NodeTreeItem";
import { NodeSpecJSON } from "../lib";
import { FlowSettings } from "./FlowSettingsModal";

import { FlowPointFactory } from "../../hosts/host/flow/points/factory";
import { backend, model, rumodel, storage } from "../../../../wailsjs/go/models";
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

interface NodePalletPropType {
  selectedSubflow: NodeInterface<any> | undefined;
  // disablePointsPallet: boolean;
  // setDisablePointsPallet: Function;
  search: string;
}

export const PointsPallet = ({ selectedSubflow, search }: NodePalletPropType) => {
  let { connUUID = "", hostUUID = "" } = useParams();
  const [allPoints, setAllPoints] = useState<PluginTableDataType[] | undefined>(undefined);
  const [allPointsBeforeSearch, setAllPointsBeforeSearch] = useState<PluginTableDataType[] | undefined>(undefined);
  const [displayObj, setDisplayObj] = useState<any>({});
  const [activeKeyPanel, setActiveKeyPanel] = useState<string[]>([]);
  const [isFetchingPoints, setIsFetchingPoints] = useState(false);
  const [disablePointsPallet, setDisablePointsPallet] = useState(false);

  useEffect(() => {
    pointFactory.connectionUUID = connUUID;
    pointFactory.hostUUID = hostUUID;
    fetchFlowPoints();
  }, [connUUID, hostUUID]);

  useEffect(() => {
    fetchFlowPoints();
  }, []);

  useEffect(() => {
    if (!selectedSubflow || selectedSubflow.type !== "flow/flow-network") {
      setDisablePointsPallet(true);
    } else {
      setDisablePointsPallet(false);
    }
  }, [selectedSubflow]);

  const fetchFlowPoints = async () => {
    try {
      setIsFetchingPoints(true);
      const res = await pointFactory.GetPointListPayload(connUUID, hostUUID);
      if (res) {
        const mappedRes = res.map((item: backend.PointListPayload) => {
          return { ...item, isWrite: false };
        });
        setAllPoints(mappedRes);
        setAllPointsBeforeSearch(mappedRes);
      }
    } catch (err) {
      console.log("error on fetching: ", err);
    } finally {
      setIsFetchingPoints(false);
    }
  };

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
      });
      setDisplayObj(localDisplayObj);
    }
  }, [allPoints]);

  useEffect(() => {
    if (search === "") {
      setAllPoints(allPointsBeforeSearch);
    } else {
      const key = search.toLowerCase();
      const searchRes = allPointsBeforeSearch?.filter((item: PluginTableDataType) => {
        return item.name.includes(key) ? true : false;
      });
      setAllPoints(searchRes);
    }
  }, [search]);

  const onDragStart = (event: any, namePallet: any, isWrite: boolean) => {
    const nodeTypePallet = isWrite ? "flow/flow-point-write" : "flow/flow-point";
    const data = { namePallet, nodeTypePallet };
    event.dataTransfer.setData("from-point-pallet", JSON.stringify(data));
    event.dataTransfer.effectAllowed = "move";
  };

  const onChangeOpenPanels = (key: string | string[]) => {
    setActiveKeyPanel(typeof key === "string" ? [key] : key);
  };

  const onSwitchChange = (checked: boolean, itemUUID: string) => {
    const mappedAllPoints = allPoints?.map((point: PluginTableDataType) => {
      if (point.uuid === itemUUID) {
        return { ...point, isWrite: checked };
      } else {
        return point;
      }
    });
    setAllPoints(mappedAllPoints);
  };

  return (
    <>
      <div style={disablePointsPallet ? { pointerEvents: "none", opacity: "0.4" } : {}}>
        <Sider className="rubix-flow__node-sidebar node-picker z-10 text-white border-l border-gray-600">
          <div className="p-2">
            Points
            {activeKeyPanel.length !== Object.keys(displayObj).length ? (
              <Tooltip title={"expand all"}>
                <CaretRightOutlined
                  className="title-icon"
                  onClick={() => onChangeOpenPanels(Object.keys(displayObj))}
                />
              </Tooltip>
            ) : (
              <Tooltip title={"collapse all"}>
                <CaretDownOutlined className="title-icon" onClick={() => onChangeOpenPanels([])} />
              </Tooltip>
            )}
          </div>
          <div className="overflow-y-scroll points-menu">
            <Spin spinning={isFetchingPoints}>
              {isFetchingPoints ? (
                <div style={{ height: "80vh" }}></div>
              ) : (
                <Collapse
                  activeKey={activeKeyPanel}
                  expandIconPosition="right"
                  onChange={onChangeOpenPanels}
                  className="ant-menu ant-menu-root ant-menu-inline ant-menu-dark border-0"
                >
                  {displayObj &&
                    Object.keys(displayObj).map((pluginName: string) => (
                      <Panel
                        header={pluginName}
                        key={pluginName}
                        className="panel-no-padding border-gray-600 node-menu__header"
                      >
                        <div className="node-item">
                          {displayObj[`${pluginName}`].map((item: PluginTableDataType, index: number) => (
                            <div
                              key={`${item.name}`}
                              className={`cursor-po inter text-white border-gray-600 text-left flex flex-row justify-between ${
                                index === 0 ? "" : "border-t"
                              }`}
                              draggable={true}
                              onDragStart={(event) => onDragStart(event, item.name, item.isWrite)}
                            >
                              <div style={{ fontFamily: "monospace" }}>
                                {item.device_name && (
                                  <span style={{ fontSize: "smaller" }}>{`${item.device_name}`}</span>
                                )}
                                {item.point_name && <span>{`${item.point_name}`}</span>}
                              </div>
                              <div>
                                <Switch
                                  size={"small"}
                                  checkedChildren={<span style={{ fontSize: "10px" }}>Write</span>}
                                  unCheckedChildren={<span style={{ fontSize: "10px" }}>Read</span>}
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
              )}
            </Spin>
          </div>
        </Sider>
      </div>
      {disablePointsPallet && (
        <div
          style={{
            position: "fixed",
            height: "90%",
            width: 200,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <span style={{ color: "orange", fontSize: "16px" }}>Warning</span>
          <span style={{ color: "orange", fontSize: "14px" }}>Not in a flow network!</span>
        </div>
      )}
    </>
  );
};
