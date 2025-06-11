import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Popconfirm, Typography, Tag, Switch, Tooltip } from 'antd';
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
                message.error('Failed to fetch vouchers');
            }
        } catch (error) {
            message.error('Failed to fetch vouchers');
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
                message.success(`Voucher ${editVoucher ? 'updated' : 'created'} successfully`);
                setFormVisible(false);
                fetchVouchers();
            } else {
                message.error(response.body?.message || `Failed to ${editVoucher ? 'update' : 'create'} voucher`);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || `Failed to ${editVoucher ? 'update' : 'create'} voucher`);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setLoading(true);
        try {
            const response = await voucherApi.deleteVoucher(id);
            if (response.ok && response.body?.code === 0) {
                message.success('Voucher deleted successfully');
                fetchVouchers();
            } else {
                message.error(response.body?.message || 'Failed to delete voucher');
            }
        } catch (error) {
            message.error('Failed to delete voucher');
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
                message.success('Voucher status updated successfully');
                fetchVouchers();
            } else {
                message.error(response.body?.message || 'Failed to update voucher status');
            }
        } catch (error) {
            message.error('Failed to update voucher status');
        } finally {
            setLoading(false);
        }
    };

    const getResponsiveColumns = (): ColumnsType<Voucher> => {
        const baseColumns: ColumnsType<Voucher> = [
            {
                title: 'Code',
                dataIndex: 'code',
                key: 'code',
                render: (code: string, record) => (
                    <Tooltip title={
                        <div>
                            <p><strong>Description:</strong> {record.description}</p>
                            <p><strong>Valid Period:</strong><br />
                                {dayjs(record.start_date).format('YYYY-MM-DD')} to {dayjs(record.end_date).format('YYYY-MM-DD')}</p>
                        </div>
                    }>
                        <Tag color="blue" style={{ cursor: 'pointer' }}>{code} <InfoCircleOutlined /></Tag>
                    </Tooltip>
                ),
            },
            {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
                render: (type: string) => (
                    <Tag color={type === 'order' ? 'green' : 'gold'}>
                        {type === 'order' ? 'Order' : 'Ship'}
                    </Tag>
                ),
            },
            {
                title: 'Discount',
                key: 'discount',
                render: (_, record) => (
                    <span>
                        {record.discount_unit === 'percent'
                            ? `${parseFloat(record.discount_value).toFixed(0)}%`
                            : formatCurrency(parseFloat(record.discount_value))}
                        {record.max_discount_value && (
                            <Tooltip title={`Max: ${formatCurrency(parseFloat(record.max_discount_value))}`}>
                                <InfoCircleOutlined style={{ marginLeft: 4 }} />
                            </Tooltip>
                        )}
                    </span>
                ),
            },
            {
                title: 'Status',
                key: 'status',
                render: (_, record) => (
                    <Switch
                        checked={record.is_active}
                        onChange={() => handleStatusToggle(record)}
                        checkedChildren="On"
                        unCheckedChildren="Off"
                        size={isMobile ? 'small' : 'default'}
                    />
                ),
            },
            {
                title: 'Actions',
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
                            {!isMobile && 'Edit'}
                        </Button>
                        <Popconfirm
                            title="Are you sure you want to delete this voucher?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Delete"
                            cancelText="Cancel"
                        >
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                size={isMobile ? 'small' : 'middle'}
                            >
                                {!isMobile && 'Delete'}
                            </Button>
                        </Popconfirm>
                    </Space>
                ),
            },
        ];

        if (!isTabletOrMobile) {
            // Add these columns only for desktop view
            baseColumns.splice(2, 0,
                {
                    title: 'Min Order',
                    dataIndex: 'min_order_value',
                    key: 'min_order_value',
                    render: (value: string) => formatCurrency(parseFloat(value)),
                },
                {
                    title: 'Valid Period',
                    key: 'period',
                    render: (_, record) => (
                        <span>
                            {dayjs(record.start_date).format('YYYY-MM-DD')}
                            <br />
                            to
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
                <Title level={2}>Voucher Management</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Create New Voucher
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
                    showTotal: (total) => `Total ${total} vouchers`,
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