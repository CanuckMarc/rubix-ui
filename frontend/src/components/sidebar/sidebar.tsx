import { Avatar, Divider, Dropdown, Image, Layout, Menu, MenuProps, Row, Select, Spin, Switch, Tooltip } from "antd";
import {
  ApartmentOutlined,
  CloudServerOutlined,
  KeyOutlined,
  LeftOutlined,
  LockFilled,
  LockTwoTone,
  ToolOutlined,
  UserOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../../assets/images/nube-frog-green.png";
import { ROUTES } from "../../constants/routes";
import { DARK_THEME, getShowWires, LIGHT_THEME, SHOW_WIRES, useTheme } from "../../themes/use-theme";
import { SettingsFactory } from "../settings/factory";
import { useSettings } from "../settings/use-settings";
import { TokenModal } from "../settings/views/token-modal";
import { openNotificationWithIcon } from "../../utils/utils";
import { LocationFactory } from "../locations/factory";
import { ConnectionFactory } from "../connections/factory";
import { DataNode } from "antd/es/tree";
import { storage } from "../../../wailsjs/go/models";
import { getTreeDataIterative } from "../searchable-tree/searchable-tree.ui-service";
import eventEmit from "../rubix-flow/util/evenEmit";

import RubixConnection = storage.RubixConnection;

const { Sider } = Layout;
const { Option } = Select;

const locationFactory = new LocationFactory();
const connectionFactory = new ConnectionFactory();
const settingsFactory = new SettingsFactory();

interface TDataNode extends DataNode {
  name?: string;
  next?: string;
}

const DividerLock = (props: any) => {
  const { collapsed, collapseDisabled, setCollapseDisabled, refresh } = props;

  const handleLockSider = (e: Event) => {
    e.stopPropagation();
    setCollapseDisabled(!collapseDisabled);
  };

  return (
    <Divider
      plain
      orientation={collapsed ? "center" : "right"}
      className="white--text"
      style={{
        borderColor: "rgba(255, 255, 255, 0.12)",
      }}
    >
      {!collapsed && <ReloadOutlined onClick={refresh} style={{ fontSize: "18px", marginRight: "2rem" }} />}
      {collapseDisabled ? (
        <LockTwoTone onClick={(e: any) => handleLockSider(e)} style={{ fontSize: "18px" }} />
      ) : (
        <LockFilled onClick={(e: any) => handleLockSider(e)} style={{ fontSize: "18px" }} />
      )}
    </Divider>
  );
};

const HeaderSider = (props: any) => {
  const { collapsed, collapseDisabled, setCollapsed } = props;

  return (
    <Row className="logo">
      <Image width={36} src={logo} preview={false} />
      {!collapsed ? (
        <div className="title">
          Rubix Platform
          <LeftOutlined
            onClick={() => {
              if (!collapseDisabled) setCollapsed(!collapsed);
            }}
          />
        </div>
      ) : null}
    </Row>
  );
};

const AvatarDropdown = (props: any) => {
  const menu = (
    <Menu
      _internalDisableMenuItemTitleTooltip
      items={[
        {
          key: "1",
          label: SwitchThemeMenuItem(),
        },
        {
          key: "2",
          label: TokenMenuItem(props),
        },
        {
          key: "3",
          label: AutoRefreshPointsMenuItem(),
        },
        {
          key: "4",
          label: ShowWiresMenuItem(),
        },
      ]}
    />
  );

  return (
    <Dropdown overlay={menu} trigger={["click"]} overlayClassName="settings-dropdown">
      <a onClick={(e) => e.stopPropagation()}>
        <Avatar icon={<UserOutlined />} className="avar" />
      </a>
    </Dropdown>
  );
};

const TokenMenuItem = (props: any) => {
  const { setIsModalVisible } = props;

  return (
    <a onClick={() => setIsModalVisible(true)}>
      <KeyOutlined /> Token Update
    </a>
  );
};

const SwitchThemeMenuItem = () => {
  const [settings] = useSettings();
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    setDarkMode(settings.theme === DARK_THEME);
  }, [settings.theme]);

  const onChange = (checked: boolean) => {
    const theme = checked ? DARK_THEME : LIGHT_THEME;
    setDarkMode(checked);
    const newSettings = { ...settings, theme };
    settingsFactory.Update(newSettings).catch(console.error);
    window.location.reload();
  };

  return <Switch className="my-2" checkedChildren="🌙" unCheckedChildren="☀" checked={darkMode} onChange={onChange} />;
};

