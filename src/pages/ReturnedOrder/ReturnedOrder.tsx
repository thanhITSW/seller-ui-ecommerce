import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, notification, Space, Tag, Avatar, Descriptions, Timeline, Divider, DatePicker, Input, Select } from 'antd';
import { EditOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import returnedOrderApi from '../../api/returnedOrderApi';
import dayjs, { Dayjs } from 'dayjs';
import './styles/ReturnedOrder.module.scss';

const { RangePicker } = DatePicker;
const { Search } = Input;

const orderStatusOptions = [
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'ready_to_ship', label: 'Sẵn sàng giao' },
    { value: 'shipping', label: 'Đang giao' },
    { value: 'returned', label: 'Đã hoàn trả' },
    { value: 'failed', label: 'Thất bại' },
];

const paymentRefundStatusOptions = [
    { value: 'pending', label: 'Chờ hoàn tiền' },
    { value: 'completed', label: 'Đã hoàn tiền' },
    { value: 'failed', label: 'Hoàn tiền thất bại' },
];

const shipmentStatusLabels: Record<string, string> = {
    PICKUP_SUCCESS: 'Lấy hàng thành công',
    PICKUP_FAILED: 'Lấy hàng thất bại',
    IN_TRANSIT: 'Đang vận chuyển',
    OUT_FOR_DELIVERY: 'Đang giao hàng',
    DELIVERED_SUCCESS: 'Đã giao thành công',
    DELIVERED: 'Đã giao',
    ARRIVAL_WAREHOUSE: 'Đến kho',
    DEPARTURE_WAREHOUSE: 'Rời kho',
    CANCELLED: 'Đã hủy',
    RETURNED: 'Đã trả hàng',
};

