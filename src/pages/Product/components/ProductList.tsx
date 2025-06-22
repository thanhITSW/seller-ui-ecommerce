import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Modal, Image, Space, Descriptions, Spin, message, Popconfirm, Dropdown, Menu, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined, StarFilled, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { ProductApi, ProductReview } from '../../../types/Product';
import productApi from '../../../api/productApi';
import ProductForm from '../../../components/Product/ProductForm';
import EditProductForm from '../../../components/Product/ProductForm/EditProductForm';
import AddProductFromCatalogForm from '../../../components/Product/ProductForm/AddProductFromCatalogForm';
import { Rate } from 'antd';
import styles from '../../../styles/Product/Product.module.scss';

const { TabPane } = Tabs;

const ProductList: React.FC = () => {
    const [approvedProducts, setApprovedProducts] = useState<ProductApi[]>([]);
    const [pendingProducts, setPendingProducts] = useState<ProductApi[]>([]);
    const [activeTab, setActiveTab] = useState<string>('approved');
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductApi | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [editFormVisible, setEditFormVisible] = useState(false);
    const [addFromCatalogVisible, setAddFromCatalogVisible] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [editProduct, setEditProduct] = useState<ProductApi | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewProductId, setReviewProductId] = useState<string | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Fetch both approved and pending products in parallel
            const [approvedResponse, pendingResponse] = await Promise.all([
                productApi.getProducts(),
                productApi.getPendingProducts()
            ]);

            if (approvedResponse.ok && approvedResponse.body?.code === 0) {
                setApprovedProducts(approvedResponse.body.data);
            } else {
                message.error('Failed to fetch approved products');
                setApprovedProducts([]);
            }

            if (pendingResponse.ok && pendingResponse.body?.code === 0) {
                setPendingProducts(pendingResponse.body.data);
            } else {
                message.error('Failed to fetch pending products');
                setPendingProducts([]);
            }
        } catch (error) {
            message.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAdd = () => {
        setEditProduct(null);
        setAddFromCatalogVisible(true);
    };

    const handleEdit = (product: ProductApi) => {
        setEditProduct(product);
        setEditFormVisible(true);
    };

    const handleDelete = async (id: string) => {
        setLoading(true);
        try {
            const response = await productApi.deleteProduct(id);
            if (response.ok && response.body?.code === 0) {
                message.success('Xóa sản phẩm thành công');
                fetchProducts();
            } else {
                message.error(response.body?.message || 'Xóa sản phẩm thất bại');
            }
        } catch (error) {
            message.error('Xóa sản phẩm thất bại');
        } finally {
            setLoading(false);
            setDeleteId(null);
        }
    };

    const handleFormSubmit = async (formData: FormData) => {
        setFormLoading(true);
        try {
            let response;
            if (editProduct) {
                response = await productApi.updateProduct(editProduct.id, formData);
            } else {
                response = await productApi.addProduct(formData);
            }
            if (response.ok && response.body?.code === 0) {
                message.success(editProduct ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công');
                setFormVisible(false);
                setEditFormVisible(false);
                setAddFromCatalogVisible(false);
                fetchProducts();
            } else {
                message.error(response.body?.message || 'Lưu sản phẩm thất bại');
            }
        } catch (error) {
            message.error('Lưu sản phẩm thất bại');
        } finally {
            setFormLoading(false);
        }
    };

    const handleViewReviews = async (productId: string) => {
        setReviewProductId(productId);
        setReviewModalVisible(true);
        setReviewLoading(true);
        try {
            const response = await productApi.getProductReviews(productId);
            if (response.ok && response.body?.code === 0) {
                setReviews(response.body.data);
            } else {
                setReviews([]);
                message.error(response.body?.message || 'Không thể tải đánh giá');
            }
        } catch (error) {
            setReviews([]);
            message.error('Không thể tải đánh giá');
        } finally {
            setReviewLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        setReviewLoading(true);
        try {
            const response = await productApi.deleteReviewByManager(reviewId);
            if (response.ok && response.body?.code === 0) {
                message.success('Xóa đánh giá thành công');
                // Refresh reviews
                if (reviewProductId) handleViewReviews(reviewProductId);
            } else {
                message.error(response.body?.message || 'Xóa đánh giá thất bại');
            }
        } catch (error) {
            message.error('Xóa đánh giá thất bại');
        } finally {
            setReviewLoading(false);
        }
    };

    const columns: ColumnsType<ProductApi> = [
        {
            title: 'Image',
            dataIndex: 'url_image',
            key: 'url_image',
            render: (url: string) => <Image src={url} alt="product" width={60} height={60} style={{ objectFit: 'cover', borderRadius: '4px' }} />,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
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
            render: (price: string) => <span style={{ fontWeight: 500, color: '#f5222d' }}>{Number(price).toLocaleString()}₫</span>,
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
            render: (stock: number) => <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>{stock}</Tag>,
        },
        {
            title: 'Active',
            dataIndex: 'active_status',
            key: 'active_status',
            render: (status: string) => <Tag color={status === 'active' ? 'green' : 'orange'}>{status}</Tag>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: ProductApi) => {
                const menu = (
                    <Menu>
                        <Menu.Item key="detail" icon={<EyeOutlined />} onClick={() => { setSelectedProduct(record); setDetailModalVisible(true); }}>
                            Xem chi tiết
                        </Menu.Item>
                        <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                            Sửa
                        </Menu.Item>
                        <Menu.Item key="review" icon={<StarFilled style={{ color: '#faad14' }} />} onClick={() => handleViewReviews(record.id)}>
                            Xem đánh giá
                        </Menu.Item>
                        <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)}>
                            Xóa
                        </Menu.Item>
                    </Menu>
                );
                return (
                    <Dropdown overlay={menu} trigger={["click"]}>
                        <Button icon={<MoreOutlined />} />
                    </Dropdown>
                );
            },
        },
    ];

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

    return (
        <div className={styles['product-list']}>
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
                    Thêm sản phẩm
                </Button>
            </div>

            <div className={styles['product-tabs-container']}>
                <Tabs
                    defaultActiveKey="approved"
                    onChange={(key) => setActiveTab(key)}
                    type="card"
                    size="large"
                >
                    <TabPane
                        tab={
                            <span>
                                <CheckCircleOutlined />
                                Sản phẩm đã duyệt
                                <Tag color="green" style={{ marginLeft: 8 }}>
                                    {approvedProducts.length}
                                </Tag>
                            </span>
                        }
                        key="approved"
                    >
                        <Spin spinning={loading && activeTab === 'approved'}>
                            <Table
                                columns={columns}
                                dataSource={approvedProducts}
                                rowKey="id"
                                pagination={{ pageSize: 10 }}
                                className={styles['product-table']}
                                style={{ marginTop: '16px' }}
                            />
                        </Spin>
                    </TabPane>
                    <TabPane
                        tab={
                            <span>
                                <ClockCircleOutlined />
                                Sản phẩm chờ duyệt
                                <Tag color="orange" style={{ marginLeft: 8 }}>
                                    {pendingProducts.length}
                                </Tag>
                            </span>
                        }
                        key="pending"
                    >
                        <Spin spinning={loading && activeTab === 'pending'}>
                            <Table
                                columns={columns}
                                dataSource={pendingProducts}
                                rowKey="id"
                                pagination={{ pageSize: 10 }}
                                className={styles['product-table']}
                                style={{ marginTop: '16px' }}
                            />
                        </Spin>
                    </TabPane>
                </Tabs>
            </div>

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
            <AddProductFromCatalogForm
                visible={addFromCatalogVisible}
                onCancel={() => setAddFromCatalogVisible(false)}
                onSubmit={handleFormSubmit}
                loading={formLoading}
            />
            {editProduct && (
                <EditProductForm
                    visible={editFormVisible}
                    onCancel={() => setEditFormVisible(false)}
                    onSubmit={(formData) => {
                        if (editProduct) {
                            handleFormSubmit(formData);
                        }
                    }}
                    initialValues={editProduct}
                    loading={formLoading}
                />
            )}
            <Modal
                title="Đánh giá sản phẩm"
                open={reviewModalVisible}
                onCancel={() => setReviewModalVisible(false)}
                footer={null}
                width={700}
            >
                <Spin spinning={reviewLoading}>
                    {reviews.length === 0 && !reviewLoading ? (
                        <div style={{ textAlign: 'center', color: '#888', padding: 32 }}>Không có đánh giá nào cho sản phẩm này.</div>
                    ) : (
                        <div>
                            {reviews.map((review) => (
                                <div key={review.id} style={{ borderBottom: '1px solid #f0f0f0', padding: 16, marginBottom: 8, background: '#fafafa', borderRadius: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                        <b style={{ marginRight: 8 }}>{review.user_fullname}</b>
                                        <Rate disabled value={review.rating} allowHalf style={{ color: '#faad14', fontSize: 18, marginRight: 8 }} />
                                        <span style={{ fontSize: 12, color: '#888', marginLeft: 'auto' }}>{new Date(review.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div style={{ margin: '8px 0', fontSize: 15 }}>{review.comment}</div>
                                    <Button danger size="small" onClick={() => handleDeleteReview(review.id)}>
                                        Xóa đánh giá
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </Spin>
            </Modal>
        </div>
    );
};

export default ProductList; 