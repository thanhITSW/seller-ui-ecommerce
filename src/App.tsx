import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register/Register';
import LoginComponent from './pages/Login/components/LoginComponent';
import MainPageLayout from './components/Layout/MainPageLayout';
import Error404 from './components/Errors/Error404';
import ProductManagement from './pages/Product/ProductManagement';
import ProductApproval from './pages/Product/ProductApproval';
import BrandPage from './pages/Product/Brand';
import ProductTypePage from './pages/Product/ProductType/ProductType';
import UserPage from './pages/User/User';
import VoucherPage from './pages/Voucher/Voucher';
import StorePage from './pages/Store/Store';
import PaymentPage from './pages/Payment/Payment';
import ShipmentPage from './pages/Shipment/Shipment';
import { OrderPage, ReturnRequestPage } from './pages/Order';
import WithdrawRequestPage from './pages/WithdrawRequest';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setLoginStatus, setStoreInfo, setUserDetails } from './redux/slices/authSlice';

function App() {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const storeId = localStorage.getItem('store_id');
    const storeStatus = localStorage.getItem('store_status');
    const userJson = localStorage.getItem('user');

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

  // Hiển thị loading hoặc không hiển thị gì cho đến khi khởi tạo xong
  if (!isInitialized) {
    return null;
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LoginComponent />} />

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
            <Route path="products/brand" element={<BrandPage />} />
            <Route path="products/type" element={<ProductTypePage />} />
            <Route path="customers" element={<UserPage />} />
            <Route path="vouchers" element={<VoucherPage />} />
            <Route path="payments" element={<PaymentPage />} />
            <Route path="shipments" element={<ShipmentPage />} />
            <Route path="orders" element={<OrderPage />} />
            <Route path="orders/return-requests" element={<ReturnRequestPage />} />
            <Route path="withdraw-requests" element={<WithdrawRequestPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  )
}

export default App
