import React, { useState, useEffect } from 'react';
import { Button, message, Upload, Spin, Tooltip, Tag, Modal, Form, Input, DatePicker } from 'antd';
import { EditOutlined, CameraOutlined, UploadOutlined } from '@ant-design/icons';
import StoreForm from '../../components/Store/StoreForm/StoreForm';
import { Store, StoreLicense, LicenseType } from '../../types/Store';
import storeApi from '../../api/storeApi';
import '@/styles/Store/Store/Store.scss';
import { useSelector } from 'react-redux';
import moment from 'moment';

const getLicenseTypeLabel = (type: LicenseType): string => {
    switch (type) {
        case 'BUSINESS_REGISTRATION':
            return 'Giấy phép kinh doanh';
        case 'PHARMACIST_CERTIFICATE':
            return 'Chứng chỉ dược sĩ';
        case 'PHARMACY_OPERATION_CERTIFICATE':
            return 'Giấy chứng nhận đủ điều kiện kinh doanh dược';
        case 'GPP_CERTIFICATE':
            return 'Chứng nhận Thực hành tốt nhà thuốc (GPP)';
        default:
            return 'Giấy phép khác';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active':
            return 'success';
        case 'approved':
            return 'success';
        case 'pending':
            return 'warning';
        case 'rejected':
            return 'error';
        default:
            return 'default';
    }
};

const getStatusText = (status: string) => {
    switch (status) {
        case 'active':
            return 'Đang hoạt động';
        case 'approved':
            return 'Đã duyệt';
        case 'pending':
            return 'Đang chờ duyệt';
        case 'rejected':
            return 'Đã từ chối';
        default:
            return 'Không xác định';
    }
};

