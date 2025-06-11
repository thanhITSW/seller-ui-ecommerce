import React, { useState, useEffect } from 'react';
import { Button, message, Tabs, Drawer } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import StoreList from '../../components/Store/StoreList';
import StoreForm from '../../components/Store/StoreForm';
import StoreApproveList from '../../components/Store/StoreApproveList';
import { Store, StoreStatus } from '../../types/Store';
import storeApi from '../../api/storeApi';
import '@/styles/Store/Store/Store.scss';

const StorePage: React.FC = () => {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [filterStatus, setFilterStatus] = useState<StoreStatus | 'all'>('all');
    const [search, setSearch] = useState('');
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [detailStore, setDetailStore] = useState<Store | null>(null);

    const fetchStores = async () => {
        try {
            setLoading(true);
            const response = await storeApi.getAll();
            if (response.ok && response.body?.code === 0) {
                setStores(response.body.data.stores);
            } else {
                message.error(response.body?.message || 'Failed to fetch stores');
            }
        } catch (error) {
            message.error('Failed to fetch stores');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    // Store CRUD handlers
    const handleAddStore = () => {
        setSelectedStore(null);
        setFormVisible(true);
    };

    const handleEditStore = (store: Store) => {
        setSelectedStore(store);
        setFormVisible(true);
    };

    const handleDeleteStore = async (id: string) => {
        try {
            setLoading(true);
            const response = await storeApi.delete(id);
            if (response.ok && response.body?.code === 0) {
                message.success('Store deleted successfully');
                fetchStores();
            } else {
                message.error(response.body?.message || 'Failed to delete store');
            }
        } catch (error) {
            message.error('Failed to delete store');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitStore = async (values: Partial<Store>) => {
        try {
            setLoading(true);
            let response;
            if (selectedStore) {
                response = await storeApi.update(selectedStore.id, values);
            } else {
                // Nếu có API tạo store thì thêm ở đây
                message.info('Add store API not implemented');
                setFormVisible(false);
                return;
            }
            if (response.ok && response.body.code === 0) {
                message.success(selectedStore ? 'Store updated successfully' : 'Store added successfully');
                setFormVisible(false);
                fetchStores();
            } else {
                message.error(response.body?.message || 'Failed to save store');
            }
        } catch (error) {
            message.error('Failed to save store');
        } finally {
            setLoading(false);
        }
    };

    // Approve handlers
    const handleApprove = async (id: string) => {
        try {
            setLoading(true);
            const response = await storeApi.updateStatus(id, 'active');
            if (response.ok && response.body.code === 0) {
                message.success('Store approved');
                fetchStores();
            } else {
                message.error(response.body?.message || 'Failed to approve store');
            }
        } catch (error) {
            message.error('Failed to approve store');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (id: string) => {
        try {
            setLoading(true);
            const response = await storeApi.updateStatus(id, 'rejected');
            if (response.ok && response.body.code === 0) {
                message.success('Store rejected');
                fetchStores();
            } else {
                message.error(response.body?.message || 'Failed to reject store');
            }
        } catch (error) {
            message.error('Failed to reject store');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (store: Store) => {
        setDetailStore(store);
        setDrawerVisible(true);
    };

    // Filter & search handler
    const handleFilterChange = (filter: { status: StoreStatus | 'all'; search: string }) => {
        setFilterStatus(filter.status);
        setSearch(filter.search);
    };

    return (
        <div className="store-page">
            <div className="header">
                <h1>Store Management</h1>
                {/* <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddStore}
                    disabled
                >
                    Add Store
                </Button> */}
            </div>
            <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="Store List" key="1">
                    <StoreList
                        stores={stores}
                        onEdit={handleEditStore}
                        onDelete={handleDeleteStore}
                        loading={loading}
                        onFilterChange={handleFilterChange}
                        filterStatus={filterStatus}
                        search={search}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Approve Stores" key="2">
                    <StoreApproveList
                        stores={stores}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onViewDetail={handleViewDetail}
                        loading={loading}
                    />
                </Tabs.TabPane>
            </Tabs>
            <StoreForm
                visible={formVisible}
                onCancel={() => setFormVisible(false)}
                onSubmit={handleSubmitStore}
                initialValues={selectedStore || undefined}
                loading={loading}
            />
            <Drawer
                title="Store Detail"
                open={drawerVisible}
                onClose={() => setDrawerVisible(false)}
                width={400}
            >
                {detailStore && (
                    <div>
                        <p><b>Name:</b> {detailStore.name}</p>
                        <p><b>Email:</b> {detailStore.email}</p>
                        <p><b>Phone:</b> {detailStore.phone}</p>
                        <p><b>Description:</b> {detailStore.description}</p>
                        <p><b>Status:</b> {detailStore.status}</p>
                        <p><b>Address:</b> {detailStore.address_detail}</p>
                        <img src={detailStore.avatar_url} alt="avatar" style={{ width: 80, borderRadius: 8, marginBottom: 8 }} />
                        <img src={detailStore.banner_url} alt="banner" style={{ width: '100%', borderRadius: 8 }} />
                        <div style={{ marginTop: 8 }}>
                            <a href={detailStore.license_url} target="_blank" rel="noopener noreferrer">View License</a>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default StorePage; 