const AutoRefreshPointsMenuItem = () => {
  const [settings] = useSettings();
  const [time, setTime] = useState("");
  const [isEnable, setIsEnable] = useState(false);

  useEffect(() => {
    setTime("" + settings.auto_refresh_rate);
  }, [settings.auto_refresh_rate]);

  useEffect(() => {
    setIsEnable(settings.auto_refresh_enable);
  }, [settings.auto_refresh_enable]);

  const updateSettings = async (rate: string, enable: boolean) => {
    const refreshTime = Number(rate);
    const newSettings = {
      ...settings,
      auto_refresh_enable: enable,
      auto_refresh_rate: refreshTime,
    };
    await settingsFactory.Update(newSettings);
    openNotificationWithIcon("info", "Please refresh page to apply");
  };

  const handleChangeTime = (value: string) => {
    setTime(value);
    updateSettings(value, isEnable);
  };

  const handleChangeEnable = (checked: boolean) => {
    setIsEnable(checked);
    updateSettings(time, checked);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Tooltip title="Auto Refresh Points">
        <Switch style={{ marginRight: "10px" }} checked={isEnable} onChange={handleChangeEnable} />
      </Tooltip>
      <Select style={{ width: 120 }} value={time} disabled={!isEnable} onChange={handleChangeTime}>
        <Option value="5000">5 sec</Option>
        <Option value="15000">15 sec</Option>
        <Option value="30000">30 sec</Option>
      </Select>
    </div>
  );
};

const ShowWiresMenuItem = () => {
  const [settings] = useSettings();
  const [isEnable, setIsEnable] = useState(true);

  const handleChangeEnable = async (checked: boolean) => {
    setIsEnable(checked);
    localStorage.setItem(SHOW_WIRES, checked.toString());
    // await settingsFactory.Update({ ...settings, showWires: checked });
    openNotificationWithIcon("info", "Please refresh page to apply");
  };

  useEffect(() => {
    setIsEnable(getShowWires());
  }, []);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Switch style={{ marginRight: "10px" }} checked={isEnable} onChange={handleChangeEnable} />
      Show Wires
    </div>
  );
};

