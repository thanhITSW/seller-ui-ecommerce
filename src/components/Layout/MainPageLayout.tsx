import React, { useEffect, useState } from "react";
import { Button, Layout, Menu, Dropdown, Avatar, Tooltip, Select } from "antd";
import {
  DashboardOutlined,
  LockOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  ToolOutlined,
  UserOutlined,
  CalendarOutlined,
  BellOutlined,
  ContactsOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  AppstoreOutlined,
  GiftOutlined,
  MenuFoldOutlined,
  ProfileOutlined,
  InboxOutlined,
  ScheduleOutlined,
  SunOutlined,
  MoonOutlined,
  BellFilled,
  MailOutlined,
  GlobalOutlined,
  ShoppingOutlined,
  MoneyCollectOutlined,
  ContainerOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useNavigate } from "react-router-dom";
import ukicon from "../../assets/uk-icon.svg";
import vietnamicon from "../../assets/flag-of-vietnam.svg";
import useLanguage, { Language } from "../../hooks/useLanguage";
import { useTheme } from "../../contexts/ThemeContext";

const { Header, Sider, Content } = Layout;

const userMenuItems = [
  {
    key: "profile",
    icon: <ProfileOutlined />,
    label: "Profile",
  },
  {
    key: "inbox",
    icon: <InboxOutlined />,
    label: "Inbox",
  },
  {
    key: "taskManager",
    icon: <ScheduleOutlined />,
    label: "Task Manager",
  },
  {
    key: "settings",
    icon: <SettingOutlined />,
    label: "Settings",
  },
  {
    key: "support",
    icon: <QuestionCircleOutlined />,
    label: "Support",
  },
  {
    key: "logout",
    icon: <CloseCircleOutlined />,
    label: "Logout",
  },
];

const languages = [
  {
    code: 'vn',
    name: 'Việt Nam',
    flagUrl: vietnamicon
  },
  {
    code: 'en',
    name: 'English',
    flagUrl: ukicon
  },
];

