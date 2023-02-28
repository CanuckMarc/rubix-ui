import { Layout, Tooltip, Collapse, Switch, Spin, Popconfirm } from "antd";
import { CaretRightOutlined, CaretDownOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { NodeInterface } from "../lib/Nodes/NodeInterface";
import { FlowPointFactory } from "../../hosts/host/flow/points/factory";
import { backend, model } from "../../../../wailsjs/go/models";
import { useParams } from "react-router-dom";
import { EditModal } from "../../hosts/host/flow/points/views/edit";

import Point = model.Point;
import { openNotificationWithIcon } from "../../../utils/utils";

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
  const { connUUID = "", hostUUID = "" } = useParams();
  const [allPoints, setAllPoints] = useState<PluginTableDataType[] | undefined>(undefined);
  const [allPointsBeforeSearch, setAllPointsBeforeSearch] = useState<PluginTableDataType[] | undefined>(undefined);
  const [activeKeyPanel, setActiveKeyPanel] = useState<string[]>([]);
  const [displayObj, setDisplayObj] = useState<any>({});
  const [schema, setSchema] = useState<any>({});
  const [currentItemUUID, setCurrentItemUUID] = useState("");
  const [isFetchingPoints, setIsFetchingPoints] = useState(false);
  const [disablePointsPallet, setDisablePointsPallet] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);

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

  const showEditModal = (item: PluginTableDataType) => {
    setCurrentItemUUID(item.uuid);
    setIsEditModalVisible(true);
    getSchema(item.plugin_name);
  };

  const getSchema = async (pluginName: string) => {
    setIsLoadingForm(true);
    const res = await pointFactory.Schema(connUUID, hostUUID, pluginName);
    const jsonSchema = {
      properties: res,
    };
    setSchema(jsonSchema);
    setIsLoadingForm(false);
  };

  const deletePoint = async (uuid: string) => {
    try {
      const res = await pointFactory.Delete(uuid);
      openNotificationWithIcon("success", res);
      fetchFlowPoints();
    } catch (error) {
      openNotificationWithIcon("error", "Delete fail");
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

  useEffect(() => {
    pointFactory.connectionUUID = connUUID;
    pointFactory.hostUUID = hostUUID;
    fetchFlowPoints();
  }, [connUUID, hostUUID]);

  useEffect(() => {
    if (!selectedSubflow || selectedSubflow.type !== "flow/flow-network") {
      setDisablePointsPallet(true);
    } else {
      setDisablePointsPallet(false);
    }
  }, [selectedSubflow]);

  useEffect(() => {
    fetchFlowPoints();
  }, []);

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
                              <div>
                                {item.device_name && (
                                  <span style={{ fontSize: "smaller" }}>{`${item.device_name}`}</span>
                                )}
                                {item.point_name && <span>{`${item.point_name}`}</span>}
                              </div>
                              <div className="actions">
                                <a onClick={() => showEditModal(item)} className="mr-3">
                                  <EditOutlined />
                                </a>
                                <Popconfirm title="Are you sure?" onConfirm={() => deletePoint(item.uuid)}>
                                  <DeleteOutlined className="danger--text mr-3" />
                                </Popconfirm>
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

      <EditModal
        currentItemUUID={currentItemUUID}
        isModalVisible={isEditModalVisible}
        isLoadingForm={isLoadingForm}
        schema={schema}
        onCloseModal={() => setIsEditModalVisible(false)}
        refreshList={fetchFlowPoints}
      />
    </>
  );
};
