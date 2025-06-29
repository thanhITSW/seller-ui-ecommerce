import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Table, Button, Space, Tag, message, Modal } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { PaymentMethod } from '../../../types/Payment';
import paymentApi from '../../../api/paymentApi';
import styles from '../styles/Payment.module.scss';

interface PaymentMethodListProps {
    loading: boolean;
    onEdit: (method: PaymentMethod) => void;
}

const PaymentMethodList = forwardRef<any, PaymentMethodListProps>(({ loading, onEdit }, ref) => {
    const [data, setData] = useState<PaymentMethod[]>([]);
    const [tableLoading, setTableLoading] = useState(false);

    const fetchData = async () => {
        setTableLoading(true);
        try {
            const res = await paymentApi.getPaymentMethods();
            if (res.ok && res.body?.code === 0) {
                setData(res.body.data);
            } else {
                message.error(!res.body?.success || 'Lỗi khi lấy phương thức thanh toán');
            }
        } catch (e) {
            message.error('Lỗi khi lấy phương thức thanh toán');
        } finally {
            setTableLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({ fetchData }));

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: string) => {
        Modal.confirm({
            title: 'Xác nhận xóa phương thức?',
            content: 'Bạn có chắc chắn muốn xóa phương thức này không?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const res = await paymentApi.deletePaymentMethod(id);
                    if (res.ok && res.body?.code === 0) {
                        message.success('Xóa thành công');
                        fetchData();
                    } else {
                        message.error(res.body?.message || 'Xóa thất bại');
                    }
                } catch (e) {
                    message.error('Xóa thất bại');
                }
            },
        });
    };

    const columns = [
        { title: 'STT', key: 'stt', render: (_: any, __: any, idx: number) => idx + 1 },
        { title: 'Tên phương thức', dataIndex: 'method_name', key: 'method_name' },
        { title: 'Mô tả', dataIndex: 'description', key: 'description' },
        { title: 'Trạng thái', dataIndex: 'is_active', key: 'is_active', render: (active: boolean) => <Tag color={active ? 'green' : 'red'}>{active ? 'Kích hoạt' : 'Ẩn'}</Tag> },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_: any, record: PaymentMethod) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        className={styles.actionBtn}
                        onClick={() => onEdit(record)}
                    >
                        Sửa
                    </Button>
                    <Button danger icon={<DeleteOutlined />} size="small" className={styles.actionBtn} onClick={() => handleDelete(record.id)}>
                        Xóa
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={tableLoading || loading}
            />
        </div>
    );
});

export default PaymentMethodList; 