const ReturnedOrderPage: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
    const [searchText, setSearchText] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editForm] = Form.useForm();

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (dateRange[0] && dateRange[1]) {
                params.startDate = dateRange[0].format('YYYY-MM-DD');
                params.endDate = dateRange[1].format('YYYY-MM-DD');
            }
            const res = await returnedOrderApi.getDetailsList(params);
            if (res.ok && res.body && res.body.code === 0) {
                setOrders(res.body.data);
                setFilteredOrders(res.body.data);
            } else {
                notification.error({ message: 'Lỗi', description: res.body?.message || 'Lỗi lấy danh sách đơn hoàn trả' });
                setOrders([]);
                setFilteredOrders([]);
            }
        } catch (e) {
            notification.error({ message: 'Lỗi', description: 'Lỗi lấy danh sách đơn hoàn trả' });
            setOrders([]);
            setFilteredOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line
    }, [dateRange]);

    // Lọc dữ liệu trên client khi searchText thay đổi
    useEffect(() => {
        if (!searchText) {
            setFilteredOrders(orders);
        } else {
            const lower = searchText.toLowerCase();
            setFilteredOrders(
                orders.filter((order: any) =>
                    (order.id && order.id.toLowerCase().includes(lower)) ||
                    (order.seller_name && order.seller_name.toLowerCase().includes(lower)) ||
                    (order.user && order.user.fullname && order.user.fullname.toLowerCase().includes(lower))
                )
            );
        }
    }, [searchText, orders]);

    const handleViewDetails = (order: any) => {
        setSelectedOrder(order);
        setDetailModalVisible(true);
    };

    const handleEdit = (order: any) => {
        setSelectedOrder(order);
        editForm.setFieldsValue(order);
        setEditModalVisible(true);
    };

    const handleEditSubmit = async () => {
        try {
            setLoading(true);
            const values = await editForm.validateFields();
            const res = await returnedOrderApi.update(selectedOrder!.id, values);
            if (res.ok && res.body.code === 0) {
                notification.success({ message: 'Thành công', description: 'Cập nhật đơn hoàn trả thành công' });
                setEditModalVisible(false);
                fetchOrders();
            } else {
                notification.error({ message: 'Lỗi', description: res.body?.message || 'Cập nhật đơn hoàn trả thất bại' });
            }
        } catch {
            // do nothing
        } finally {
            setLoading(false);
        }
    };

    const orderStatusColor = (status: string) => {
        switch (status) {
            case 'processing': return 'processing';
            case 'shipping': return 'cyan';
            case 'returned': return 'success';
            case 'failed': return 'error';
            default: return 'default';
        }
    };
    const refundStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'completed': return 'success';
            case 'failed': return 'error';
            default: return 'default';
        }
    };
    const shipmentStatusColor = (status: string) => {
        switch (status) {
            case 'PICKUP_SUCCESS': return 'processing';
            case 'PICKUP_FAILED': return 'error';
            case 'IN_TRANSIT': return 'warning';
            case 'OUT_FOR_DELIVERY': return 'cyan';
            case 'DELIVERED_SUCCESS': return 'success';
            case 'DELIVERED': return 'success';
            case 'ARRIVAL_WAREHOUSE': return 'blue';
            case 'DEPARTURE_WAREHOUSE': return 'purple';
            case 'CANCELLED': return 'default';
            case 'RETURNED': return 'magenta';
            default: return 'default';
        }
    };

    const columns = [
        {
            title: 'STT',
            key: 'stt',
            render: (_: any, __: any, index: number) => index + 1
        },
        { title: 'Người bán', dataIndex: 'seller_name', key: 'seller_name' },
        { title: 'Số lượng', dataIndex: 'total_quantity', key: 'total_quantity' },
        { title: 'Phí ship hoàn', dataIndex: 'return_shipping_fee', key: 'return_shipping_fee', render: (v: string) => `${Number(v).toLocaleString()}₫` },
        { title: 'Hoàn tiền', dataIndex: 'refund_amount', key: 'refund_amount', render: (v: string) => `${Number(v).toLocaleString()}₫` },
        { title: 'Trạng thái đơn', dataIndex: 'order_status', key: 'order_status', render: (v: string) => <Tag color={orderStatusColor(v)}>{orderStatusOptions.find(opt => opt.value === v)?.label || v}</Tag> },
        { title: 'Trạng thái hoàn tiền', dataIndex: 'payment_refund_status', key: 'payment_refund_status', render: (v: string) => <Tag color={refundStatusColor(v)}>{paymentRefundStatusOptions.find(opt => opt.value === v)?.label || v}</Tag> },
        {
            title: 'Vận chuyển',
            key: 'shipment',
            render: (_: any, record: any) => record.shipment ? (
                <Tag color={shipmentStatusColor(record.shipment.current_status)}>
                    {shipmentStatusLabels[record.shipment.current_status] || record.shipment.current_status}
                </Tag>
            ) : <Tag color="default">Chưa có</Tag>
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: any) => (
                <Space>
                    <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                </Space>
            ),
        },
    ];

    const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (!dates || (!dates[0] && !dates[1])) {
            setDateRange([null, null]);
            fetchOrders();
        } else {
            setDateRange(dates as [Dayjs | null, Dayjs | null]);
        }
    };

    const handleResetFilters = () => {
        setDateRange([null, null]);
        setSearchText('');
        fetchOrders();
    };

    return (
        <div className="order-page">
            <div className="header">
                <h1>Quản lý đơn hoàn trả</h1>
            </div>
            <div className="filters">
                <RangePicker
                    style={{ marginRight: 16 }}
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    format="DD/MM/YYYY"
                    placeholder={["Từ ngày", "Đến ngày"]}
                />
                <Search
                    placeholder="Tìm kiếm theo ID, người bán, người mua..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    style={{ width: 300, marginRight: 16 }}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    onSearch={v => setSearchText(v)}
                />
                <Button onClick={handleResetFilters}>Làm mới</Button>
            </div>
            <Table
                columns={columns}
                dataSource={filteredOrders}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                style={{ marginTop: 24 }}
            />

            {/* Modal xem chi tiết */}
            <Modal
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                title={`Chi tiết đơn hoàn trả #${selectedOrder?.id}`}
                footer={null}
                width={700}
            >
                {selectedOrder && (
                    <>
                        <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
                            <Descriptions.Item label="ID đơn hoàn trả">{selectedOrder.id}</Descriptions.Item>
                            <Descriptions.Item label="Người mua">
                                <Space>
                                    <Avatar src={selectedOrder.user?.avatar} />
                                    <span>{selectedOrder.user?.fullname}</span>
                                    <span>({selectedOrder.user?.email})</span>
                                    <span>{selectedOrder.user?.phone}</span>
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Người bán">{selectedOrder.seller_name}</Descriptions.Item>
                            <Descriptions.Item label="Tổng tiền hoàn">{Number(selectedOrder.refund_amount).toLocaleString()}₫</Descriptions.Item>
                            <Descriptions.Item label="Phí ship hoàn">{Number(selectedOrder.return_shipping_fee).toLocaleString()}₫</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái đơn hoàn trả">
                                <Tag color={orderStatusColor(selectedOrder.order_status)}>
                                    {orderStatusOptions.find(opt => opt.value === selectedOrder.order_status)?.label || selectedOrder.order_status}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái hoàn tiền">
                                <Tag color={refundStatusColor(selectedOrder.payment_refund_status)}>
                                    {paymentRefundStatusOptions.find(opt => opt.value === selectedOrder.payment_refund_status)?.label || selectedOrder.payment_refund_status}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Vận chuyển">
                                {selectedOrder.shipment ? (
                                    <Tag color={shipmentStatusColor(selectedOrder.shipment.current_status)}>
                                        {shipmentStatusLabels[selectedOrder.shipment.current_status] || selectedOrder.shipment.current_status}
                                    </Tag>
                                ) : <Tag color="default">Chưa có</Tag>}
                            </Descriptions.Item>
                        </Descriptions>
                        <Divider orientation="left">Lịch sử vận chuyển</Divider>
                        {selectedOrder.shipment && selectedOrder.shipment.progress && selectedOrder.shipment.progress.length > 0 ? (
                            <Timeline style={{ marginBottom: 16 }}>
                                {[...selectedOrder.shipment.progress].reverse().map((item: any, idx: number) => (
                                    <Timeline.Item key={idx} color={shipmentStatusColor(item.status)}>
                                        <b>{shipmentStatusLabels[item.status] || item.status}</b> - {item.location}<br />
                                        <span>{item.note}</span><br />
                                        <span style={{ color: '#888' }}>{dayjs(item.timestamp).format('DD/MM/YYYY HH:mm')}</span>
                                    </Timeline.Item>
                                ))}
                            </Timeline>
                        ) : <span>Không có lịch sử vận chuyển</span>}
                        <Divider orientation="left">Danh sách sản phẩm hoàn trả</Divider>
                        <Table
                            dataSource={selectedOrder.items}
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
                    </>
                )}
            </Modal>

            {/* Modal sửa */}
            <Modal
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                title={`Cập nhật đơn hoàn trả #${selectedOrder?.id}`}
                onOk={handleEditSubmit}
                okText="Lưu"
                cancelText="Hủy"
                confirmLoading={loading}
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item label="Trạng thái đơn hoàn trả" name="order_status">
                        <Select
                            options={orderStatusOptions}
                            placeholder="Chọn trạng thái"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item label="Trạng thái hoàn tiền" name="payment_refund_status">
                        <Select
                            options={paymentRefundStatusOptions}
                            placeholder="Chọn trạng thái"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ReturnedOrderPage; 