import axiosClient from './axiosClient';

function getStoreId() {
    const storeId = localStorage.getItem('store_id');
    if (!storeId) throw new Error('No store_id in localStorage');
    return storeId;
}

// Lưu FCM token
export const saveFcmToken = (data: { token: string; target_type?: string; store_id: string }) => {
    return axiosClient.post('/notification/notifications/save-fcm-token', {
        ...data,
        target_type: data.target_type || 'seller',
    });
};

// Lấy danh sách thông báo
export const getNotifications = () => {
    return axiosClient.get('/notification/notifications', {
        params: {
            store_id: getStoreId(),
            target_type: 'seller',
        },
    });
};

export const markNotificationAsRead = (notificationId: string) => {
    return axiosClient.post('/notification/notifications/mark-as-read', {
        notificationId,
    });
}; 