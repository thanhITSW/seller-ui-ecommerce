import React, { useEffect, useState } from 'react';
import { Button, Table, Select, DatePicker, Modal, Form, Input, message, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import orderApi from '../../api/orderApi';
import { Order } from '../../types/Order';
import dayjs, { Dayjs } from 'dayjs';
import './styles/Order.module.scss';
import { Table as AntTable } from 'antd';
import type { Breakpoint } from 'antd/es/_util/responsiveObserver';

const { Option } = Select;
const { RangePicker } = DatePicker;

const orderStatusOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'delivered', label: 'Đã giao' },
    { value: 'cancelled', label: 'Đã hủy' },
];

const paymentStatusOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ thanh toán' },
    { value: 'completed', label: 'Đã thanh toán' },
    { value: 'failed', label: 'Thất bại' },
    { value: 'cancelled', label: 'Đã hủy' },
];

const OrderPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editForm] = Form.useForm();
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [orderProducts, setOrderProducts] = useState<any[]>([]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (status) params.order_status = status;
            if (paymentStatus) params.payment_status = paymentStatus;
            if (dateRange[0] && dateRange[1]) {
                params.startDate = dateRange[0].format('YYYY-MM-DD');
                params.endDate = dateRange[1].format('YYYY-MM-DD');
            }
            const res = await orderApi.getList(params);
            if (res.ok && res.body && res.body.code === 0) {
                setOrders(res.body.data);
            } else {
                message.error(res.body?.message || 'Lỗi lấy danh sách đơn hàng');
            }
        } catch (e) {
            message.error('Lỗi lấy danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line
    }, [status, paymentStatus, dateRange]);

    const handleViewDetails = async (order: Order) => {
        setSelectedOrder(order);
        setDetailModalVisible(true);
        setOrderProducts([]);
        try {
            const res = await orderApi.getOrderDetails(order.id);
            if (res.ok && res.body && res.body.code === 0 && Array.isArray(res.body.data)) {
                setOrderProducts(res.body.data);
            } else {
                setOrderProducts([]);
            }
        } catch {
            setOrderProducts([]);
        }
    };

    const handleEdit = (order: Order) => {
        setSelectedOrder(order);
        editForm.setFieldsValue(order);
        setEditModalVisible(true);
    };

    const handleDelete = async (order: Order) => {
        Modal.confirm({
            title: 'Xác nhận xóa đơn hàng',
            content: 'Bạn có chắc chắn muốn xóa đơn hàng này?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            onOk: async () => {
                setLoading(true);
                try {
                    const res = await orderApi.cancelOrder(order.id);
                    if (res.ok && res.body.code === 0) {
                        message.success('Xóa đơn hàng thành công');
                        fetchOrders();
                    } else {
                        message.error(res.body?.message || 'Xóa đơn hàng thất bại');
                    }
                } catch {
                    message.error('Xóa đơn hàng thất bại');
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const handleEditSubmit = async () => {
        try {
            setLoading(true);
            const values = await editForm.validateFields();
            const res = await orderApi.updateOrder(selectedOrder!.id, values);
            if (res.ok && res.body.code === 0) {
                message.success('Cập nhật đơn hàng thành công');
                setEditModalVisible(false);
                fetchOrders();
            } else {
                message.error(res.body?.message || 'Cập nhật đơn hàng thất bại');
            }
        } catch {
            // do nothing
        } finally {
            setLoading(false);
        }
    };

    // Xử lý màu cho trạng thái
    const orderStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'default';
            case 'confirmed': return 'processing';
            case 'delivered': return 'success';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };
    const paymentStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'completed': return 'success';
            case 'failed': return 'error';
            case 'cancelled': return 'default';
            default: return 'default';
        }
    };

    const columns = [
        {
            title: 'STT',
            key: 'stt',
            render: (_: any, __: Order, index: number) => index + 1
        },
        { title: 'ID', dataIndex: 'id', key: 'id', responsive: ['md'] as Breakpoint[] },
        { title: 'Người bán', dataIndex: 'seller_name', key: 'seller_name' },
        { title: 'Số lượng', dataIndex: 'total_quantity', key: 'total_quantity' },
        { title: 'Tổng tiền', dataIndex: 'final_total', key: 'final_total', render: (v: string) => `${Number(v).toLocaleString()}₫` },
        { title: 'PT Thanh toán', dataIndex: 'payment_method', key: 'payment_method' },
        { title: 'Trạng thái thanh toán', dataIndex: 'payment_status', key: 'payment_status', render: (v: string) => <Tag color={paymentStatusColor(v)}>{paymentStatusOptions.find(opt => opt.value === v)?.label || v}</Tag> },
        { title: 'Trạng thái đơn', dataIndex: 'order_status', key: 'order_status', render: (v: string) => <Tag color={orderStatusColor(v)}>{orderStatusOptions.find(opt => opt.value === v)?.label || v}</Tag> },
        { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm') },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: Order) => (
                <Space>
                    <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)} />
                </Space>
            ),
        },
    ];

    // Nút làm mới: clear filter và reload
    const handleResetFilters = () => {
        setStatus('');
        setPaymentStatus('');
        setDateRange([null, null]);
        fetchOrders();
    };

    return (
        <div className="product-type-page">
            <div className="header">
                <h1>Quản lý đơn hàng</h1>
            </div>
            <div className="filters">
                <Select
                    style={{ width: 180, marginRight: 16 }}
                    value={status}
                    onChange={setStatus}
                    placeholder="Trạng thái đơn hàng"
                >
                    {orderStatusOptions.map(opt => (
                        <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                    ))}
                </Select>
                <Select
                    style={{ width: 180, marginRight: 16 }}
                    value={paymentStatus}
                    onChange={setPaymentStatus}
                    placeholder="Trạng thái thanh toán"
                >
                    {paymentStatusOptions.map(opt => (
                        <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                    ))}
                </Select>
                <RangePicker
                    style={{ marginRight: 16 }}
                    value={dateRange}
                    onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
                    format="DD/MM/YYYY"
                />
                <Button onClick={handleResetFilters}>Làm mới</Button>
            </div>
            <AntTable
                columns={columns}
                dataSource={orders}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                style={{ marginTop: 24 }}
            />

            {/* Modal xem chi tiết */}
            <Modal
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                title={`Chi tiết đơn hàng #${selectedOrder?.id}`}
                footer={null}
                width={600}
            >
                <h3 style={{ marginBottom: 16 }}>Danh sách sản phẩm</h3>
                <AntTable
                    dataSource={orderProducts}
                    rowKey="id"
                    pagination={false}
                    columns={[
                        { title: 'Tên sản phẩm', dataIndex: 'product_name', key: 'product_name' },
                        { title: 'Giá', dataIndex: 'product_price', key: 'product_price', render: (v: string) => `${Number(v).toLocaleString()}₫` },
                        { title: 'Số lượng', dataIndex: 'product_quantity', key: 'product_quantity' },
                    ]}
                    locale={{ emptyText: 'Không có sản phẩm nào' }}
                    size="small"
                />
            </Modal>

            {/* Modal sửa */}
            <Modal
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                title={`Sửa đơn hàng #${selectedOrder?.id}`}
                onOk={handleEditSubmit}
                okText="Lưu"
                cancelText="Hủy"
                confirmLoading={loading}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item label="Trạng thái đơn hàng" name="order_status">
                        <Select>
                            {orderStatusOptions.filter(opt => opt.value).map(opt => (
                                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Trạng thái thanh toán" name="payment_status">
                        <Select>
                            {paymentStatusOptions.filter(opt => opt.value).map(opt => (
                                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default OrderPage; 