import React, { useEffect, useState } from 'react';
import { Tabs, Card, message, Modal } from 'antd';
import WithdrawRequestList from './components/WithdrawRequestList';
import WithdrawRequestForm from './components/WithdrawRequestForm';
import StorePaymentInfoList from './components/StorePaymentInfoList';
import StorePaymentInfoForm from './components/StorePaymentInfoForm';
import styles from './styles/WithdrawRequest.module.scss';
import storeApi from '../../api/storeApi';
import withdrawRequestApi from '../../api/withdrawRequestApi';
import { StorePaymentInfo } from '../../types/WithdrawRequest';

const WithdrawRequestPage: React.FC = () => {
    const [formVisible, setFormVisible] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [listKey, setListKey] = useState(0); // for reload
    const [balance, setBalance] = useState<number>(0);

    // Tab 2 state
    const [infoFormVisible, setInfoFormVisible] = useState(false);
    const [infoFormEdit, setInfoFormEdit] = useState<StorePaymentInfo | null>(null);
    const [infoListKey, setInfoListKey] = useState(0);

    const STORE_ID = localStorage.getItem('store_id') || '';

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const res = await storeApi.getById(STORE_ID);
                if (res.ok && res.body?.code === 0) {
                    setBalance(res.body.data.balance);
                } else {
                    setBalance(0);
                }
            } catch {
                setBalance(0);
            }
        };
        fetchBalance();
    }, [listKey]);

    const handleCreate = async () => {
        try {
            const res = await withdrawRequestApi.getStorePaymentInfos();
            if (res.ok && res.body?.code === 0) {
                setPaymentMethods(res.body.data);
                setFormVisible(true);
            } else {
                message.error(res.body?.message || 'Không lấy được phương thức nhận tiền');
            }
        } catch (e) {
            message.error('Không lấy được phương thức nhận tiền');
        }
    };

    const handleFormSuccess = () => {
        setFormVisible(false);
        setListKey(k => k + 1);
    };

    // Tab 2 handlers
    const handleAddInfo = () => {
        setInfoFormEdit(null);
        setInfoFormVisible(true);
    };
    const handleEditInfo = (info: StorePaymentInfo) => {
        setInfoFormEdit(info);
        setInfoFormVisible(true);
    };
    const handleDeleteInfo = (id: string) => {
        Modal.confirm({
            title: 'Xác nhận xóa phương thức?',
            content: 'Bạn có chắc chắn muốn xóa phương thức này không?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const res = await withdrawRequestApi.deleteStorePaymentInfo(id);
                    if (res.ok && res.body?.code === 0) {
                        message.success('Xóa thành công');
                        setInfoListKey(k => k + 1);
                    } else {
                        message.error(res.body?.message || 'Xóa thất bại');
                    }
                } catch {
                    message.error('Xóa thất bại');
                }
            },
        });
    };
    const handleInfoFormSuccess = () => {
        setInfoFormVisible(false);
        setInfoFormEdit(null);
        setInfoListKey(k => k + 1);
    };

    return (
        <div className={styles['withdraw-request-page']}>
            <div className={styles.header}>
                <h1>Yêu cầu rút tiền</h1>
                <Card style={{ minWidth: 220, textAlign: 'right' }}>
                    <div>Số dư tài khoản</div>
                    <div style={{ fontWeight: 700, fontSize: 20, color: '#389e0d' }}>{balance.toLocaleString()} đ</div>
                </Card>
            </div>
            <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="Lịch sử yêu cầu rút tiền" key="1">
                    <WithdrawRequestList key={listKey} loading={false} onCreate={handleCreate} />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Phương thức nhận tiền" key="2">
                    <StorePaymentInfoList
                        onAdd={handleAddInfo}
                        onEdit={handleEditInfo}
                        onDelete={handleDeleteInfo}
                        reloadKey={infoListKey}
                    />
                </Tabs.TabPane>
            </Tabs>
            <WithdrawRequestForm
                visible={formVisible}
                onCancel={() => setFormVisible(false)}
                onSuccess={handleFormSuccess}
                paymentMethods={paymentMethods}
            />
            <StorePaymentInfoForm
                visible={infoFormVisible}
                onCancel={() => { setInfoFormVisible(false); setInfoFormEdit(null); }}
                onSuccess={handleInfoFormSuccess}
                initialValues={infoFormEdit || undefined}
                isEdit={!!infoFormEdit}
            />
        </div>
    );
};

export default WithdrawRequestPage; 