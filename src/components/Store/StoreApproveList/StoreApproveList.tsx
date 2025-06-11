import React from 'react';
import { Table, Button, Space, Tag, Avatar } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import { Store } from '../../../types/Store';

interface StoreApproveListProps {
    stores: Store[];
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onViewDetail: (store: Store) => void;
    loading: boolean;
}

const StoreApproveList: React.FC<StoreApproveListProps> = ({
    stores,
    onApprove,
    onReject,
    onViewDetail,
    loading,
}) => {
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
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Store) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => onViewDetail(record)}
                    >
                        View
                    </Button>
                    <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => onApprove(record.id)}
                    >
                        Approve
                    </Button>
                    <Button
                        danger
                        icon={<CloseOutlined />}
                        onClick={() => onReject(record.id)}
                    >
                        Reject
                    </Button>
                </Space>
            ),
        },
    ];

    const pendingStores = stores.filter(store => store.status === 'pending');

    return (
        <Table
            columns={columns}
            dataSource={pendingStores}
            rowKey="id"
            loading={loading}
        />
    );
};

export default StoreApproveList; 