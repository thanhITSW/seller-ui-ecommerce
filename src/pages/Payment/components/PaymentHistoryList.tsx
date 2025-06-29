import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, DatePicker, Select, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PaymentHistory, PaymentStatus } from '../../../types/Payment';
import paymentApi from '../../../api/paymentApi';
import dayjs from 'dayjs';
import styles from '../styles/Payment.module.scss';

const { RangePicker } = DatePicker;
const { Option } = Select;

const statusOptions: PaymentStatus[] = ['pending', 'completed', 'failed', 'cancelled', 'refunded'];

interface PaymentHistoryListProps {
    loading: boolean;
}

const PaymentHistoryList: React.FC<PaymentHistoryListProps> = ({ loading }) => {
    const [data, setData] = useState<PaymentHistory[]>([]);
    const [tableLoading, setTableLoading] = useState(false);
    const [filter, setFilter] = useState<{ startDate?: string; endDate?: string; status?: PaymentStatus }>({});
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [detail, setDetail] = useState<PaymentHistory | null>(null);
    const [detailVisible, setDetailVisible] = useState(false);

    const fetchData = async (page = 1, pageSize = 10) => {
        setTableLoading(true);
        try {
            const params = {
                ...filter,
                page,
                limit: pageSize,
            };
            const res = await paymentApi.getPaymentHistory(params);
            if (res.ok && res.body?.code === 0) {
                setData(res.body.data.payments);
                setPagination({
                    current: res.body.data.pagination.page,
                    pageSize: res.body.data.pagination.limit,
                    total: res.body.data.pagination.total,
                });
            } else {
                message.error(res.body?.message || 'Lỗi khi lấy danh sách giao dịch');
            }
        } catch (e) {
            message.error('Lỗi khi lấy danh sách giao dịch');
        } finally {
            setTableLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [filter]);

    const handleTableChange = (pagination: any) => {
        fetchData(pagination.current, pagination.pageSize);
    };

    const handleFilterChange = (dates: any) => {
        if (dates && dates[0] && dates[1]) {
            setFilter(f => ({ ...f, startDate: dates[0].format('YYYY-MM-DD'), endDate: dates[1].format('YYYY-MM-DD') }));
        } else {
            setFilter(f => {
                const { startDate, endDate, ...rest } = f;
                return rest;
            });
        }
    };

    const handleStatusChange = (value: PaymentStatus | undefined) => {
        setFilter(f => ({ ...f, status: value }));
    };

    const handleShowDetail = async (record: PaymentHistory) => {
        try {
            const res = await paymentApi.getPaymentDetails(record.id);
            if (res.ok && res.body?.code === 0) {
                setDetail(res.body.data);
                setDetailVisible(true);
            } else {
                message.error(res.body?.message || 'Không lấy được chi tiết giao dịch');
            }
        } catch (e) {
            message.error('Không lấy được chi tiết giao dịch');
        }
    };

    const handleUpdateStatus = async (record: PaymentHistory, status: PaymentStatus) => {
        Modal.confirm({
            title: 'Xác nhận thay đổi trạng thái?',
            content: `Bạn có chắc chắn muốn đổi trạng thái giao dịch sang "${status}"?`,
            okText: 'Đồng ý',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const res = await paymentApi.updatePaymentStatus(record.id, status);
                    if (res.ok && res.body?.code === 0) {
                        message.success('Cập nhật trạng thái thành công');
                        fetchData();
                    } else {
                        message.error(res.body?.message || 'Cập nhật trạng thái thất bại');
                    }
                } catch (e) {
                    message.error('Cập nhật trạng thái thất bại');
                }
            },
        });
    };

    const columns: ColumnsType<PaymentHistory> = [
        { title: 'STT', key: 'stt', render: (_: any, __: any, idx: number) => idx + 1 },
        { title: 'Order', dataIndex: 'order_id', key: 'order_id' },
        { title: 'User', dataIndex: 'user_id', key: 'user_id' },
        { title: 'Seller', dataIndex: 'seller_id', key: 'seller_id' },
        { title: 'Phương thức', dataIndex: ['Payment_method', 'method_name'], key: 'method_name', render: (text, record) => <span>{record.Payment_method?.method_name}</span> },
        { title: 'Số tiền', dataIndex: 'amount', key: 'amount' },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => <Tag className={styles.statusTag + ' ' + styles[status]}>{status}</Tag> },
        { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm') },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button size="small" type="primary" className={styles.actionBtn} onClick={() => handleShowDetail(record)}>Chi tiết</Button>
                    {/* <Select
                        size="small"
                        value={record.status}
                        style={{ width: 120 }}
                        onChange={status => handleUpdateStatus(record, status as PaymentStatus)}
                        className={styles.statusSelect}
                    >
                        {statusOptions.map(s => <Option key={s} value={s}>{s}</Option>)}
                    </Select> */}
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <RangePicker onChange={handleFilterChange} />
                <Select
                    allowClear
                    placeholder="Trạng thái"
                    style={{ width: 150 }}
                    onChange={handleStatusChange}
                >
                    {statusOptions.map(s => <Option key={s} value={s}>{s}</Option>)}
                </Select>
            </Space>
            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={tableLoading || loading}
                pagination={pagination}
                onChange={handleTableChange}
            />
            <Modal
                open={detailVisible}
                onCancel={() => setDetailVisible(false)}
                title="Chi tiết giao dịch"
                footer={null}
            >
                {detail ? (
                    <div>
                        <div><b>ID:</b> {detail.id}</div>
                        <div><b>Order:</b> {detail.order_id}</div>
                        <div><b>User:</b> {detail.user_id}</div>
                        <div><b>Seller:</b> {detail.seller_id}</div>
                        <div><b>Phương thức:</b> {detail.Payment_method?.method_name}</div>
                        <div><b>Số tiền:</b> {detail.amount}</div>
                        <div><b>Trạng thái:</b> {detail.status}</div>
                        <div><b>Ngày tạo:</b> {dayjs(detail.createdAt).format('YYYY-MM-DD HH:mm')}</div>
                        <div><b>Ngày cập nhật:</b> {dayjs(detail.updatedAt).format('YYYY-MM-DD HH:mm')}</div>
                    </div>
                ) : 'Đang tải...'}
            </Modal>
        </div>
    );
};

export default PaymentHistoryList; 