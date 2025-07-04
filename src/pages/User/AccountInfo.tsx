import React, { useEffect, useState, useRef } from 'react';
import {
    Card,
    Avatar,
    Button,
    Spin,
    Descriptions,
    Modal,
    message,
    Form,
    Input,
    Upload,
    notification,
} from 'antd';
import {
    EditOutlined,
    UserOutlined,
    LockOutlined,
    CameraOutlined,
    LoadingOutlined,
} from '@ant-design/icons';
import userApi from '@/api/userApi';
import { User } from '@/types/user';

const AccountInfo: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarModalVisible, setAvatarModalVisible] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Form instance
    const [editForm] = Form.useForm();
    const [passwordForm] = Form.useForm();

    // Lấy thông tin user
    const fetchUser = async () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const userObj = JSON.parse(userStr);
        const userId = userObj.id;
        if (!userId) return;
        setLoading(true);
        try {
            const res = await userApi.getUserById(userId);
            if (res.ok && res.body?.data) {
                setUser(res.body.data);
                // Reset form khi mở modal
                editForm.setFieldsValue({
                    fullname: res.body.data.fullname,
                    phone: res.body.data.phone,
                });
            } else {
                message.error(res.body?.message || 'Không lấy được thông tin người dùng');
            }
        } catch {
            message.error('Lỗi khi lấy thông tin người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
        // eslint-disable-next-line
    }, []);

    // Đổi thông tin cá nhân
    const handleEditInfo = async (values: any) => {
        if (!user) return;
        try {
            setLoading(true);
            const res = await userApi.updateUserInfo({
                email: user.email,
                fullname: values.fullname,
                phone: values.phone,
            });
            if (res.ok && res.body?.code === 0) {
                notification.success({
                    message: 'Cập nhật thông tin thành công',
                    description: res.body?.message || 'Thông tin cá nhân đã được cập nhật!',
                });
                setEditModalVisible(false);
                fetchUser();
            } else {
                notification.error({
                    message: 'Cập nhật thông tin thất bại',
                    description: res.body?.message || 'Không thể cập nhật thông tin',
                });
            }
        } catch (err: any) {
            notification.error({
                message: 'Cập nhật thông tin thất bại',
                description: err?.message || 'Không thể cập nhật thông tin',
            });
        } finally {
            setLoading(false);
        }
    };

    // Đổi avatar
    const handleAvatarChange = async (info: any) => {
        const file = info.file.originFileObj;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        setAvatarModalVisible(true);
    };

    const handleAvatarUpload = async () => {
        if (!user || !avatarFile) return;
        setAvatarLoading(true);
        try {
            const res = await userApi.updateAvatar(user.id, avatarFile);
            if (res.ok && res.body?.code === 0) {
                notification.success({
                    message: 'Cập nhật avatar thành công',
                    description: res.body?.message || 'Avatar đã được cập nhật!',
                });
                setAvatarModalVisible(false);
                fetchUser();
            } else {
                notification.error({
                    message: 'Cập nhật avatar thất bại',
                    description: res.body?.message || 'Không thể cập nhật avatar',
                });
            }
        } catch (err: any) {
            notification.error({
                message: 'Cập nhật avatar thất bại',
                description: err?.message || 'Không thể cập nhật avatar',
            });
        } finally {
            setAvatarLoading(false);
        }
    };

    // Đổi mật khẩu
    const handleChangePassword = async (values: any) => {
        if (!user) return;
        try {
            setLoading(true);
            const res = await userApi.changePassword(values.currentPassword, values.newPassword);
            if (res.ok && res.body?.code === 0) {
                notification.success({
                    message: 'Đổi mật khẩu thành công',
                    description: res.body?.message || 'Bạn đã đổi mật khẩu thành công!',
                });
                setPasswordModalVisible(false);
                passwordForm.resetFields();
            } else {
                notification.error({
                    message: 'Đổi mật khẩu thất bại',
                    description: res.body?.message || 'Không thể đổi mật khẩu',
                });
            }
        } catch (err: any) {
            notification.error({
                message: 'Đổi mật khẩu thất bại',
                description: err?.message || 'Không thể đổi mật khẩu',
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Spin style={{ display: 'block', margin: '40px auto' }} />;
    if (!user) return null;

    return (
        <Card
            title={<span style={{ fontSize: 22, fontWeight: 600 }}>Thông tin tài khoản</span>}
            style={{ maxWidth: 520, margin: '40px auto', boxShadow: '0 4px 24px #0001', borderRadius: 16 }}
            actions={[
                <Button type="primary" icon={<EditOutlined />} onClick={() => setEditModalVisible(true)} key="edit">Đổi thông tin</Button>,
                <Button icon={<LockOutlined />} onClick={() => setPasswordModalVisible(true)} key="password">Đổi mật khẩu</Button>,
            ]}
        >
            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', marginBottom: 24, position: 'relative' }}>
                <div
                    style={{ position: 'relative', cursor: 'pointer' }}
                    onMouseEnter={() => { }}
                    onClick={() => avatarInputRef.current?.click()}
                >
                    <Avatar
                        size={110}
                        src={user.avatar}
                        icon={<UserOutlined />}
                        style={{ border: '3px solid #e6e6e6', boxShadow: '0 2px 8px #0002' }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            background: '#fff',
                            borderRadius: '50%',
                            boxShadow: '0 2px 8px #0002',
                            padding: 6,
                            border: '1px solid #eee',
                        }}
                    >
                        <CameraOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        ref={avatarInputRef}
                        style={{ display: 'none' }}
                        onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                                setAvatarFile(e.target.files[0]);
                                setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                                setAvatarModalVisible(true);
                            }
                        }}
                    />
                </div>
                <h2 style={{ margin: '16px 0 0 0', fontWeight: 600 }}>{user.fullname}</h2>
                <div style={{ color: '#888', fontSize: 16 }}>{user.email}</div>
            </div>
            <Descriptions column={1} bordered size="small" style={{ borderRadius: 8 }}>
                <Descriptions.Item label="Số điện thoại">{user.phone}</Descriptions.Item>
                <Descriptions.Item label="Vai trò">{
                    user.role === 'admin_seller' ? 'Chủ nhà bán' :
                        user.role === 'staff_seller' ? 'Nhân viên nhà bán' :
                            user.role
                }</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">{user.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động'}</Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">{new Date(user.createdAt).toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Cập nhật lần cuối">{new Date(user.updatedAt).toLocaleString()}</Descriptions.Item>
            </Descriptions>

            {/* Modal đổi thông tin cá nhân */}
            <Modal
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                title={<span style={{ fontWeight: 600 }}>Đổi thông tin cá nhân</span>}
                okText="Lưu thay đổi"
                onOk={() => editForm.submit()}
                confirmLoading={loading}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    initialValues={{ fullname: user.fullname, phone: user.phone }}
                    onFinish={handleEditInfo}
                >
                    <Form.Item
                        label="Họ và tên"
                        name="fullname"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                        <Input size="large" />
                    </Form.Item>
                    <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại!' },
                            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' },
                        ]}
                    >
                        <Input size="large" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal đổi avatar */}
            <Modal
                open={avatarModalVisible}
                onCancel={() => setAvatarModalVisible(false)}
                title={<span style={{ fontWeight: 600 }}>Đổi avatar</span>}
                okText="Cập nhật avatar"
                onOk={handleAvatarUpload}
                confirmLoading={avatarLoading}
            >
                <div style={{ textAlign: 'center' }}>
                    <Avatar
                        size={110}
                        src={avatarPreview || user.avatar}
                        icon={<UserOutlined />}
                        style={{ border: '3px solid #e6e6e6', marginBottom: 16 }}
                    />
                    <div>
                        <Upload
                            showUploadList={false}
                            beforeUpload={file => {
                                setAvatarFile(file);
                                setAvatarPreview(URL.createObjectURL(file));
                                return false;
                            }}
                        >
                            <Button icon={<CameraOutlined />}>Chọn ảnh mới</Button>
                        </Upload>
                    </div>
                </div>
            </Modal>

            {/* Modal đổi mật khẩu */}
            <Modal
                open={passwordModalVisible}
                onCancel={() => setPasswordModalVisible(false)}
                title={<span style={{ fontWeight: 600 }}>Đổi mật khẩu</span>}
                okText="Đổi mật khẩu"
                onOk={() => passwordForm.submit()}
                confirmLoading={loading}
            >
                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleChangePassword}
                >
                    <Form.Item
                        label="Mật khẩu hiện tại"
                        name="currentPassword"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                    >
                        <Input.Password size="large" />
                    </Form.Item>
                    <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
                        ]}
                    >
                        <Input.Password size="large" />
                    </Form.Item>
                    <Form.Item
                        label="Nhập lại mật khẩu mới"
                        name="confirmPassword"
                        dependencies={["newPassword"]}
                        rules={[
                            { required: true, message: 'Vui lòng nhập lại mật khẩu mới!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password size="large" />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default AccountInfo; 