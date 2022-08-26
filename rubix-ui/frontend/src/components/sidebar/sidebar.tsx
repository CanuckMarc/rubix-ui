import {
  Layout,
  Divider,
  Row,
  Menu,
  Switch,
  Image,
  Dropdown,
  Avatar,
  MenuProps,
  Spin,
} from "antd";
import {
  ApartmentOutlined,
  ToolOutlined,
  UserOutlined,
  KeyOutlined,
  LockFilled,
  LeftOutlined,
  LockTwoTone,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { useTheme } from "../../themes/use-theme";
import { TokenModal } from "../settings/views/token-modal";
import { useConnections } from "../../hooks/useConnection";
import logo from "../../assets/images/nube-frog-green.png";

const { Sider } = Layout;

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
        <LockTwoTone
          onClick={(e: any) => handleLockSider(e)}
          style={{ fontSize: "18px" }}
        />
      ) : (
        <LockFilled
          onClick={(e: any) => handleLockSider(e)}
          style={{ fontSize: "18px" }}
        />
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
          Rubix Platform{" "}
          <LeftOutlined
            style={{ marginLeft: "2rem" }}
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
  const { setIsModalVisible } = props;
  const [darkMode, setDarkMode] = useTheme();
  const menu = (
    <Menu
      items={[
        {
          key: "1",
          label: (
            <a className="my-2" onClick={() => setIsModalVisible(true)}>
              <KeyOutlined /> Token Update
            </a>
          ),
        },
        {
          key: "2",
          label: (
            <Switch
              className="my-2"
              checkedChildren="🌙"
              unCheckedChildren="☀"
              checked={darkMode}
              onChange={setDarkMode}
            />
          ),
        },
      ]}
    />
  );
  return (
    <Dropdown
      overlay={menu}
      trigger={["click"]}
      overlayClassName="settings-dropdown"
    >
      <a onClick={(e) => e.preventDefault()}>
        <Avatar icon={<UserOutlined />} className="avar" />
      </a>
    </Dropdown>
  );
};

export const MenuSidebar = () => {
  const location = useLocation();
  const { routeData, isFetching } = useConnections();
  const [collapsed, setCollapsed] = useState(false);
  const [collapseDisabled, setCollapseDisabled] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const sidebarItems = [
    { name: "Supervisors", icon: ApartmentOutlined, link: ROUTES.CONNECTIONS },
    { name: "App Store", icon: AppstoreOutlined, link: ROUTES.APP_STORE },
    { name: "Tools", icon: ToolOutlined, link: "" },
  ];

  const menuItems: MenuProps["items"] = sidebarItems.map((item) => {
    const { name, icon: Icon, link } = item;

    if (name === "Supervisors") {
      return { ...routeData[0], icon: <Icon /> } as any;
    }

    if (name === "Tools") {
      return {
        key: name,
        icon: <Icon />,
        label: <div>{name}</div>,
        name: name,
        children: [
          {
            key: "Networking",
            name: "networking",
            label: <NavLink to="/networking">Networking</NavLink>,
          },
          {
            key: "Utils",
            name: "utils",
            label: <div>Utils</div>,
            children: [
              {
                key: "Logs",
                name: "logs",
                label: <NavLink to="/logs">Logs</NavLink>,
              },
              {
                key: "Backups",
                name: "backups",
                label: <NavLink to="/backups">Backups</NavLink>,
              },
            ],
          },
        ],
      };
    }

    return {
      name: name,
      key: link,
      icon: <Icon />,
      label: <NavLink to={link}>{name}</NavLink>,
    };
  });
  return (
    <Sider
      width={250}
      style={{ minHeight: "100vh" }}
      collapsed={collapsed}
      onClick={() => {
        if (collapsed && !collapseDisabled) setCollapsed(false);
      }}
    >
      {isFetching ? (
        <Spin />
      ) : (
        <>
          <HeaderSider
            collapsed={collapsed}
            collapseDisabled={collapseDisabled}
            setCollapsed={setCollapsed}
          />
          <DividerLock
            collapsed={collapsed}
            collapseDisabled={collapseDisabled}
            setCollapseDisabled={setCollapseDisabled}
          />
          <Menu
            mode="inline"
            theme="dark"
            items={menuItems}
            selectedKeys={[location.pathname]}
            activeKey={location.pathname}
          />
          <AvatarDropdown setIsModalVisible={setIsModalVisible} />

          <TokenModal
            isModalVisible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
          />
        </>
      )}
    </Sider>
  );
};
