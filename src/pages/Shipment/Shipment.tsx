import React, { useState, useRef } from 'react';
import { Button, Tabs, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import styles from './styles/Shipment.module.scss';
import { useTheme } from '../../contexts/ThemeContext';
import ShipmentList from './components/ShipmentList';
import ShippingAddressList from './components/ShippingAddressList';
import ShippingProviderList from './components/ShippingProviderList';
import ShippingProviderForm from './components/ShippingProviderForm';
import shipmentApi from '../../api/shipmentApi';
import { ShippingProvider } from '../../types/Shipment';

const ShipmentPage: React.FC = () => {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [providerFormVisible, setProviderFormVisible] = useState(false);
    const [editingProvider, setEditingProvider] = useState<ShippingProvider | null>(null);
    const providerListRef = useRef<any>();

    const handleAddProvider = () => {
        setEditingProvider(null);
        setProviderFormVisible(true);
    };

    const handleEditProvider = (provider: ShippingProvider) => {
        setEditingProvider(provider);
        setProviderFormVisible(true);
    };

    const handleSubmitProvider = async (values: Omit<ShippingProvider, 'id' | 'createdAt' | 'updatedAt'>) => {
        setLoading(true);
        try {
            let res;
            if (editingProvider) {
                res = await shipmentApi.updateShippingProvider(editingProvider.id, values);
            } else {
                res = await shipmentApi.createShippingProvider(values);
            }
            if (res.ok && res.body?.code === 0) {
                message.success(editingProvider ? 'Cập nhật thành công' : 'Thêm thành công');
                setProviderFormVisible(false);
                setEditingProvider(null);
                providerListRef.current?.fetchData();
            } else {
                message.error(res.body?.message || 'Lỗi');
            }
        } catch (e) {
            message.error('Lỗi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles['shipment-page']} data-theme={theme}>
            <div className={styles.header}>
                <h1>Quản lí vận chuyển</h1>
            </div>
            <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="Quản lí đơn hàng vận chuyển" key="1">
                    <ShipmentList loading={loading} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Quản lí địa chỉ giao hàng" key="2">
                    <ShippingAddressList loading={loading} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Quản lí đơn vị vận chuyển" key="3">
                    <div className={styles['tab-header']}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAddProvider}
                        >
                            Thêm đơn vị vận chuyển
                        </Button>
                    </div>
                    <ShippingProviderList
                        loading={loading}
                        onAdd={handleAddProvider}
                        onEdit={handleEditProvider}
                        ref={providerListRef}
                    />
                </Tabs.TabPane>
            </Tabs>
            <ShippingProviderForm
                visible={providerFormVisible}
                onCancel={() => setProviderFormVisible(false)}
                onSubmit={handleSubmitProvider}
                initialValues={editingProvider || undefined}
                loading={loading}
            />
        </div>
    );
};

export default ShipmentPage; 