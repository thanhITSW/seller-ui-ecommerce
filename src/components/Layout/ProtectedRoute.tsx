import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { notification } from 'antd';
import { useAppTranslation } from '@/hooks/common';

interface ProtectedRouteProps {
    requireActiveStore?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireActiveStore = true }) => {
    const { isLoggedIn, storeStatus } = useSelector((state: RootState) => state.auth);
    const t = useAppTranslation();
    const location = useLocation();

    // Kiểm tra trạng thái đăng nhập từ cả Redux và localStorage
    const accessToken = localStorage.getItem('accessToken');
    const localStoreStatus = localStorage.getItem('store_status');

    const isAuthenticated = isLoggedIn || !!accessToken;
    const currentStoreStatus = storeStatus || localStoreStatus;

    // Hiển thị thông báo nếu cửa hàng không active và đang cố truy cập trang bị hạn chế
    useEffect(() => {
        if (isAuthenticated && requireActiveStore && currentStoreStatus !== 'active' && location.pathname !== '/stores') {
            notification.warning({
                message: t('Cửa hàng chưa được kích hoạt'),
                description: t('Cửa hàng của bạn đang chờ xét duyệt hoặc bị từ chối. Bạn chỉ có thể truy cập trang cài đặt cửa hàng.'),
                duration: 3,
            });
        }
    }, [location.pathname, currentStoreStatus, requireActiveStore, isAuthenticated, t]);

    // Check if user is logged in
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If route requires active store and store is not active
    if (requireActiveStore && currentStoreStatus !== 'active') {
        return <Navigate to="/stores" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute; 