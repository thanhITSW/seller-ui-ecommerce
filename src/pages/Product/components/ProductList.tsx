import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Image, Space, Descriptions, Spin, Popconfirm, Dropdown, Menu, Tag, notification } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined, StarFilled } from '@ant-design/icons';
import { ProductApi, ProductReview } from '../../../types/Product';
import productApi from '../../../api/productApi';
import ProductForm from '../../../components/Product/ProductForm';
import EditProductForm from '../../../components/Product/ProductForm/EditProductForm';
import AddProductFromCatalogForm from '../../../components/Product/ProductForm/AddProductFromCatalogForm';
import { Rate } from 'antd';
import styles from '../../../styles/Product/Product.module.scss';
import StatusTabs from '../../../components/Common/StatusTabs';

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
            const [approvedResponse, pendingResponse] = await Promise.all([
                productApi.getProducts(),
                productApi.getPendingProducts()
            ]);

            if (approvedResponse.ok && approvedResponse.body?.code === 0) {
                setApprovedProducts(approvedResponse.body.data);
            } else {
                notification.error({ message: 'Lấy danh sách sản phẩm đã duyệt thất bại' });
                setApprovedProducts([]);
            }

            if (pendingResponse.ok && pendingResponse.body?.code === 0) {
                setPendingProducts(pendingResponse.body.data);
            } else {
                notification.error({ message: 'Lấy danh sách sản phẩm chờ duyệt thất bại' });
                setPendingProducts([]);
            }
        } catch (error) {
            notification.error({ message: 'Lấy danh sách sản phẩm thất bại' });
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
                notification.success({ message: 'Xóa sản phẩm thành công' });
                fetchProducts();
            } else {
                notification.error({ message: response.body?.message || 'Xóa sản phẩm thất bại' });
            }
        } catch (error) {
            notification.error({ message: 'Xóa sản phẩm thất bại' });
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
                notification.success({ message: editProduct ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công' });
                setFormVisible(false);
                setEditFormVisible(false);
                setAddFromCatalogVisible(false);
                fetchProducts();
            } else {
                notification.error({ message: response.body?.message || 'Lưu sản phẩm thất bại' });
            }
        } catch (error) {
            notification.error({ message: 'Lưu sản phẩm thất bại' });
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
                notification.error({ message: response.body?.message || 'Không thể tải đánh giá' });
            }
        } catch (error) {
            setReviews([]);
            notification.error({ message: 'Không thể tải đánh giá' });
        } finally {
            setReviewLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        setReviewLoading(true);
        try {
            const response = await productApi.deleteReviewByManager(reviewId);
            if (response.ok && response.body?.code === 0) {
                notification.success({ message: 'Xóa đánh giá thành công' });
                if (reviewProductId) handleViewReviews(reviewProductId);
            } else {
                notification.error({ message: response.body?.message || 'Xóa đánh giá thất bại' });
            }
        } catch (error) {
            notification.error({ message: 'Xóa đánh giá thất bại' });
        } finally {
            setReviewLoading(false);
        }
    };

    const columns: ColumnsType<ProductApi> = [
        {
            title: 'Hình ảnh',
            dataIndex: 'url_image',
            key: 'url_image',
            render: (url: string) => <Image src={url} alt="product" width={60} height={60} style={{ objectFit: 'cover', borderRadius: '4px' }} />,
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
        },
        {
            title: 'Thương hiệu',
            dataIndex: 'brand',
            key: 'brand',
        },
        {
            title: 'Giá bán lẻ',
            dataIndex: 'retail_price',
            key: 'retail_price',
            render: (price: string) => <span style={{ fontWeight: 500, color: '#f5222d' }}>{Number(price).toLocaleString()}₫</span>,
        },
        {
            title: 'Tồn kho',
            dataIndex: 'stock',
            key: 'stock',
            render: (stock: number) => <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>{stock}</Tag>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active_status',
            key: 'active_status',
            render: (status: string) => <Tag color={status === 'active' ? 'green' : 'orange'}>{status === 'active' ? 'Hoạt động' : 'Không hoạt động'}</Tag>,
        },
        {
            title: 'Hành động',
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
                            return (
                                <Descriptions.Item label={key} key={key}>
                                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                                        {value.map((v, i) => <li key={i}>{v}</li>)}
                                    </ul>
                                </Descriptions.Item>
                            );
                        }
                    } else if (typeof value === 'string') {
                        if (value.includes('\n')) {
                            return (
                                <Descriptions.Item label={key} key={key}>
                                    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#f6f6f6', padding: 8, borderRadius: 4 }}>{value}</pre>
                                </Descriptions.Item>
                            );
                        }
                        return <Descriptions.Item label={key} key={key}>{value}</Descriptions.Item>;
                    } else {
                        return <Descriptions.Item label={key} key={key}>{String(value)}</Descriptions.Item>;
                    }
                })}
            </Descriptions>
        );
    };

    const statusTabs = [
        {
            key: 'approved',
            label: 'Sản phẩm đã duyệt',
            count: approvedProducts.length,
            content: (
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
            )
        },
        {
            key: 'pending',
            label: 'Sản phẩm chờ duyệt',
            count: pendingProducts.length,
            content: (
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
            )
        }
    ];

    return (
        <div className={styles['product-list']}>
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
                    Thêm sản phẩm
                </Button>
            </div>

            <div className={styles['product-tabs-container']}>
                <StatusTabs
                    tabs={statusTabs}
                    activeKey={activeTab}
                    onChange={setActiveTab}
                />
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
                        <Descriptions.Item label="Hình ảnh">
                            <Image src={selectedProduct.url_image} alt="product" width={120} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Thương hiệu">{selectedProduct.brand}</Descriptions.Item>
                        <Descriptions.Item label="Giá nhập">{Number(selectedProduct.import_price).toLocaleString()}₫</Descriptions.Item>
                        <Descriptions.Item label="Giá bán lẻ">{Number(selectedProduct.retail_price).toLocaleString()}₫</Descriptions.Item>
                        <Descriptions.Item label="Tồn kho">{selectedProduct.stock}</Descriptions.Item>
                        <Descriptions.Item label="Người bán">{selectedProduct.seller_name}</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái duyệt">{selectedProduct.approval_status === 'approved' ? 'Đã duyệt' : selectedProduct.approval_status === 'pending' ? 'Chờ duyệt' : 'Bị từ chối'}</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái hoạt động">{selectedProduct.active_status === 'active' ? 'Hoạt động' : 'Không hoạt động'}</Descriptions.Item>
                        <Descriptions.Item label="Chính sách đổi trả">
                            {selectedProduct.return_policy && (
                                <div>
                                    <div>Đổi trả: {selectedProduct.return_policy.is_returnable ? 'Có' : 'Không'}</div>
                                    <div>Thời gian đổi trả: {selectedProduct.return_policy.return_period} ngày</div>
                                    <div>Đổi hàng: {selectedProduct.return_policy.is_exchangeable ? 'Có' : 'Không'}</div>
                                    <div>Điều kiện: {selectedProduct.return_policy.return_conditions}</div>
                                </div>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chi tiết sản phẩm">{renderProductDetails(selectedProduct.product_details)}</Descriptions.Item>
                        <Descriptions.Item label="Giấy phép đăng ký">
                            <a href={selectedProduct.url_registration_license} target="_blank" rel="noopener noreferrer">Xem giấy phép</a>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">{selectedProduct.createdAt}</Descriptions.Item>
                        <Descriptions.Item label="Ngày cập nhật">{selectedProduct.updatedAt}</Descriptions.Item>
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
                                    <Button danger size="small" style={{ float: 'right' }} onClick={() => handleDeleteReview(review.id)}>
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