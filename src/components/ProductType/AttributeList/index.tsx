import React from 'react';
import { Table, Button, Space, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Attribute } from '../../../../types/ProductType';
import './styles.scss';

interface AttributeListProps {
    attributes: Attribute[];
    onEdit: (attribute: Attribute) => void;
    onDelete: (id: string) => void;
    loading: boolean;
}

const AttributeList: React.FC<AttributeListProps> = ({
    attributes,
    onEdit,
    onDelete,
    loading
}) => {
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Attribute Name',
            dataIndex: 'attribute_name',
            key: 'attribute_name',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Attribute) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this attribute?"
                        onConfirm={() => onDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={attributes}
            rowKey="id"
            loading={loading}
        />
    );
};

export default AttributeList; 