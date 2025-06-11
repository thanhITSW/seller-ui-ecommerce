import React, { useState, useRef } from 'react';
import { Button, Tabs, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PaymentHistoryList from './components/PaymentHistoryList';
import PaymentMethodList from './components/PaymentMethodList';
import PaymentMethodForm from './components/PaymentMethodForm';
import styles from './styles/Payment.module.scss';
import { useTheme } from '../../contexts/ThemeContext';
import paymentApi from '../../api/paymentApi';
import { PaymentMethod } from '../../types/Payment';

const PaymentPage: React.FC = () => {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [historyFilterVisible, setHistoryFilterVisible] = useState(false);
    const [methodFormVisible, setMethodFormVisible] = useState(false);
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
    const methodListRef = useRef<any>();

    const handleAdd = () => {
        setEditingMethod(null);
        setMethodFormVisible(true);
    };

    const handleEdit = (method: PaymentMethod) => {
        setEditingMethod(method);
        setMethodFormVisible(true);
    };

    const handleSubmit = async (values: Partial<PaymentMethod>) => {
        setLoading(true);
        try {
            let res;
            if (editingMethod) {
                res = await paymentApi.updatePaymentMethod(editingMethod.id, values);
            } else {
                res = await paymentApi.createPaymentMethod(values);
            }
            if (res.ok && res.body?.code === 0) {
                message.success(editingMethod ? 'Cập nhật thành công' : 'Thêm thành công');
                setMethodFormVisible(false);
                setEditingMethod(null);
                methodListRef.current?.fetchData();
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
        <div className={styles['payment-page']} data-theme={theme}>
            <div className={styles.header}>
                <h1>Quản lí thanh toán</h1>
            </div>
            <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="Quản lí giao dịch" key="1">
                    <PaymentHistoryList
                        loading={loading}
                        onShowFilter={() => setHistoryFilterVisible(true)}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Quản lí phương thức thanh toán" key="2">
                    <div className={styles['tab-header']}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                        >
                            Thêm phương thức
                        </Button>
                    </div>
                    <PaymentMethodList
                        loading={loading}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        ref={methodListRef}
                    />
                </Tabs.TabPane>
            </Tabs>
            <PaymentMethodForm
                visible={methodFormVisible}
                onCancel={() => setMethodFormVisible(false)}
                onSubmit={handleSubmit}
                initialValues={editingMethod || undefined}
                loading={loading}
            />
        </div>
    );
};

export default PaymentPage; 