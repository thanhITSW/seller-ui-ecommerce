import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Input, Select, Spin, notification, Popconfirm, Switch, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { User, UserFormData } from '../../../types/user';
import userApi from '../../../api/userApi';
import storeApi from '../../../api/storeApi';
import UserForm from '../../../components/User/UserForm';
import debounce from 'lodash/debounce';

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    const storeId = localStorage.getItem('store_id') || '';

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await userApi.getUsersByStoreId(storeId);
            if (!response.body) return;
            if (response.ok && response.body.code === 0) {
                setUsers(response.body.data);
            } else {
                notification.error({
                    message: 'Lỗi tải dữ liệu',
                    description: 'Không thể tải danh sách tài khoản cửa hàng'
                });
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi tải dữ liệu',
                description: 'Không thể tải danh sách tài khoản cửa hàng'
            });
        } finally {
            setLoading(false);
        }
    };

    // Filter users on frontend
    useEffect(() => {
        let filtered = users;
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(u =>
                u.fullname.toLowerCase().includes(lower) ||
                u.email.toLowerCase().includes(lower) ||
                u.phone.includes(lower)
            );
        }
        if (statusFilter) {
            filtered = filtered.filter(u => u.status === statusFilter);
        }
        setFilteredUsers(filtered);
    }, [users, searchTerm, statusFilter]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearch = debounce((value: string) => {
        setSearchTerm(value);
    }, 500);

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
    };

    const handleEdit = (user: User) => {
        setEditUser(user);
        setFormVisible(true);
    };

    const handleFormSubmit = async (data: UserFormData & { role?: string, password?: string }) => {
        setFormLoading(true);
        try {
            if (editUser) {
                // Cập nhật tài khoản hiện có
                const response = await userApi.updateUser(editUser.id, data);
                if (response.ok && response.body?.code === 0) {
                    notification.success({
                        message: 'Cập nhật thành công',
                        description: 'Thông tin tài khoản đã được cập nhật'
                    });
                    setFormVisible(false);
                    fetchUsers(); // Re-fetch all users to update the list
                } else {
                    notification.error({
                        message: 'Cập nhật thất bại',
                        description: response.body?.message || 'Không thể cập nhật thông tin tài khoản'
                    });
                }
            } else {
                // Tạo tài khoản mới
                const createData = {
                    email: data.email,
                    fullname: data.fullname,
                    phone: data.phone,
                    password: data.password || '',
                    role: data.role || 'staff_seller',
                    status: data.status
                };
                const response = await userApi.createAccount(createData);
                if (response.ok && response.body?.code === 0) {
                    const user_id = response.body.data?.id;
                    if (user_id && storeId) {
                        const accessRes = await storeApi.addUserSellerAccess(user_id, storeId);
                        if (accessRes.ok && accessRes.body?.code === 0) {
                            notification.success({
                                message: 'Tạo tài khoản thành công',
                                description: 'Tài khoản mới đã được tạo và phân quyền truy cập cửa hàng.'
                            });
                        } else {
                            notification.warning({
                                message: 'Tạo tài khoản thành công',
                                description: 'Tài khoản đã tạo nhưng phân quyền truy cập cửa hàng thất bại.'
                            });
                        }
                    } else {
                        notification.warning({
                            message: 'Tạo tài khoản thành công',
                            description: 'Không lấy được user_id hoặc store_id để phân quyền truy cập.'
                        });
                    }
                    setFormVisible(false);
                    fetchUsers(); // Re-fetch all users to update the list
                } else {
                    notification.error({
                        message: 'Tạo tài khoản thất bại',
                        description: response.body?.message || 'Không thể tạo tài khoản mới'
                    });
                }
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi xử lý',
                description: 'Có lỗi xảy ra, vui lòng thử lại sau'
            });
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setLoading(true);
        try {
            const response = await userApi.deleteUser(id);
            if (response.ok && response.body?.code === 0) {
                // Xóa quyền truy cập user_seller_access
                const accessRes = await storeApi.deleteUserSellerAccess(id);
                if (accessRes.ok && accessRes.body?.code === 0) {
                    notification.success({
                        message: 'Xóa tài khoản thành công',
                        description: 'Tài khoản và quyền truy cập đã được xóa khỏi hệ thống'
                    });
                } else {
                    notification.warning({
                        message: 'Xóa tài khoản thành công',
                        description: 'Tài khoản đã xóa nhưng không xóa được quyền truy cập cửa hàng.'
                    });
                }
                fetchUsers(); // Re-fetch all users to update the list
            } else {
                notification.error({
                    message: 'Xóa tài khoản thất bại',
                    description: response.body?.message || 'Không thể xóa tài khoản'
                });
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi xử lý',
                description: 'Có lỗi xảy ra, vui lòng thử lại sau'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (id: string, currentStatus: string) => {
        setLoading(true);
        try {
            const response = await (currentStatus === 'active'
                ? userApi.deactivateUser(id)
                : userApi.activateUser(id)
            );
            if (response.ok && response.body?.code === 0) {
                notification.success({
                    message: 'Cập nhật trạng thái thành công',
                    description: `Tài khoản đã được ${currentStatus === 'active' ? 'vô hiệu hóa' : 'kích hoạt'}`
                });
                fetchUsers(); // Re-fetch all users to update the list
            } else {
                notification.error({
                    message: 'Cập nhật trạng thái thất bại',
                    description: response.body?.message || 'Không thể cập nhật trạng thái tài khoản'
                });
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi xử lý',
                description: 'Có lỗi xảy ra, vui lòng thử lại sau'
            });
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnsType<User> = [
        {
            title: 'Họ và tên',
            dataIndex: 'fullname',
            key: 'fullname',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => {
                let displayRole = role;
                if (role === 'admin_seller') {
                    displayRole = 'Chủ cửa hàng';
                } else if (role === 'staff_seller') {
                    displayRole = 'Nhân viên cửa hàng';
                }
                return displayRole;
            }
        },
        {
            title: 'Trạng thái tài khoản',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: User) => (
                <Space>
                    <Switch
                        checked={status === 'active'}
                        onChange={() => handleStatusToggle(record.id, record.status)}
                        checkedChildren="Hoạt động"
                        unCheckedChildren="Vô hiệu"
                    />
                </Space>
            ),
        },
        {
            title: 'Trạng thái truy cập',
            dataIndex: 'access_status',
            key: 'access_status',
            render: (status: string) => (
                <span>{status === 'active' ? 'Hoạt động' : 'Vô hiệu'}</span>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record: User) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa tài khoản này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button icon={<DeleteOutlined />} danger>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="account-management">
            <Title level={2}>Quản lý tài khoản</Title>
            <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Search
                    placeholder="Tìm kiếm theo tên, email, số điện thoại"
                    allowClear
                    onChange={e => handleSearch(e.target.value)}
                    style={{ width: 300 }}
                />
                <Select
                    placeholder="Lọc theo trạng thái"
                    allowClear
                    onChange={handleStatusChange}
                    style={{ width: 200 }}
                >
                    <Option value="active">Hoạt động</Option>
                    <Option value="inactive">Vô hiệu</Option>
                </Select>
                <Button type="primary" onClick={() => {
                    setEditUser(null);
                    setFormVisible(true);
                }}>
                    Thêm tài khoản mới
                </Button>
            </div>
            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} tài khoản`
                    }}
                />
            </Spin>
            <UserForm
                visible={formVisible}
                onCancel={() => setFormVisible(false)}
                onSubmit={handleFormSubmit}
                initialValues={editUser || undefined}
                loading={formLoading}
            />
        </div>
    );
};

export default UserList; 