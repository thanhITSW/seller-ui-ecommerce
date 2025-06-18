import React, { useState, useEffect } from 'react';
import { Button, message, Upload, Spin, Tooltip } from 'antd';
import { EditOutlined, CameraOutlined } from '@ant-design/icons';
import StoreForm from '../../components/Store/StoreForm/StoreForm';
import { Store } from '../../types/Store';
import storeApi from '../../api/storeApi';
import '@/styles/Store/Store/Store.scss';
import { useSelector } from 'react-redux';

const StoreProfilePage: React.FC = () => {
    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(false);
    const [editVisible, setEditVisible] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [bannerUploading, setBannerUploading] = useState(false);
    const STORE_ID = localStorage.getItem('store_id') || '';

    const fetchStore = async () => {
        setLoading(true);
        const response = await storeApi.getById(STORE_ID);
        if (response.ok && response.body?.code === 0) {
            setStore(response.body.data);
        } else {
            message.error(response.body?.message || 'Không thể tải thông tin cửa hàng');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStore();
    }, []);

    const handleEdit = () => setEditVisible(true);
    const handleEditCancel = () => setEditVisible(false);
    const handleEditSubmit = async (values: Partial<Store>) => {
        setLoading(true);
        const response = await storeApi.update(STORE_ID, values);
        if (response.ok && response.body?.code === 0) {
            message.success('Cập nhật thông tin thành công');
            setEditVisible(false);
            fetchStore();
        } else {
            message.error(response.body?.message || 'Cập nhật thất bại');
        }
        setLoading(false);
    };

    const handleAvatarChange = async (info: any) => {
        if (info.file.status === 'uploading') {
            setAvatarUploading(true);
            return;
        }
        if (info.file.status === 'done' || info.file.originFileObj) {
            const file = info.file.originFileObj;
            if (!file) return;
            setAvatarUploading(true);
            const response = await storeApi.uploadAvatar(STORE_ID, file);
            if (response.ok && response.body?.code === 0) {
                message.success('Cập nhật avatar thành công');
                fetchStore();
            } else {
                message.error(response.body?.message || 'Cập nhật avatar thất bại');
            }
            setAvatarUploading(false);
        }
    };

    const handleBannerChange = async (info: any) => {
        if (info.file.status === 'uploading') {
            setBannerUploading(true);
            return;
        }
        if (info.file.status === 'done' || info.file.originFileObj) {
            const file = info.file.originFileObj;
            if (!file) return;
            setBannerUploading(true);
            const response = await storeApi.uploadBanner(STORE_ID, file);
            if (response.ok && response.body?.code === 0) {
                message.success('Cập nhật banner thành công');
                fetchStore();
            } else {
                message.error(response.body?.message || 'Cập nhật banner thất bại');
            }
            setBannerUploading(false);
        }
    };

    if (loading || !store) return <Spin style={{ marginTop: 100 }} />;

    return (
        <div className="profile-page">
            <div className="profile-banner">
                <img
                    src={store.banner_url || 'https://via.placeholder.com/1200x300?text=Banner'}
                    alt="banner"
                />
                <Upload
                    showUploadList={false}
                    customRequest={({ file, onSuccess }) => { onSuccess && onSuccess('ok'); handleBannerChange({ file: { originFileObj: file } }); }}
                >
                    <Tooltip title="Đổi banner">
                        <Button
                            shape="circle"
                            icon={<CameraOutlined />}
                            className="profile-edit-banner"
                            loading={bannerUploading}
                        />
                    </Tooltip>
                </Upload>
            </div>
            <div className="profile-avatar-wrapper">
                <img
                    src={store.avatar_url || 'https://via.placeholder.com/180?text=Avatar'}
                    alt="avatar"
                    className="profile-avatar"
                />
                <Upload
                    showUploadList={false}
                    customRequest={({ file, onSuccess }) => { onSuccess && onSuccess('ok'); handleAvatarChange({ file: { originFileObj: file } }); }}
                >
                    <Tooltip title="Đổi avatar">
                        <Button
                            shape="circle"
                            icon={<CameraOutlined />}
                            className="profile-edit-avatar"
                            loading={avatarUploading}
                        />
                    </Tooltip>
                </Upload>
            </div>
            <div className="profile-info">
                <h2>{store.name}</h2>
                <div className="profile-contact">{store.email}</div>
                <div className="profile-contact">{store.phone}</div>
                <div className="profile-contact">{store.address_detail}</div>
                <Button icon={<EditOutlined />} onClick={handleEdit} className="profile-edit-btn">
                    Chỉnh sửa thông tin
                </Button>
            </div>
            <div className="profile-cards">
                <div className="profile-card">
                    <h3>Mô tả cửa hàng</h3>
                    <div className="desc-content">{store.description || 'Chưa có mô tả'}</div>
                </div>
                {store.license_url && (
                    <div className="profile-card">
                        <h3>Giấy phép kinh doanh</h3>
                        <a href={store.license_url} target="_blank" rel="noopener noreferrer">Xem giấy phép</a>
                    </div>
                )}
            </div>
            <StoreForm
                visible={editVisible}
                onCancel={handleEditCancel}
                onSubmit={handleEditSubmit}
                initialValues={store}
                loading={loading}
            />
        </div>
    );
};

export default StoreProfilePage; 