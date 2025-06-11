import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Modal, Image, Space, Descriptions, Spin, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { ProductApi } from '../../../types/Product';
import productApi from '../../../api/productApi';

const ProductApprovalList: React.FC = () => {
    const [products, setProducts] = useState<ProductApi[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductApi | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await productApi.getPendingProducts();
            if (!response.body) return;
            if (response.ok && response.body.code === 0) {
                setProducts(response.body.data);
            } else {
                message.error('Không thể tải danh sách sản phẩm chờ duyệt');
            }
        } catch (error) {
            message.error('Không thể tải danh sách sản phẩm chờ duyệt');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleApproval = async (id: string, status: 'approved' | 'rejected') => {
        setLoading(true);
        try {
            const response = await productApi.approvalProduct(id, status);
            if (response.ok && response.body?.code === 0) {
                message.success(status === 'approved' ? 'Đã duyệt sản phẩm' : 'Đã từ chối sản phẩm');
                fetchProducts();
            } else {
                message.error(response.body?.message || 'Không thể cập nhật trạng thái sản phẩm');
            }
        } catch (error) {
            message.error('Không thể cập nhật trạng thái sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    // Helper to render product_details nicely
    const renderProductDetails = (details: Record<string, any>) => {
        if (!details) return null;
        return (
            <Descriptions bordered column={1} size="small">
                {Object.entries(details).map(([key, value]) => {
                    if (Array.isArray(value)) {
                        // Render array of objects (e.g. Thành phần)
                        if (value.length > 0 && typeof value[0] === 'object') {
                            return (
                                <Descriptions.Item label={key} key={key}>
                                    <Table
                                        dataSource={value.map((v, i) => ({ ...v, key: i }))}
                                        columns={Object.keys(value[0]).map(col => ({ title: col, dataIndex: col, key: col }))}
                                        pagination={false}
                                        size="small"
                                    />
                                </Descriptions.Item>
                            );
                        } else {
                            // Render array of strings
                            return (
                                <Descriptions.Item label={key} key={key}>
                                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                                        {value.map((v, i) => <li key={i}>{v}</li>)}
                                    </ul>
                                </Descriptions.Item>
                            );
                        }
                    } else if (typeof value === 'string') {
                        // Render long text as pre if it contains newlines
                        if (value.includes('\n')) {
                            return (
                                <Descriptions.Item label={key} key={key}>
                                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#f6f6f6', padding: 8, borderRadius: 4 }}>{value}</pre>
                                </Descriptions.Item>
                            );
                        }
                        return <Descriptions.Item label={key} key={key}>{value}</Descriptions.Item>;
                    } else {
                        // Render other types as string
                        return <Descriptions.Item label={key} key={key}>{String(value)}</Descriptions.Item>;
                    }
                })}
            </Descriptions>
        );
    };

    const columns: ColumnsType<ProductApi> = [
        {
            title: 'Image',
            dataIndex: 'url_image',
            key: 'url_image',
            render: (url: string) => <Image src={url} alt="product" width={60} height={60} />,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Brand',
            dataIndex: 'brand',
            key: 'brand',
        },
        {
            title: 'Retail Price',
            dataIndex: 'retail_price',
            key: 'retail_price',
            render: (price: string) => `${Number(price).toLocaleString()}₫`,
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
        },
        {
            title: 'Seller',
            dataIndex: 'seller_name',
            key: 'seller_name',
        },
        {
            title: 'Approval Status',
            dataIndex: 'approval_status',
            key: 'approval_status',
            render: (status: string) => (
                <Tag color={
                    status === 'approved' ? 'green' :
                        status === 'rejected' ? 'red' :
                            'orange'
                }>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: ProductApi) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => { setSelectedProduct(record); setDetailModalVisible(true); }}
                    >
                        Chi tiết
                    </Button>
                    <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => handleApproval(record.id, 'approved')}
                    >
                        Duyệt
                    </Button>
                    <Button
                        danger
                        icon={<CloseOutlined />}
                        onClick={() => handleApproval(record.id, 'rejected')}
                    >
                        Từ chối
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="product-approval-list">
            <h2>Danh sách sản phẩm chờ duyệt</h2>
            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={products}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </Spin>
            <Modal
                title={selectedProduct?.name}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={800}
            >
                {selectedProduct && (
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Image">
                            <Image src={selectedProduct.url_image} alt="product" width={120} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Brand">{selectedProduct.brand}</Descriptions.Item>
                        <Descriptions.Item label="Import Price">{Number(selectedProduct.import_price).toLocaleString()}₫</Descriptions.Item>
                        <Descriptions.Item label="Retail Price">{Number(selectedProduct.retail_price).toLocaleString()}₫</Descriptions.Item>
                        <Descriptions.Item label="Stock">{selectedProduct.stock}</Descriptions.Item>
                        <Descriptions.Item label="Seller">{selectedProduct.seller_name}</Descriptions.Item>
                        <Descriptions.Item label="Approval Status">{selectedProduct.approval_status}</Descriptions.Item>
                        <Descriptions.Item label="Active Status">{selectedProduct.active_status}</Descriptions.Item>
                        <Descriptions.Item label="Return Policy">
                            {selectedProduct.return_policy && (
                                <div>
                                    <div>Đổi trả: {selectedProduct.return_policy.is_returnable ? 'Có' : 'Không'}</div>
                                    <div>Thời gian đổi trả: {selectedProduct.return_policy.return_period} ngày</div>
                                    <div>Đổi hàng: {selectedProduct.return_policy.is_exchangeable ? 'Có' : 'Không'}</div>
                                    <div>Điều kiện: {selectedProduct.return_policy.return_conditions}</div>
                                </div>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Product Details">{renderProductDetails(selectedProduct.product_details)}</Descriptions.Item>
                        <Descriptions.Item label="Registration License">
                            <a href={selectedProduct.url_registration_license} target="_blank" rel="noopener noreferrer">Xem giấy phép</a>
                        </Descriptions.Item>
                        <Descriptions.Item label="Created At">{selectedProduct.createdAt}</Descriptions.Item>
                        <Descriptions.Item label="Updated At">{selectedProduct.updatedAt}</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default ProductApprovalList; 