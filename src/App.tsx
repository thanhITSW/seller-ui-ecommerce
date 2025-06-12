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
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';

function App() {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  if (isLoggedIn) {
    return (
      <Router>
        <Routes>
          <Route path="/my/error" element={<Error404 />} />
          <Route path="/my/products" element={<ProductManagement />} />
          <Route path="/my/products/approval" element={<ProductApproval />} />
          <Route path="/my/products/brand" element={<BrandPage />} />
          <Route path="/my/products/type" element={<ProductTypePage />} />
          <Route path="/my/customers" element={<UserPage />} />
          <Route path="/my/vouchers" element={<VoucherPage />} />
          <Route path="/my/orders" element={<OrderPage />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </Router>
    )
  }
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/" element={<MainPageLayout />}>
          <Route path="products" element={<ProductManagement />} />
          <Route path="products/approval" element={<ProductApproval />} />
          <Route path="products/brand" element={<BrandPage />} />
          <Route path="products/type" element={<ProductTypePage />} />
          <Route path="customers" element={<UserPage />} />
          <Route path="vouchers" element={<VoucherPage />} />
          <Route path="stores" element={<StorePage />} />
          <Route path="payments" element={<PaymentPage />} />
          <Route path="shipments" element={<ShipmentPage />} />
          <Route path="orders" element={<OrderPage />} />
          <Route path="orders/return-requests" element={<ReturnRequestPage />} />
        </Route>
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  )
}

export default App
