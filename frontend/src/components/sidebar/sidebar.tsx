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
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../../assets/images/nube-frog-green.png";
import { ROUTES } from "../../constants/routes";
import { useConnections } from "../../hooks/useConnection";
import { DARK_THEME, LIGHT_THEME, useTheme } from "../../themes/use-theme";
import { SettingsFactory } from "../settings/factory";
import { useSettings } from "../settings/use-settings";
import { TokenModal } from "../settings/views/token-modal";
import { openNotificationWithIcon } from "../../utils/utils";

const { Sider } = Layout;
const { Option } = Select;

const DividerLock = (props: any) => {
  const { collapsed, collapseDisabled, setCollapseDisabled } = props;

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
  const settingsFactory = new SettingsFactory();

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

  const settingsFactory = new SettingsFactory();

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

export const MenuSidebar = () => {
  const location = useLocation();
  const { routeData, isFetching } = useConnections();
  const [isBlockMenu, setIsBlockMenu, isMiniMenu, setIsMiniMenu] = useTheme();
  const [collapsed, setCollapsed] = useState(isMiniMenu);
  const [collapseDisabled, setCollapseDisabled] = useState(isBlockMenu);
  const [isModalVisible, setIsModalVisible] = useState(false);

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
        label: <div>{name}</div>,
        name: name,
        children: [
          {
            key: ROUTES.NETWORKING,
            name: ROUTES.NETWORKING,
            label: <NavLink to={ROUTES.NETWORKING}>Networking</NavLink>,
          },
          {
            key: "Utils",
            name: "utils",
            label: <div>Utils</div>,
            children: [
              {
                key: ROUTES.LOGS,
                name: ROUTES.LOGS,
                label: <NavLink to={ROUTES.LOGS}>Logs</NavLink>,
              },
              {
                key: ROUTES.BACKUPS,
                name: ROUTES.BACKUPS,
                label: <NavLink to={ROUTES.BACKUPS}>Backups</NavLink>,
              },
            ],
          },
        ],
      };
    }

    if (name === "Local-Rubix-Wires") {
      return {
        key: name,
        icon: <Icon />,
        label: <div>{name}</div>,
        name: name,
        children: [
          {
            key: ROUTES.RUBIX_FLOW,
            name: ROUTES.RUBIX_FLOW,
            label: <NavLink to={ROUTES.RUBIX_FLOW}>Rubix-Wires Editor</NavLink>,
          },
          {
            key: ROUTES.WIRES_CONNECTIONS,
            name: ROUTES.WIRES_CONNECTIONS,
            label: <NavLink to={ROUTES.WIRES_CONNECTIONS}>Rubix-Wires Connections</NavLink>,
          },
          {
            key: ROUTES.USER_GUIDE,
            name: ROUTES.USER_GUIDE,
            label: <NavLink to={ROUTES.USER_GUIDE}>Rubix-Wires User Guide</NavLink>,
          },
        ],
      };
    }

    if (name === "Supervisors" && routeData.length > 0) {
      return { ...routeData[0], icon: <Icon /> } as any;
    }

    return {
      name: name,
      key: link,
      icon: <Icon />,
      label: <NavLink to={link}>{name}</NavLink>,
    };
  });

  const handleCollapse = (value: boolean) => {
    setCollapsed(value);
    setIsMiniMenu(value);
  };

  const handleBlock = (value: boolean) => {
    setCollapseDisabled(value);
    setIsBlockMenu(value);
  };

  return (
    <Sider
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
          <DividerLock collapsed={collapsed} collapseDisabled={collapseDisabled} setCollapseDisabled={handleBlock} />
          <Menu
            mode="inline"
            theme="dark"
            items={menuItems}
            selectedKeys={[location.pathname]}
            activeKey={location.pathname}
          />
          <AvatarDropdown setIsModalVisible={setIsModalVisible} />

          <TokenModal isModalVisible={isModalVisible} onClose={() => setIsModalVisible(false)} />
        </>
      )}
    </Sider>
  );
};
