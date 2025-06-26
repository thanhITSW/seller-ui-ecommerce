import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Popconfirm, Typography, Tag, Switch, Tooltip, notification } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Voucher } from '../../types/Voucher';
import voucherApi from '../../api/voucherApi';
import VoucherForm from '../../components/Voucher/VoucherForm';
import dayjs from 'dayjs';
import { formatCurrency } from '../../utils/format';
import '@/styles/Voucher/Voucher.scss';
import { useMediaQuery } from 'react-responsive';

const { Title } = Typography;

const VoucherPage: React.FC = () => {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [editVoucher, setEditVoucher] = useState<Voucher | null>(null);

    // Media queries for responsive design
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1024px)' });
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const response = await voucherApi.getVouchers();
            if (response.ok && response.body?.code === 0) {
                const vouchersWithUsage = response.body.data.map(voucher => ({
                    ...voucher,
                    is_used: false
                }));
                setVouchers(vouchersWithUsage);
            } else {
                notification.error({ message: 'Lấy danh sách mã giảm giá thất bại!' });
            }
        } catch (error) {
            notification.error({ message: 'Lấy danh sách mã giảm giá thất bại!' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    const handleCreate = () => {
        setEditVoucher(null);
        setFormVisible(true);
    };

    const handleEdit = (voucher: Voucher) => {
        setEditVoucher(voucher);
        setFormVisible(true);
    };

    const handleFormSubmit = async (values: any) => {
        setFormLoading(true);
        try {
            const response = editVoucher
                ? await voucherApi.updateVoucher(editVoucher.id, values)
                : await voucherApi.createVoucher(values);

            if (response.ok && response.body?.code === 0) {
                notification.success({ message: `Mã giảm giá ${editVoucher ? 'cập nhật' : 'tạo mới'} thành công!` });
                setFormVisible(false);
                fetchVouchers();
            } else {
                notification.error({ message: response.body?.message || `Thao tác ${editVoucher ? 'cập nhật' : 'tạo mới'} mã giảm giá thất bại!` });
            }
        } catch (error: any) {
            notification.error({ message: error.response?.data?.message || `Thao tác ${editVoucher ? 'cập nhật' : 'tạo mới'} mã giảm giá thất bại!` });
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setLoading(true);
        try {
            const response = await voucherApi.deleteVoucher(id);
            if (response.ok && response.body?.code === 0) {
                notification.success({ message: 'Xóa mã giảm giá thành công!' });
                fetchVouchers();
            } else {
                notification.error({ message: response.body?.message || 'Xóa mã giảm giá thất bại!' });
            }
        } catch (error) {
            notification.error({ message: 'Xóa mã giảm giá thất bại!' });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (voucher: Voucher) => {
        setLoading(true);
        try {
            const response = await voucherApi.updateVoucherStatus(voucher.id, {
                is_active: !voucher.is_active
            });
            if (response.ok && response.body?.code === 0) {
                notification.success({ message: 'Cập nhật trạng thái mã giảm giá thành công!' });
                fetchVouchers();
            } else {
                notification.error({ message: response.body?.message || 'Cập nhật trạng thái mã giảm giá thất bại!' });
            }
        } catch (error) {
            notification.error({ message: 'Cập nhật trạng thái mã giảm giá thất bại!' });
        } finally {
            setLoading(false);
        }
    };

    const getResponsiveColumns = (): ColumnsType<Voucher> => {
        const baseColumns: ColumnsType<Voucher> = [
            {
                title: 'Mã',
                dataIndex: 'code',
                key: 'code',
                render: (code: string, record) => (
                    <Tooltip title={
                        <div>
                            <p><strong>Mô tả:</strong> {record.description}</p>
                            <p><strong>Thời gian hiệu lực:</strong><br />
                                {dayjs(record.start_date).format('YYYY-MM-DD')} đến {dayjs(record.end_date).format('YYYY-MM-DD')}</p>
                        </div>
                    }>
                        <Tag color="blue" style={{ cursor: 'pointer' }}>{code} <InfoCircleOutlined /></Tag>
                    </Tooltip>
                ),
            },
            {
                title: 'Loại',
                dataIndex: 'type',
                key: 'type',
                render: (type: string) => (
                    <Tag color={type === 'order' ? 'green' : 'gold'}>
                        {type === 'order' ? 'Đơn hàng' : 'Vận chuyển'}
                    </Tag>
                ),
            },
            {
                title: 'Giảm giá',
                key: 'discount',
                render: (_, record) => (
                    <span>
                        {record.discount_unit === 'percent'
                            ? `${parseFloat(record.discount_value).toFixed(0)}%`
                            : formatCurrency(parseFloat(record.discount_value))}
                        {record.max_discount_value && (
                            <Tooltip title={`Tối đa: ${formatCurrency(parseFloat(record.max_discount_value))}`}>
                                <InfoCircleOutlined style={{ marginLeft: 4 }} />
                            </Tooltip>
                        )}
                    </span>
                ),
            },
            {
                title: 'Trạng thái',
                key: 'status',
                render: (_, record) => (
                    <Switch
                        checked={record.is_active}
                        onChange={() => handleStatusToggle(record)}
                        checkedChildren="Bật"
                        unCheckedChildren="Tắt"
                        size={isMobile ? 'small' : 'default'}
                    />
                ),
            },
            {
                title: 'Hành động',
                key: 'actions',
                align: 'right',
                render: (_, record) => (
                    <Space size={isMobile ? 'small' : 'middle'}>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            size={isMobile ? 'small' : 'middle'}
                        >
                            {/* {!isMobile && 'Sửa'} */}
                        </Button>
                        <Popconfirm
                            title="Bạn có chắc chắn muốn xóa mã giảm giá này?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                size={isMobile ? 'small' : 'middle'}
                            >
                                {/* {!isMobile && 'Xóa'} */}
                            </Button>
                        </Popconfirm>
                    </Space>
                ),
            },
        ];

        if (!isTabletOrMobile) {
            baseColumns.splice(2, 0,
                {
                    title: 'Đơn hàng tối thiểu',
                    dataIndex: 'min_order_value',
                    key: 'min_order_value',
                    render: (value: string) => formatCurrency(parseFloat(value)),
                },
                {
                    title: 'Thời gian hiệu lực',
                    key: 'period',
                    render: (_, record) => (
                        <span>
                            {dayjs(record.start_date).format('YYYY-MM-DD')}
                            <br />
                            đến
                            <br />
                            {dayjs(record.end_date).format('YYYY-MM-DD')}
                        </span>
                    ),
                }
            );
        }

        return baseColumns;
    };

    return (
        <div className="voucher-page">
            <div className="header">
                <Title level={2}>Quản lý mã giảm giá</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Tạo mã giảm giá mới
                </Button>
            </div>

            <Table
                columns={getResponsiveColumns()}
                dataSource={vouchers}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} mã giảm giá`,
                }}
                scroll={{ x: 'max-content' }}
            />

            <VoucherForm
                visible={formVisible}
                onCancel={() => setFormVisible(false)}
                onSubmit={handleFormSubmit}
                initialValues={editVoucher || undefined}
                loading={formLoading}
                isEditing={!!editVoucher}
                isUsed={editVoucher?.is_used}
            />
        </div>
    );
};

export default VoucherPage; 