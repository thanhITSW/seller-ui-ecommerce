import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Modal, Image, Space, Input, Select, Spin, message, Popconfirm, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { User, UserFormData } from '../../../types/user';
import userApi from '../../../api/userApi';
import UserForm from '../../../components/User/UserForm';
import debounce from 'lodash/debounce';

const { Search } = Input;
const { Option } = Select;

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    const fetchUsers = async (search?: string, status?: string) => {
        setLoading(true);
        try {
            const response = await userApi.getUsers({ search, status });
            if (!response.body) return;
            if (response.ok && response.body.code === 0) {
                setUsers(response.body.data);
            } else {
                message.error('Failed to fetch users');
            }
        } catch (error) {
            message.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(searchTerm, statusFilter);
    }, [searchTerm, statusFilter]);

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

    const handleFormSubmit = async (data: UserFormData) => {
        setFormLoading(true);
        try {
            if (!editUser) return;
            const response = await userApi.updateUser(editUser.id, data);
            if (response.ok && response.body?.code === 0) {
                message.success('User updated successfully');
                setFormVisible(false);
                fetchUsers(searchTerm, statusFilter);
            } else {
                message.error(response.body?.message || 'Failed to update user');
            }
        } catch (error) {
            message.error('Failed to update user');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setLoading(true);
        try {
            const response = await userApi.deleteUser(id);
            if (response.ok && response.body?.code === 0) {
                message.success('User deleted successfully');
                fetchUsers(searchTerm, statusFilter);
            } else {
                message.error(response.body?.message || 'Failed to delete user');
            }
        } catch (error) {
            message.error('Failed to delete user');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (id: string, currentStatus: string) => {
        setLoading(true);
        try {
            console.log(id)
            const response = await (currentStatus === 'active'
                ? userApi.deactivateUser(id)
                : userApi.activateUser(id)
            );
            if (response.ok && response.body?.code === 0) {
                message.success(`User ${currentStatus === 'active' ? 'deactivated' : 'activated'} successfully`);
                fetchUsers(searchTerm, statusFilter);
            } else {
                message.error(response.body?.message || 'Failed to update user status');
            }
        } catch (error) {
            message.error('Failed to update user status');
        } finally {
            setLoading(false);
        }
    };

    const columns: ColumnsType<User> = [
        {
            title: 'Full Name',
            dataIndex: 'fullname',
            key: 'fullname',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: User) => (
                <Space>
                    <Switch
                        checked={status === 'active'}
                        onChange={() => handleStatusToggle(record.id, record.status)}
                        checkedChildren="Active"
                        unCheckedChildren="Inactive"
                    />
                </Space>
            ),
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record: User) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this user?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Delete"
                        cancelText="Cancel"
                    >
                        <Button icon={<DeleteOutlined />} danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="user-list">
            <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Search
                    placeholder="Search by name, email, or phone"
                    allowClear
                    onChange={e => handleSearch(e.target.value)}
                    style={{ width: 300 }}
                />
                <Select
                    placeholder="Filter by status"
                    allowClear
                    onChange={handleStatusChange}
                    style={{ width: 200 }}
                >
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                </Select>
            </div>
            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} users`
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