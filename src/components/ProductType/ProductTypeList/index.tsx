import React from 'react';
import { Table, Button, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ProductType } from '../../../types/ProductType';
import './styles.scss';

interface ProductTypeListProps {
    productTypes: ProductType[];
    onEdit: (productType: ProductType) => void;
    onDelete: (id: string) => void;
    loading: boolean;
}

const ProductTypeList: React.FC<ProductTypeListProps> = ({
    productTypes,
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
            title: 'Product Type Name',
            dataIndex: 'product_type_name',
            key: 'product_type_name',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: ProductType) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(record)}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this product type?"
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
            dataSource={productTypes}
            rowKey="id"
            loading={loading}
        />
    );
};

export default ProductTypeList; 