const StoreProfilePage: React.FC = () => {
    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(false);
    const [editVisible, setEditVisible] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [bannerUploading, setBannerUploading] = useState(false);
    const [updateLicenseModalVisible, setUpdateLicenseModalVisible] = useState(false);
    const [currentLicense, setCurrentLicense] = useState<StoreLicense | null>(null);
    const [form] = Form.useForm();

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

    const showUpdateLicenseModal = (license: StoreLicense) => {
        setCurrentLicense(license);
        form.setFieldsValue({
            license_number: license.license_number,
            issued_date: moment(license.issued_date),
            expired_date: moment(license.expired_date),
        });
        setUpdateLicenseModalVisible(true);
    };

    const handleUpdateLicense = async (values: any) => {
        if (!currentLicense) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('license_number', values.license_number);
        formData.append('issued_date', values.issued_date.format('YYYY-MM-DD'));
        formData.append('expired_date', values.expired_date.format('YYYY-MM-DD'));

        if (values.license_file && values.license_file.length > 0 && values.license_file[0].originFileObj) {
            formData.append('license', values.license_file[0].originFileObj);
        }

        try {
            const response = await storeApi.updateLicense(STORE_ID, currentLicense.id, formData);
            if (response.ok && response.body?.code === 0) {
                message.success(response.body?.message || 'Cập nhật giấy phép thành công');
                setUpdateLicenseModalVisible(false);
                fetchStore();
            } else {
                message.error(response.body?.message || 'Cập nhật giấy phép thất bại');
            }
        } catch (error) {
            console.error('Error updating license:', error);
            message.error('Có lỗi xảy ra khi cập nhật giấy phép');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !store) return <Spin style={{ marginTop: 100 }} />;

    return (
        <div className="profile-page">
            <div className="profile-banner">
                <img
                    src={store.banner_url || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPCkZCjZdyd0MYWxt8-NZYJ_hknodOlkQwgg&s'}
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
                    src={store.avatar_url || 'https://static.vecteezy.com/system/resources/previews/020/911/740/non_2x/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.png'}
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
                <div className="profile-contact">{store.address_detail}, {store.ward_name}, {store.district_name}, {store.province_name}</div>
                <div className="profile-status">
                    <Tag color={getStatusColor(store.status)}>
                        Trạng thái cửa hàng: {getStatusText(store.status)}
                    </Tag>
                </div>
                <Button icon={<EditOutlined />} onClick={handleEdit} className="profile-edit-btn">
                    Chỉnh sửa thông tin
                </Button>
            </div>

            <div className="profile-cards">
                <div className="profile-card">
                    <h3>Mô tả cửa hàng</h3>
                    <div className="desc-content">{store.description || 'Chưa có mô tả'}</div>
                </div>
            </div>

            {/* Licenses Section */}
            <div className="profile-section-title">
                <h2>Giấy phép kinh doanh</h2>
            </div>
            <div className="profile-licenses">
                {store.licenses && store.licenses.length > 0 ? (
                    // Group licenses by license_type
                    Object.entries(
                        store.licenses.reduce((acc: Record<string, StoreLicense[]>, license) => {
                            if (!acc[license.license_type]) {
                                acc[license.license_type] = [];
                            }
                            acc[license.license_type].push(license);
                            return acc;
                        }, {})
                    ).map(([licenseType, licenses]) => (
                        <div key={licenseType} className="license-group">
                            <h3 className="license-group-title">{getLicenseTypeLabel(licenseType as LicenseType)}</h3>

                            {/* Sort licenses - approved first, then pending, then others */}
                            {licenses
                                .sort((a, b) => {
                                    if (a.status === 'approved') return -1;
                                    if (b.status === 'approved') return 1;
                                    if (a.status === 'pending') return -1;
                                    if (b.status === 'pending') return 1;
                                    return 0;
                                })
                                .map((license: StoreLicense) => (
                                    <div key={license.id} className="license-item">
                                        <div className="license-header">
                                            <div className="license-title">
                                                {license.status === 'pending' && licenses.some(l => l.status === 'approved' && l.license_type === license.license_type) && (
                                                    <Tag color="orange" className="update-tag">Phiên bản cập nhật mới</Tag>
                                                )}
                                                <Tag color={getStatusColor(license.status)}>
                                                    {getStatusText(license.status)}
                                                </Tag>
                                            </div>
                                        </div>
                                        <div className="license-info">
                                            <p><strong>Số giấy phép:</strong> {license.license_number}</p>
                                            <p><strong>Ngày cấp:</strong> {moment(license.issued_date).format('DD/MM/YYYY')}</p>
                                            <p><strong>Ngày hết hạn:</strong> {moment(license.expired_date).format('DD/MM/YYYY')}</p>
                                        </div>
                                        <div className="license-image">
                                            <img src={license.license_url} alt={getLicenseTypeLabel(license.license_type as LicenseType)} />
                                        </div>
                                        <div className="license-actions">
                                            <Button
                                                type="primary"
                                                onClick={() => window.open(license.license_url, '_blank')}
                                            >
                                                Xem giấy phép
                                            </Button>
                                            {/* Only allow updates to the current approved license or a pending license if there's no approved one */}
                                            {(license.status === 'approved' ||
                                                (license.status === 'pending' && !licenses.some(l => l.status === 'approved'))) && (
                                                    <Button
                                                        icon={<EditOutlined />}
                                                        onClick={() => showUpdateLicenseModal(license)}
                                                    >
                                                        Cập nhật
                                                    </Button>
                                                )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ))
                ) : (
                    <p>Chưa có giấy phép nào</p>
                )}
            </div>

            {/* Store Photos Section */}
            <div className="profile-section-title">
                <h2>Hình ảnh cửa hàng</h2>
            </div>
            <div className="profile-photos">
                {store.photos && store.photos.length > 0 ? (
                    store.photos.map((photo) => (
                        <div key={photo.id} className="photo-item">
                            <img src={photo.photo_url} alt={photo.description || 'Hình ảnh cửa hàng'} />
                            {photo.description && <p className="photo-description">{photo.description}</p>}
                        </div>
                    ))
                ) : (
                    <p>Chưa có hình ảnh nào</p>
                )}
            </div>

            <StoreForm
                visible={editVisible}
                onCancel={handleEditCancel}
                onSubmit={handleEditSubmit}
                initialValues={store}
                loading={loading}
            />

            {/* Update License Modal */}
            <Modal
                title={`Cập nhật ${currentLicense ? getLicenseTypeLabel(currentLicense.license_type) : 'giấy phép'}`}
                visible={updateLicenseModalVisible}
                onCancel={() => setUpdateLicenseModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateLicense}
                >
                    <Form.Item
                        name="license_number"
                        label="Số giấy phép"
                        rules={[{ required: true, message: 'Vui lòng nhập số giấy phép' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="issued_date"
                        label="Ngày cấp"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày cấp' }]}
                    >
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="expired_date"
                        label="Ngày hết hạn"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn' }]}
                    >
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="license_file"
                        label="Tải lên giấy phép mới (nếu cần)"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => {
                            if (Array.isArray(e)) {
                                return e;
                            }
                            return e?.fileList;
                        }}
                    >
                        <Upload
                            name="license"
                            listType="picture"
                            maxCount={1}
                            beforeUpload={(file) => {
                                const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'application/pdf';
                                if (!isJpgOrPng) {
                                    message.error('Chỉ chấp nhận file JPG/PNG hoặc PDF!');
                                }
                                const isLt5M = file.size / 1024 / 1024 < 5;
                                if (!isLt5M) {
                                    message.error('File phải nhỏ hơn 5MB!');
                                }
                                return isJpgOrPng && isLt5M ? false : Upload.LIST_IGNORE;
                            }}
                            accept=".jpg,.jpeg,.png,.pdf"
                        >
                            <Button icon={<UploadOutlined />}>Chọn file</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Cập nhật
                        </Button>
                        <Button
                            onClick={() => setUpdateLicenseModalVisible(false)}
                            style={{ marginLeft: 8 }}
                        >
                            Hủy
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default StoreProfilePage; 