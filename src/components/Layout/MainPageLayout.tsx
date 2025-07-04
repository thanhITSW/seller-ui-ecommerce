import React, { useEffect, useState } from "react";
import { Button, Layout, Menu, Dropdown, Avatar, Tooltip, Select, Popover, Badge, List, Spin } from "antd";
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
  CommentOutlined,
  ShopOutlined,
  CarOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useNavigate } from "react-router-dom";
import ukicon from "../../assets/uk-icon.svg";
import vietnamicon from "../../assets/flag-of-vietnam.svg";
import useLanguage, { Language } from "../../hooks/useLanguage";
import { useTheme } from "../../contexts/ThemeContext";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { logout } from "@/redux/slices/authSlice";
import { useDispatch } from "react-redux";
import { getNotifications, markNotificationAsRead } from '../../api/notificationApi';
import { HttpResponse } from '../../types/http';

const { Header, Sider, Content } = Layout;

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
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoggedIn, storeStatus } = useSelector((state: RootState) => state.auth);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const localStoreStatus = localStorage.getItem('store_status');
  const localStore = JSON.parse(localStorage.getItem('store') || '{}');
  const currentStoreStatus = storeStatus || localStoreStatus;

  const [currentLang, setCurrentLang] = useState<Language>();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLanguageChange = (value: string) => {
    setCurrentLang(value as Language);
    changeLanguage(value as Language);
  };

  useEffect(() => {
    setCurrentLang(language);
  }, [language]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('store_id');
    localStorage.removeItem('store_status');
    localStorage.removeItem('store');
    dispatch(logout());
    navigate('/login');
  };

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const res = await getNotifications() as unknown as HttpResponse<any>;
      setNotifications(res.body?.data || []);
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (notificationVisible) {
      fetchNotifications();
    }
  }, [notificationVisible]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      fetchNotifications(); // Refresh list
    } catch (err) {
      // Optionally: show error
    }
  };

  const handleSeeAllNotifications = () => {
    navigate('/notifications');
    setNotificationVisible(false);
  };

  const notificationContent = (
    <div style={{ width: 350, maxHeight: 400, overflowY: 'auto' }}>
      {loadingNotifications ? (
        <Spin style={{ width: '100%', margin: '20px 0' }} />
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 20 }}>Không có thông báo nào</div>
      ) : (
        <List
          dataSource={notifications.slice(0, 4)}
          renderItem={item => (
            <List.Item style={{ background: item.is_read ? '#fff' : '#f6faff', borderRadius: 4, margin: 4 }}
              actions={[
                !item.is_read && (
                  <CheckCircleOutlined
                    key="mark-as-read"
                    style={{ color: '#52c41a', cursor: 'pointer', fontSize: 18 }}
                    title="Đánh dấu đã đọc"
                    onClick={() => handleMarkAsRead(item.id)}
                  />
                )
              ]}
            >
              <List.Item.Meta
                title={<b>{item.title}</b>}
                description={<>
                  <div>{item.body}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{item.created_at}</div>
                </>}
              />
            </List.Item>
          )}
        />
      )}
      {notifications.length > 4 && (
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Button type="link" onClick={handleSeeAllNotifications} style={{ padding: 0 }}>Xem tất cả</Button>
        </div>
      )}
    </div>
  );

  const userMenuItems = [
    {
      key: "profile",
      icon: <ProfileOutlined />,
      label: "Thông tin tài khoản",
      onClick: () => navigate('/account-info'),
    },
    // {
    //   key: "inbox",
    //   icon: <InboxOutlined />,
    //   label: "Inbox",
    // },
    // {
    //   key: "taskManager",
    //   icon: <ScheduleOutlined />,
    //   label: "Task Manager",
    // },
    // {
    //   key: "settings",
    //   icon: <SettingOutlined />,
    //   label: "Settings",
    // },
    // {
    //   key: "support",
    //   icon: <QuestionCircleOutlined />,
    //   label: "Support",
    // },
    {
      key: "logout",
      icon: <CloseCircleOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">Ecommerce</span>
            <span className="logo-text">Seller</span>
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
          <Popover
            content={notificationContent}
            trigger="click"
            open={notificationVisible}
            onOpenChange={setNotificationVisible}
            placement="bottomRight"
          >
            <Badge count={unreadCount} overflowCount={99} size="small">
              <Button
                type="text"
                icon={<BellFilled />}
                className="notification-btn"
              />
            </Badge>
          </Popover>
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={["click"]}
            className="user-dropdown"
          >
            <div className="user-profile">
              <Avatar className="user-avatar">{localStore.avatar}</Avatar>
              <div className="user-info">
                <div className="user-name">{localStore.name}</div>
                <div className="user-role">{user.role}</div>
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
              {currentStoreStatus === 'active' && (
                <Menu.Item key="dashboards" icon={<DashboardOutlined />}>
                  <Link to="/">Trang chủ</Link>
                </Menu.Item>
              )}
            </Menu>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">PAGES</div>
            <Menu mode="inline" defaultSelectedKeys={["errorPage"]}>
              <Menu.Item key="storeManagement" icon={<ShopOutlined />}>
                <Link to="/stores">Cài đặt cửa hàng</Link>
              </Menu.Item>

              {currentStoreStatus === 'active' && (
                <>
                  <Menu.SubMenu key="product" icon={<ShoppingOutlined />} title="Quản lí sản phẩm">
                    <Menu.Item key="productManagement"><Link to="/products">Tất cả sản phẩm</Link></Menu.Item>
                    <Menu.Item key="suggestionProduct"><Link to="/products/suggestion">Đề xuất sản phẩm mới</Link></Menu.Item>
                    <Menu.Item key="productStatistics"><Link to="/products/statistics">Thống kê sản phẩm đã bán</Link></Menu.Item>
                  </Menu.SubMenu>
                  <Menu.SubMenu key="vouchers" icon={<ShoppingCartOutlined />} title="Kênh marketing">
                    <Menu.Item key="promotionManagement"><Link to="/promotions">Quản lí chương trình khuyến mãi</Link></Menu.Item>
                    <Menu.Item key="productPromotionManager"><Link to="/promotions/product">Quản lí sản phẩm trong chương trình khuyến mãi</Link></Menu.Item>
                    <Menu.Item key="voucherManagement"><Link to="/vouchers">Quản lí mã giảm giá</Link></Menu.Item>
                  </Menu.SubMenu>
                  <Menu.SubMenu key="customer" icon={<CommentOutlined />} title="Chăm sóc khách hàng">
                    <Menu.Item key="customerReview"><Link to="/products/reviews">Quản lí đánh giá</Link></Menu.Item>
                  </Menu.SubMenu>
                  <Menu.SubMenu key="payment" icon={<MoneyCollectOutlined />} title="Thanh toán">
                    <Menu.Item key="paymentManagement"><Link to="/payments">Quản lí thanh toán</Link></Menu.Item>
                    <Menu.Item key="withdraw"><Link to="/withdraw-requests">Quản lí rút tiền</Link></Menu.Item>
                  </Menu.SubMenu>
                  <Menu.SubMenu key="order" icon={<CarOutlined />} title="Đơn hàng">
                    <Menu.Item key="orderManagement"><Link to="/orders">Quản lí đơn hàng</Link></Menu.Item>
                    <Menu.Item key="RequestOrderReturn"><Link to="/orders/return-requests">Yêu cầu trả hàng</Link></Menu.Item>
                    <Menu.Item key="returnedOrder"><Link to="/orders/returned-orders">Đơn hàng đã trả lại</Link></Menu.Item>
                    <Menu.Item key="orderStatistics"><Link to="/orders/statistics">Thống kê đơn hàng</Link></Menu.Item>
                  </Menu.SubMenu>
                  {/* <Menu.Item key="underMaintenance" icon={<ToolOutlined />}>
                    Under Maintenance
                  </Menu.Item> */}
                  <Menu.Item key="userProfile" icon={<UserOutlined />}>
                    <Link to="/account-info">Thông tin tài khoản</Link>
                  </Menu.Item>
                  <Menu.Item key="notifications" icon={<BellOutlined />}>
                    <Link to="/notifications">Thông   báo</Link>
                  </Menu.Item>
                  {/* <Menu.Item key="contacts" icon={<ContactsOutlined />}>
                    Contacts
                  </Menu.Item>
                  <Menu.Item key="faq" icon={<QuestionCircleOutlined />}>
                    Faq
                  </Menu.Item> */}
                  {/* <Menu.Item key="accountSettings" icon={<SettingOutlined />}>
                    Account settings
                  </Menu.Item> */}
                </>
              )}
            </Menu>
          </div>

          {/* <div className="sidebar-footer">
            <Button type="text" icon={<MenuFoldOutlined />} />
          </div> */}
        </Sider>
        <Content className="app-content">
          <Outlet />
          {/* <div className="error-container">
            <Outlet />
          </div> */}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainPageLayout;