const MainPageLayout: React.FC = () => {
  const { language, changeLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const navigate = useNavigate

  const [currentLang, setCurrentLang] = useState<Language>();

  const handleLanguageChange = (value: string) => {
    setCurrentLang(value as Language);
    changeLanguage(value as Language);

    console.log(`Language changed to: ${value}`);
  };

  useEffect(() => {
    setCurrentLang(language);


  }, [language]);



  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">Ecommerce</span>
            <span className="logo-text">Admin</span>
          </div>
        </div>
        <div className="header-right">
          <Select
            style={{ width: 150 }}
            value={currentLang}
            onChange={handleLanguageChange}
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
            suffixIcon={<GlobalOutlined />}
          >
            {languages.map((lang) => (
              <Select.Option key={lang.code} value={lang.code}>
                <img
                  src={lang.flagUrl}
                  alt={`${lang.name} flag`}
                  style={{
                    width: "20px",
                    marginRight: "10px",
                    verticalAlign: "middle",
                  }}
                />
                {lang.name}
              </Select.Option>
            ))}
          </Select>
          <Tooltip title="Toggle theme">
            <Button
              type="text"
              icon={theme === 'light' ? <SunOutlined /> : <MoonOutlined />}
              className="theme-toggle"
              onClick={toggleTheme}
            />
          </Tooltip>
          <Tooltip title="Notifications">
            <Button
              type="text"
              icon={<BellFilled />}
              className="notification-btn"
            />
          </Tooltip>
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={["click"]}
            className="user-dropdown"
          >
            <div className="user-profile">
              <Avatar className="user-avatar">Admin</Avatar>
              <div className="user-info">
                <div className="user-name">Admin</div>
                <div className="user-role">Manager system</div>
              </div>
            </div>
          </Dropdown>
          <Button
            type="text"
            icon={<SettingOutlined />}
            className="settings-btn"
          />
        </div>
      </Header>
      <Layout>
        <Sider width={250} className="app-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-section-title">MAIN</div>
            <Menu mode="inline" defaultSelectedKeys={["errorPage"]}>
              <Menu.Item key="dashboards" icon={<DashboardOutlined />}>
                Dashboards
              </Menu.Item>
            </Menu>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">PAGES</div>
            <Menu mode="inline" defaultSelectedKeys={["errorPage"]}>
              <Menu.SubMenu key="product" icon={<ShoppingOutlined />} title="Product">
                <Menu.Item key="productManagement"><Link to="/products">Product Management</Link></Menu.Item>
                {/* <Menu.Item key="productApproval"><Link to="/products/approval">Approval</Link></Menu.Item> */}
                <Menu.Item key="productBrand"><Link to="/products/brand">Brand</Link></Menu.Item>
                {/* <Menu.Item key="productType"><Link to="/products/type">Product Type</Link></Menu.Item> */}
              </Menu.SubMenu>
              {/* <Menu.Item key="customerManagement" icon={<UserOutlined />}>
                <Link to="/customers">Customer Management</Link>
              </Menu.Item> */}
              <Menu.Item key="voucherManagement" icon={<GiftOutlined />}>
                <Link to="/vouchers">Voucher Management</Link>
              </Menu.Item>
              <Menu.Item key="storeManagement" icon={<ShoppingOutlined />}>
                <Link to="/stores">Store Settings</Link>
              </Menu.Item>
              <Menu.Item key="paymentManagement" icon={<MoneyCollectOutlined />}>
                <Link to="/payments">Payment Management</Link>
              </Menu.Item>
              <Menu.SubMenu key="payment" icon={<ContainerOutlined />} title="Payment">
                <Menu.Item key="paymentManagement"><Link to="/payments">Payment Management</Link></Menu.Item>
                <Menu.Item key="withdraw"><Link to="/withdraw-requests">Withdraw Request</Link></Menu.Item>
              </Menu.SubMenu>
              <Menu.SubMenu key="order" icon={<ContainerOutlined />} title="Order">
                <Menu.Item key="orderManagement"><Link to="/orders">Order Management</Link></Menu.Item>
                <Menu.Item key="RequestOrderReturn"><Link to="/orders/return-requests">Request Order Return</Link></Menu.Item>
              </Menu.SubMenu>
              <Menu.Item key="underMaintenance" icon={<ToolOutlined />}>
                Under Maintenance
              </Menu.Item>
              <Menu.Item key="userProfile" icon={<UserOutlined />}>
                User Profile
              </Menu.Item>
              <Menu.Item key="notifications" icon={<BellOutlined />}>
                Notifications
              </Menu.Item>
              <Menu.Item key="contacts" icon={<ContactsOutlined />}>
                Contacts
              </Menu.Item>
              <Menu.Item key="faq" icon={<QuestionCircleOutlined />}>
                Faq
              </Menu.Item>
              <Menu.Item key="accountSettings" icon={<SettingOutlined />}>
                Account settings
              </Menu.Item>
            </Menu>
          </div>

          {/* <div className="sidebar-section">
            <div className="sidebar-section-title">GENERAL</div>
            <Menu mode="inline">
              <Menu.Item key="uiKits" icon={<AppstoreOutlined />}>
                UI Kits
              </Menu.Item>
              <Menu.Item key="bonusUi" icon={<GiftOutlined />}>
                Bonus UI
              </Menu.Item>
            </Menu>
          </div> */}

          <div className="sidebar-footer">
            <Button type="text" icon={<MenuFoldOutlined />} />
          </div>
        </Sider>
        <Content className="app-content">
          {/* <div className="page-header">Error Page</div>
          <div className="error-container">
            <h1 className="error-title">Error</h1>
            <p className="error-message">Oops, The page you are looking for is not available</p>
            <p className="error-help">You can redirect to the home page by clicking below button.</p>
            <Button type="primary" className="back-home-btn">BACK TO HOME</Button>
          </div> */}
          <div className="page-header">{t('errors.header')}</div>
          <div className="error-container">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainPageLayout;
