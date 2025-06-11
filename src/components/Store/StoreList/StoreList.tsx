import React, { useState } from 'react';
import { Table, Button, Space, Popconfirm, Tag, Avatar, Select, Input } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { Store, StoreStatus } from '../../../types/Store';

interface StoreListProps {
    stores: Store[];
    onEdit: (store: Store) => void;
    onDelete: (id: string) => void;
    loading: boolean;
    onFilterChange: (filter: { status: StoreStatus | 'all'; search: string }) => void;
    filterStatus: StoreStatus | 'all';
    search: string;
}

const statusColors: Record<StoreStatus, string> = {
    active: 'green',
    inactive: 'orange',
    pending: 'blue',
    rejected: 'red',
};

const StoreList: React.FC<StoreListProps> = ({
    stores,
    onEdit,
    onDelete,
    loading,
    onFilterChange,
    filterStatus,
    search,
}) => {
    const [searchValue, setSearchValue] = useState(search);

    const handleStatusFilter = (value: StoreStatus | 'all') => {
        onFilterChange({ status: value, search: searchValue });
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
        onFilterChange({ status: filterStatus, search: e.target.value });
    };

    const columns = [
        {
            title: 'Avatar',
            dataIndex: 'avatar_url',
            key: 'avatar_url',
            render: (url: string) => <Avatar src={url} />,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
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
            title: 'Address',
            dataIndex: 'address_line',
            key: 'address_line',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: StoreStatus) => <Tag color={statusColors[status]}>{status}</Tag>,
            filters: [
                { text: 'Active', value: 'active' },
                { text: 'Inactive', value: 'inactive' },
                { text: 'Rejected', value: 'rejected' },
            ],
            filteredValue: filterStatus === 'all' ? null : [filterStatus],
            onFilter: (value: any, record: Store) => record.status === value,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Store) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this store?"
                        onConfirm={() => onDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger icon={<DeleteOutlined />}>Delete</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Filter stores: loại bỏ pending, filter status, search theo name hoặc address_line
    const filteredStores = stores.filter(store =>
        store.status !== 'pending' &&
        (filterStatus === 'all' || store.status === filterStatus) &&
        (
            !searchValue ||
            store.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            (store.address_line && store.address_line.toLowerCase().includes(searchValue.toLowerCase()))
        )
    );

    return (
        <div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <Select
                    value={filterStatus}
                    onChange={handleStatusFilter}
                    style={{ width: 180 }}
                >
                    <Select.Option value="all">All Status</Select.Option>
                    <Select.Option value="active">Active</Select.Option>
                    <Select.Option value="inactive">Inactive</Select.Option>
                    <Select.Option value="rejected">Rejected</Select.Option>
                </Select>
                <Input
                    placeholder="Search by name or address"
                    prefix={<SearchOutlined />}
                    value={searchValue}
                    onChange={handleSearch}
                    allowClear
                    style={{ width: 260 }}
                />
            </div>
            <Table
                columns={columns}
                dataSource={filteredStores}
                rowKey="id"
                loading={loading}
            />
        </div>
    );
};

export default StoreList; 