export const MenuSidebar = () => {
  const location = useLocation();
  const [isBlockMenu, setIsBlockMenu, isMiniMenu, setIsMiniMenu] = useTheme();
  const [collapsed, setCollapsed] = useState(isMiniMenu);
  const [collapseDisabled, setCollapseDisabled] = useState(isBlockMenu);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [routeData, updateRouteData] = useState([] as TDataNode[]);
  const [menu, setMenu] = useState<MenuProps["items"]>([]);
  const [allKeyMenus, setAllKeyMenus] = useState<string[]>([]);
  const [openingKeys, setOpenningKeys] = useState<string[]>([]);

  const sidebarItems = [
    {
      name: "Supervisors",
      icon: CloudServerOutlined,
      link: ROUTES.CONNECTIONS,
    },
    // { name: "App Store", icon: AppstoreOutlined, link: ROUTES.APP_STORE },
    { name: "Tools", icon: ToolOutlined, link: "" },
    { name: "Local-Rubix-Wires", icon: ApartmentOutlined, link: "" },
  ];

  const menuItems: MenuProps["items"] = sidebarItems.map((item) => {
    const { name, icon: Icon, link } = item;

    if (name === "Tools") {
      return {
        key: name,
        icon: <Icon />,
        label: (
          <Tooltip placement="right" title={name}>
            {name}
          </Tooltip>
        ),
        name: name,
        children: [
          {
            key: ROUTES.NETWORKING,
            name: ROUTES.NETWORKING,
            label: (
              <Tooltip placement="right" title={"Networking"}>
                <NavLink to={ROUTES.NETWORKING}>Networking</NavLink>
              </Tooltip>
            ),
          },
          {
            key: "Utils",
            name: "utils",
            label: (
              <Tooltip placement="right" title={"Utils"}>
                Utils
              </Tooltip>
            ),
            children: [
              {
                key: ROUTES.LOGS,
                name: ROUTES.LOGS,
                label: (
                  <Tooltip placement="right" title={"Logs"}>
                    <NavLink to={ROUTES.LOGS}>Logs</NavLink>
                  </Tooltip>
                ),
              },
              {
                key: ROUTES.BACKUPS,
                name: ROUTES.BACKUPS,
                label: (
                  <Tooltip placement="right" title={"Backups"}>
                    <NavLink to={ROUTES.BACKUPS}>Backups</NavLink>
                  </Tooltip>
                ),
              },
            ],
          },
        ],
      };
    }

    if (name === "Local-Rubix-Wires") {
      if (!!getShowWires()) {
        return {
          key: name,
          icon: <Icon />,
          label: (
            <Tooltip placement="right" title={name}>
              {name}
            </Tooltip>
          ),
          name: name,
          children: [
            {
              key: ROUTES.RUBIX_FLOW,
              name: ROUTES.RUBIX_FLOW,
              label: (
                <Tooltip placement="right" title={"Rubix-Wires Editor"}>
                  <NavLink to={ROUTES.RUBIX_FLOW}>Rubix-Wires Editor</NavLink>
                </Tooltip>
              ),
            },
            {
              key: ROUTES.WIRES_CONNECTIONS,
              name: ROUTES.WIRES_CONNECTIONS,
              label: (
                <Tooltip placement="right" title={"Rubix-Wires Connections"}>
                  <NavLink to={ROUTES.WIRES_CONNECTIONS}>Rubix-Wires Connections</NavLink>
                </Tooltip>
              ),
            },
            {
              key: ROUTES.USER_GUIDE,
              name: ROUTES.USER_GUIDE,
              label: (
                <Tooltip placement="right" title={"Rubix-Wires User Guide"}>
                  <NavLink to={ROUTES.USER_GUIDE}>Rubix-Wires User Guide</NavLink>
                </Tooltip>
              ),
            },
          ],
        };
      } else {
        return null;
      }
    }

    return {
      name: name,
      key: link,
      icon: <Icon />,
      label: <NavLink to={link}>{name}</NavLink>,
    };
  });

  const getLocations = async (connUUID: string) => {
    try {
      locationFactory.connectionUUID = connUUID;
      return await locationFactory.GetAll();
    } catch (err) {
      return [];
    }
  };

  const fetchConnections = async () => {
    try {
      setIsFetching(true);
      const connections = ((await connectionFactory.GetAll()) || []) as any[];
      const enabledConnections = connections.filter((c: RubixConnection) => c.enable);
      for (const c of enabledConnections) {
        let locations = [];
        locations = await getLocations(c.uuid);
        c.locations = locations;
      }
      const route = getTreeDataIterative(enabledConnections);
      updateRouteData(route);
    } finally {
      setIsFetching(false);
    }
  };

  const getSupervisorsMenu = async () => {
    let menu = menuItems as any;
    if (routeData.length > 0) {
      let supervisorsMenu = sidebarItems.find((item) => item.name === "Supervisors");
      const Icon = supervisorsMenu?.icon as any;
      menu[0] = { ...routeData[0], icon: <Icon /> };
    }
    await setMenu(menu);
    getKeyMenus();
  };

  const handleCollapse = (value: boolean) => {
    setCollapsed(value);
    setIsMiniMenu(value);
  };

  const handleBlock = (value: boolean) => {
    setCollapseDisabled(value);
    setIsBlockMenu(value);
  };

  eventEmit.on("openAllMenus", (data: any) => onUpdateOpenKeys(data));

  const onOpenChange = (openKeys: string[]) => {
    setOpenningKeys(openKeys);
  };

  const onUpdateOpenKeys = ({ key, isOpen }: any) => {
    let _openingKeys = openingKeys;
    if (isOpen) {
      _openingKeys = _openingKeys.concat(allKeyMenus.filter((menuKey) => menuKey.startsWith(key)));
    } else {
      _openingKeys = openingKeys.filter((menuKey) => !menuKey.startsWith(key));
    }
    setOpenningKeys(_openingKeys);
  };

  const getKeyMenus = () => {
    if (!routeData[0]) return [];
    let menuKeys: any[] = [routeData[0].key];
    routeData[0].children?.forEach((conenction: TDataNode) => {
      menuKeys.push(conenction.key);
      if (conenction.children && conenction.children.length > 0) {
        conenction.children.forEach((location: TDataNode) => {
          menuKeys.push(location.key);
          if (location.children && location.children.length > 0) {
            location.children.forEach((group: TDataNode) => {
              menuKeys.push(group.key);
              if (group.children && group.children.length > 0) {
                group.children.forEach((controller: TDataNode) => {
                  menuKeys.push(controller.key);
                  if (controller.children && controller.children.length > 0) {
                    controller.children.forEach((host: TDataNode) => {
                      menuKeys.push(host.key);
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
    setAllKeyMenus(menuKeys);
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    getSupervisorsMenu();
  }, [routeData]);

  return (
    <Sider
      id="sidebarMenu"
      width={280}
      style={{ minHeight: "100vh" }}
      collapsed={collapsed}
      onClick={() => {
        if (collapsed && !collapseDisabled) handleCollapse(false);
      }}
    >
      {isFetching ? (
        <Spin />
      ) : (
        <>
          <HeaderSider collapsed={collapsed} collapseDisabled={collapseDisabled} setCollapsed={handleCollapse} />
          <DividerLock
            collapsed={collapsed}
            collapseDisabled={collapseDisabled}
            setCollapseDisabled={handleBlock}
            refresh={fetchConnections}
          />
          <Menu
            mode="inline"
            theme="dark"
            items={menu}
            selectedKeys={[location.pathname]}
            activeKey={location.pathname}
            openKeys={openingKeys}
            onOpenChange={onOpenChange}
          />
          <AvatarDropdown setIsModalVisible={setIsModalVisible} />

          <TokenModal isModalVisible={isModalVisible} onClose={() => setIsModalVisible(false)} />
        </>
      )}
    </Sider>
  );
};
