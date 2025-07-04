import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register/Register';
import LoginComponent from './pages/Login/components/LoginComponent';
import MainPageLayout from './components/Layout/MainPageLayout';
import Error404 from './components/Errors/Error404';
import ProductManagement from './pages/Product/ProductManagement';
import ProductApproval from './pages/Product/ProductApproval';
import SuggestionProductPage from './pages/Product/SuggestionProduct';
import ProductTypePage from './pages/Product/ProductType/ProductType';
import UserPage from './pages/User/User';
import VoucherPage from './pages/Voucher/Voucher';
import StorePage from './pages/Store/Store';
import PaymentPage from './pages/Payment/Payment';
import ShipmentPage from './pages/Shipment/Shipment';
import PromotionPage from './pages/Promotion/Promotion';
import ProductPromotionManager from './pages/Promotion/ProductPromotionManager';
import { OrderPage, ReturnRequestPage } from './pages/Order';
import WithdrawRequestPage from './pages/WithdrawRequest';
import ProductReviewManager from './pages/Product/ProductReviewManager';
import ProductStatistics from './pages/Product/ProductStatistics';
import OrderStatistics from './pages/Order/OrderStatistics';
import ReturnedOrderPage from './pages/ReturnedOrder';
import AccountInfo from './pages/User/AccountInfo';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setLoginStatus, setStoreInfo, setUserDetails } from './redux/slices/authSlice';
import PublicRoute from './components/Common/PublicRoute';
import { requestFCMToken, onMessageListener } from './utils/firebaseUtils';
import { notification } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { saveFcmToken } from './api/notificationApi';
import NotificationList from './pages/Notification';

function App() {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const storeId = localStorage.getItem('store_id');
    const storeStatus = localStorage.getItem('store_status');
    const userJson = localStorage.getItem('user');

    const fetchFCMToken = async () => {
      try {
        const token = await requestFCMToken();
        setFcmToken(token);
        // Gọi API lưu FCM token nếu có token và storeId
        if (token && storeId) {
          try {
            await saveFcmToken({ token, store_id: storeId });
          } catch (err) {
            console.error('Error saving FCM token:', err);
          }
        }
      } catch (error) {
        console.error("Error fetching FCM token:", error);
      }
    };

    fetchFCMToken();

    if (accessToken && storeId && storeStatus) {
      // Khôi phục thông tin người dùng
      if (userJson) {
        try {
          const user = JSON.parse(userJson);
          dispatch(setUserDetails(user));
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
        }
      }

      // Khôi phục thông tin đăng nhập và cửa hàng
      dispatch(setLoginStatus(true));
      dispatch(setStoreInfo({
        storeId,
        storeStatus: storeStatus as any
      }));
    }

    // Đánh dấu đã hoàn thành khởi tạo
    setIsInitialized(true);
  }, [dispatch]);

  useEffect(() => {
    const handleMessage = (payload: any) => {
      notification.info({
        message: payload.notification.title,
        description: payload.notification.body,
        icon: <BellOutlined />
      });
    };
    onMessageListener(handleMessage);
  }, []);

  // Hiển thị loading hoặc không hiển thị gì cho đến khi khởi tạo xong
  if (!isInitialized) {
    return null;
  }



  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<LoginComponent />} />
        </Route>

        {/* Main layout with store settings - accessible even if store is not active */}
        <Route element={<ProtectedRoute requireActiveStore={false} />}>
          <Route path="/" element={<MainPageLayout />}>
            <Route index element={<StorePage />} /> {/* Trang mặc định khi vào / */}
            <Route path="stores" element={<StorePage />} />
          </Route>
        </Route>

        {/* Protected routes - only accessible if store is active */}
        <Route element={<ProtectedRoute requireActiveStore={true} />}>
          <Route path="/" element={<MainPageLayout />}>
            <Route path="products" element={<ProductManagement />} />
            <Route path="products/approval" element={<ProductApproval />} />
            <Route path="products/suggestion" element={<SuggestionProductPage />} />
            <Route path="products/type" element={<ProductTypePage />} />
            <Route path="products/reviews" element={<ProductReviewManager />} />
            <Route path="products/statistics" element={<ProductStatistics />} />
            <Route path="customers" element={<UserPage />} />
            <Route path="promotions" element={<PromotionPage />} />
            <Route path="promotions/product" element={<ProductPromotionManager />} />
            <Route path="vouchers" element={<VoucherPage />} />
            <Route path="payments" element={<PaymentPage />} />
            <Route path="shipments" element={<ShipmentPage />} />
            <Route path="orders" element={<OrderPage />} />
            <Route path="orders/statistics" element={<OrderStatistics />} />
            <Route path="orders/return-requests" element={<ReturnRequestPage />} />
            <Route path="orders/returned-orders" element={<ReturnedOrderPage />} />
            <Route path="withdraw-requests" element={<WithdrawRequestPage />} />
            <Route path="account-info" element={<AccountInfo />} />
            <Route path="notifications" element={<NotificationList />} />
          </Route>
        </Route>

        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  )
}

export default App
