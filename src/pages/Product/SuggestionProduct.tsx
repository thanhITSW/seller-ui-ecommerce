import React, { useEffect, useState } from 'react';
import { Table, Input, Spin, message, Card, Typography, Button, Modal, Popconfirm, Tabs, Tag } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import suggestionProductApi from '../../api/suggestionProductApi';
import ProductForm from '../../components/Product/ProductForm';
import { ProductApi } from '../../types/Product';
import styles from './SuggestionProduct.module.scss';
import StatusTabs from '../../components/Common/StatusTabs';
import productApi from '../../api/productApi';
import { ProductType, Category } from '../../types/ProductType';

const { Title } = Typography;
const { TabPane } = Tabs;

const TABS = [
    { key: 'pending', label: 'Chờ duyệt' },
    { key: 'approved', label: 'Đã duyệt' },
    { key: 'rejected', label: 'Từ chối' },
];

const SuggestionProductPage: React.FC = () => {
    const [products, setProducts] = useState<ProductApi[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductApi | undefined>(undefined);
    const [formLoading, setFormLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingProducts, setPendingProducts] = useState<ProductApi[]>([]);
    const [approvedProducts, setApprovedProducts] = useState<ProductApi[]>([]);
    const [rejectedProducts, setRejectedProducts] = useState<ProductApi[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [approvedCount, setApprovedCount] = useState(0);
    const [rejectedCount, setRejectedCount] = useState(0);
    const [productTypes, setProductTypes] = useState<ProductType[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const fetchAllProducts = async () => {
        setLoading(true);
        try {
            const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
                suggestionProductApi.getSuggestionProducts('pending'),
                suggestionProductApi.getSuggestionProducts('approved'),
                suggestionProductApi.getSuggestionProducts('rejected'),
            ]);
            if (pendingRes.ok && pendingRes.body?.data) {
                setPendingProducts(pendingRes.body.data);
                setPendingCount(pendingRes.body.data.length);
            } else {
                setPendingProducts([]);
                setPendingCount(0);
            }
            if (approvedRes.ok && approvedRes.body?.data) {
                setApprovedProducts(approvedRes.body.data);
                setApprovedCount(approvedRes.body.data.length);
            } else {
                setApprovedProducts([]);
                setApprovedCount(0);
            }
            if (rejectedRes.ok && rejectedRes.body?.data) {
                setRejectedProducts(rejectedRes.body.data);
                setRejectedCount(rejectedRes.body.data.length);
            } else {
                setRejectedProducts([]);
                setRejectedCount(0);
            }
        } catch (error) {
            setPendingProducts([]);
            setApprovedProducts([]);
            setRejectedProducts([]);
            setPendingCount(0);
            setApprovedCount(0);
            setRejectedCount(0);
            message.error('Không thể tải danh sách sản phẩm đề xuất');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllProducts();
        productApi.getProductTypes().then(res => {
            if (res.ok && res.body?.data) setProductTypes(res.body.data);
        });
        productApi.getProductTypes().then(res => {
            if (res.ok && res.body?.data) {
                const typeIds = res.body.data.map(pt => pt.id);
                Promise.all(typeIds.map(id => productApi.getCategoriesByType(id))).then(results => {
                    const allCats = results.flatMap(r => (r.ok && r.body?.data) ? r.body.data : []);
                    setCategories(allCats);
                });
            }
        });
    }, []);

    const handleAdd = () => {
        setEditingProduct(undefined);
        setModalVisible(true);
    };

    const handleEdit = (record: ProductApi) => {
        setEditingProduct(record);
        setModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        setLoading(true);
        try {
            const res = await suggestionProductApi.deleteSuggestionProduct(id);
            if (res.ok && res.body?.code === 0) {
                message.success('Xóa sản phẩm đề xuất thành công');
                fetchAllProducts();
            } else {
                message.error(res.body?.message || 'Xóa sản phẩm đề xuất thất bại');
            }
        } catch (error) {
            message.error('Xóa sản phẩm đề xuất thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        setFormLoading(true);
        try {
            const sellerId = localStorage.getItem('store_id');
            const sellerName = JSON.parse(localStorage.getItem('store') || '{}').name;
            if (sellerId) formData.set('seller_id', sellerId);
            if (sellerName) formData.set('seller_name', sellerName);
            let res;
            if (editingProduct) {
                res = await suggestionProductApi.updateSuggestionProduct(editingProduct.id, formData);
            } else {
                res = await suggestionProductApi.addSuggestionProduct(formData);
            }
            if (res.ok && res.body?.code === 0) {
                message.success(editingProduct ? 'Cập nhật thành công' : 'Thêm thành công');
                setModalVisible(false);
                fetchAllProducts();
            } else {
                message.error(res.body?.message || 'Lỗi thao tác');
            }
        } catch (error) {
            message.error('Lỗi thao tác');
        } finally {
            setFormLoading(false);
        }
    };

    const getProductTypeName = (id: string) => productTypes.find(pt => pt.id === id)?.product_type_name || id;
    const getCategoryName = (id: string) => categories.find(cat => cat.id === id)?.category_name || id;

    const columns: ColumnsType<ProductApi> = [
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            filteredValue: [searchText],
            onFilter: (value, record) => {
                return record.name.toLowerCase().includes(value.toString().toLowerCase());
            },
        },
        {
            title: 'Thương hiệu',
            dataIndex: 'brand',
            key: 'brand',
        },
        {
            title: 'Loại',
            dataIndex: 'product_type_id',
            key: 'product_type_id',
            render: (id: string) => getProductTypeName(id),
        },
        {
            title: 'Danh mục',
            dataIndex: 'category_id',
            key: 'category_id',
            render: (id: string) => getCategoryName(id),
        },
        {
            title: 'Người đề xuất',
            dataIndex: 'seller_name',
            key: 'seller_name',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <>
                    {activeTab === 'pending' && (
                        <>
                            <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ marginRight: 8 }} />
                            <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(record.id)}>
                                <Button icon={<DeleteOutlined />} danger />
                            </Popconfirm>
                        </>
                    )}
                </>
            ),
        },
    ];

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    const statusTabs = [
        {
            key: 'pending',
            label: 'Chờ duyệt',
            count: pendingCount,
            content: (
                <Spin spinning={loading && activeTab === 'pending'}>
                    <Table
                        columns={columns}
                        dataSource={pendingProducts}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`,
                            className: styles.suggestionPagination
                        }}
                        className={styles.suggestionTable}
                    />
                </Spin>
            )
        },
        {
            key: 'approved',
            label: 'Đã duyệt',
            count: approvedCount,
            content: (
                <Spin spinning={loading && activeTab === 'approved'}>
                    <Table
                        columns={columns}
                        dataSource={approvedProducts}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`,
                            className: styles.suggestionPagination
                        }}
                        className={styles.suggestionTable}
                    />
                </Spin>
            )
        },
        {
            key: 'rejected',
            label: 'Từ chối',
            count: rejectedCount,
            content: (
                <Spin spinning={loading && activeTab === 'rejected'}>
                    <Table
                        columns={columns}
                        dataSource={rejectedProducts}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`,
                            className: styles.suggestionPagination
                        }}
                        className={styles.suggestionTable}
                    />
                </Spin>
            )
        }
    ];

    return (
        <div className={styles.suggestionPage}>
            <Card className={styles.suggestionCard}>
                <div className={styles.suggestionHeader}>
                    <div className={styles.suggestionTitle}>
                        <Title level={2}>Quản lý sản phẩm đề xuất</Title>
                        <p className={styles.subtitle}>Danh sách các sản phẩm đề xuất mới</p>
                    </div>
                    <div className={styles.suggestionSearch}>
                        <Input
                            placeholder="Tìm kiếm sản phẩm..."
                            prefix={<SearchOutlined />}
                            onChange={handleSearch}
                            allowClear
                            className={styles.searchInput}
                        />
                        <Button type="primary" icon={<PlusOutlined />} style={{ marginLeft: 16 }} onClick={handleAdd}>
                            Thêm sản phẩm đề xuất
                        </Button>
                    </div>
                </div>
                <StatusTabs
                    tabs={statusTabs}
                    activeKey={activeTab}
                    onChange={setActiveTab}
                />
            </Card>
            <ProductForm
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                onSubmit={handleSubmit}
                initialValues={editingProduct}
                loading={formLoading}
                hideSellerFields
            />
        </div>
    );
};

export default SuggestionProductPage; 