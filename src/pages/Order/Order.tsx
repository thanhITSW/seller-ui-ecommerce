import React, { useEffect, useState } from 'react';
import { Button, Table, Select, DatePicker, Modal, Form, Input, message, Space, Tag, Avatar, Timeline, Row, Col, Card, notification } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import orderApi from '../../api/orderApi';
import { Order, OrderDetail, DetailedOrderListResponse } from '../../types/Order';
import dayjs, { Dayjs } from 'dayjs';
import './styles/Order.module.scss';
import { Table as AntTable } from 'antd';
import StatusTabs from '../../components/Common/StatusTabs';
import viVN from 'antd/es/date-picker/locale/vi_VN';

const { Option } = Select;
const { RangePicker } = DatePicker;

const orderStatusOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'confirmed', label: 'Đã xác nhận' }
];

const paymentStatusOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ thanh toán' },
    { value: 'completed', label: 'Đã thanh toán' },
    { value: 'failed', label: 'Thất bại' },
    { value: 'cancelled', label: 'Đã hủy' },
];

const orderStatusTabs = [
    { key: 'pending', label: 'Chờ xác nhận', statuses: ['pending'] },
    { key: 'waiting_pickup', label: 'Chờ lấy hàng', statuses: ['confirmed', 'ready_to_ship'] },
    { key: 'shipping', label: 'Đang giao', statuses: ['shipping'] },
    { key: 'delivered', label: 'Đã giao', statuses: ['delivered'] },
    { key: 'return_cancel', label: 'Trả hàng/Hoàn tiền/Hủy', statuses: ['cancelled', 'refunded', 'returning'] },
];

// Mapping trạng thái đơn hàng và vận chuyển sang tiếng Việt
const orderStatusVN: Record<string, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Chờ lấy hàng',
    ready_to_ship: 'Chờ lấy hàng',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
    refunded: 'Đã hoàn tiền',
    returning: 'Trả hàng',
};
const shipmentStatusVN: Record<string, string> = {
    PICKUP_FAILED: 'Lấy hàng thất bại',
    ARRIVAL_WAREHOUSE: 'Đến kho',
    DEPARTURE_WAREHOUSE: 'Rời kho',
    OUT_FOR_DELIVERY: 'Đang giao cho khách',
    DELIVERED_SUCCESS: 'Đã giao thành công',
    IN_TRANSIT: 'Đang vận chuyển',
    DELIVERED: 'Đã giao',
};

// Map provider id sang tên đẹp
const providerNameVN: Record<string, string> = {
    SPX: 'SPX Express',
    GHTK: 'Giao Hàng Tiết Kiệm',
    GHN: 'Giao Hàng Nhanh',
    VNPOST: 'VNPost',
};

const OrderPage: React.FC = () => {
    const [orders, setOrders] = useState<OrderDetail[]>([]);
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
    const [activeTab, setActiveTab] = useState('');
    const [statusCount, setStatusCount] = useState<Record<string, number>>({});
    const [detailOrder, setDetailOrder] = useState<OrderDetail | null>(null);

    const fetchOrders = async (tabKey = activeTab) => {
        setLoading(true);
        try {
            const params: any = {};
            const statusArr = getOrderStatusForApi(tabKey);
            if (statusArr.length === 1) params.order_status = statusArr[0];
            else if (statusArr.length > 1) params.order_status = statusArr.join(',');
            if (paymentStatus) params.payment_status = paymentStatus;
            if (dateRange[0] && dateRange[1]) {
                params.startDate = dateRange[0].format('YYYY-MM-DD');
                params.endDate = dateRange[1].format('YYYY-MM-DD');
            }
            console.log(params);
            const res = await orderApi.getDetailedOrders(params);
            if (res.ok && res.body && res.body.code === 0) {
                setOrders(res.body.data);
                setStatusCount(res.body.statusCount || {});
            } else {
                notification.error({ message: res.body?.message || 'Lỗi lấy danh sách đơn hàng' });
            }
        } catch (e) {
            notification.error({ message: 'Lỗi lấy danh sách đơn hàng' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(activeTab);
        // eslint-disable-next-line
    }, [activeTab, paymentStatus, dateRange]);

    const handleViewDetails = async (order: OrderDetail) => {
        setDetailOrder(order);
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
    // Nút làm mới: clear filter và reload
    const handleResetFilters = () => {
        setStatus('');
        setPaymentStatus('');
        setDateRange([null, null]);
        fetchOrders();
    };

    // Đếm số lượng đơn cho từng tab
    const statusTabData = [
        { key: '', label: 'Tất cả', count: statusCount['total'] || 0, content: null },
        { key: 'pending', label: 'Chờ xác nhận', count: statusCount['pending'] || 0, content: null },
        { key: 'waiting_pickup', label: 'Chờ lấy hàng', count: (statusCount['confirmed'] || 0) + (statusCount['ready_to_ship'] || 0), content: null },
        { key: 'shipping', label: 'Đang giao', count: statusCount['shipping'] || 0, content: null },
        { key: 'delivered', label: 'Đã giao', count: statusCount['delivered'] || 0, content: null },
        { key: 'return_cancel', label: 'Đã hủy/Đơn hoàn', count: statusCount['cancelled_refunded'] || 0, content: null },
    ];

    // Khi chuyển tab, lấy group trạng thái tương ứng
    const getOrderStatusForApi = (tabKey: string) => {
        const found = orderStatusTabs.find(tab => tab.key === tabKey);
        return found ? found.statuses : [];
    };

    // Xác nhận đơn hàng
    const handleConfirmOrder = async (order: OrderDetail) => {
        Modal.confirm({
            title: 'Xác nhận đơn hàng',
            content: `Bạn có chắc chắn muốn xác nhận đơn hàng #${order.id}?`,
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            onOk: async () => {
                setLoading(true);
                try {
                    const res = await orderApi.updateOrder(order.id, { order_status: 'confirmed' });
                    if (res.ok && res.body.code === 0) {
                        notification.success({ message: 'Xác nhận đơn hàng thành công' });
                        fetchOrders(activeTab);
                    } else {
                        notification.error({ message: res.body?.message || 'Xác nhận đơn hàng thất bại' });
                    }
                } catch {
                    notification.error({ message: 'Xác nhận đơn hàng thất bại' });
                } finally {
                    setLoading(false);
                }
            }
        });
    };
    // Hủy đơn hàng
    const handleCancelOrder = async (order: OrderDetail) => {
        Modal.confirm({
            title: 'Hủy đơn hàng',
            content: `Bạn có chắc chắn muốn hủy đơn hàng #${order.id}?`,
            okText: 'Hủy đơn',
            cancelText: 'Không',
            onOk: async () => {
                setLoading(true);
                try {
                    const res = await orderApi.cancelOrder(order.id);
                    if (res.ok && res.body.code === 0) {
                        notification.success({ message: 'Hủy đơn hàng thành công' });
                        fetchOrders(activeTab);
                    } else {
                        notification.error({ message: res.body?.message || 'Hủy đơn hàng thất bại' });
                    }
                } catch {
                    notification.error({ message: 'Hủy đơn hàng thất bại' });
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    return (
        <div className="order-page">
            <div className="header">
                <h1>Quản lý đơn hàng</h1>
            </div>
            <StatusTabs
                tabs={statusTabData}
                activeKey={activeTab}
                onChange={setActiveTab}
            />
            <div className="filters">
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
                    locale={viVN}
                    placeholder={["Từ ngày", "Đến ngày"]}
                />
                <Button onClick={handleResetFilters}>Làm mới</Button>
            </div>
            <div className="order-list">
                {loading ? <div style={{ textAlign: 'center', margin: 40 }}>Đang tải...</div> : (
                    orders.length === 0 ? <div style={{ textAlign: 'center', margin: 40 }}>Không có đơn hàng nào</div> : (
                        orders.map(order => {
                            // Lấy sản phẩm đầu tiên và tổng số sản phẩm
                            const firstProduct = orderProducts[0] || null;
                            const productCount = order.total_quantity;
                            return (
                                <Card className="order-card" bordered key={order.id}>
                                    <Row align="middle" gutter={16} wrap={false}>
                                        {/* Avatar + tên người mua */}
                                        <Col flex="none" style={{ minWidth: 80, textAlign: 'center' }}>
                                            <Avatar src={order.user?.avatar} size={40} />
                                            <div style={{ fontWeight: 500 }}>{order.user?.fullname}</div>
                                        </Col>
                                        {/* Thông tin sản phẩm */}
                                        <Col flex="auto">
                                            <Row align="middle" gutter={12} wrap={false}>
                                                <Col flex="none">
                                                    {firstProduct && <img src={firstProduct.product_url_image} alt="" style={{ width: 56, height: 56, borderRadius: 6, objectFit: 'cover' }} />}
                                                </Col>
                                                <Col flex="auto">
                                                    <div className="product-title">{firstProduct?.product_name || '---'}</div>
                                                    <div className="product-variation">{firstProduct?.variation || ''}</div>
                                                    {productCount > 1 && <div style={{ color: '#888', fontSize: 13 }}>và {productCount - 1} sản phẩm khác...</div>}
                                                </Col>
                                                <Col flex="none" style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 600, color: '#d4380d' }}>{firstProduct ? Number(firstProduct.product_price).toLocaleString() + '₫' : ''}</div>
                                                    <div style={{ fontSize: 13 }}>x{firstProduct?.product_quantity || 1}</div>
                                                    <div style={{ fontSize: 13 }}>{order.payment_method === 'COD' ? 'Thanh toán khi nhận hàng' : order.payment_method}</div>
                                                </Col>
                                            </Row>
                                        </Col>
                                        {/* Trạng thái đơn hàng */}
                                        <Col flex="none" style={{ minWidth: 160 }}>
                                            <div style={{ fontWeight: 600, color: '#52c41a' }}>{orderStatusVN[order.order_status] || order.order_status}</div>
                                        </Col>
                                        {/* Vận chuyển */}
                                        <Col flex="none" style={{ minWidth: 160 }}>
                                            <div><b>{order.shipment?.shipping_provider_id === 'SPX' ? 'Nhanh' : 'Thường'}</b></div>
                                            <div style={{ fontSize: 13 }}>{order.shipment?.tracking_number}</div>
                                            <div style={{ fontSize: 13, color: '#1890ff' }}>{shipmentStatusVN[order.shipment?.current_status || ''] || order.shipment?.current_status}</div>
                                        </Col>
                                        {/* Mã đơn hàng + Xem chi tiết */}
                                        <Col flex="none" style={{ textAlign: 'right', minWidth: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>Mã đơn hàng {order.id}</div>
                                            <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetails(order)} style={{ padding: 0, marginBottom: 4 }}>
                                                Xem chi tiết
                                            </Button>
                                            {activeTab === 'pending' && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                                                    <Button icon={<CheckCircleTwoTone twoToneColor="#52c41a" />} type="primary" style={{ width: 110 }} onClick={() => handleConfirmOrder(order)}>
                                                        Xác nhận
                                                    </Button>
                                                    <Button icon={<CloseCircleTwoTone twoToneColor="#ff4d4f" />} danger style={{ width: 110 }} onClick={() => handleCancelOrder(order)}>
                                                        Hủy đơn
                                                    </Button>
                                                </div>
                                            )}
                                        </Col>
                                    </Row>
                                </Card>
                            );
                        })
                    )
                )}
            </div>
            {/* Modal chi tiết đơn hàng */}
            <Modal
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                title={`Chi tiết đơn hàng #${detailOrder?.id}`}
                footer={null}
                width={700}
            >
                {detailOrder && (
                    <>
                        <div style={{ marginBottom: 16 }}>
                            <b>Nhà bán:</b> {detailOrder.seller_name} | <b>Ngày đặt:</b> {dayjs(detailOrder.createdAt).format('DD/MM/YYYY HH:mm')}
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <b>Người mua:</b> {detailOrder.user?.fullname} - {detailOrder.user?.phone}
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <b>Tổng tiền:</b> {Number(detailOrder.final_total).toLocaleString()}₫ | <b>Trạng thái:</b> <Tag color={orderStatusColor(detailOrder.order_status)}>{orderStatusVN[detailOrder.order_status]}</Tag>
                        </div>
                        <h4>Danh sách sản phẩm</h4>
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
                            style={{ marginBottom: 24 }}
                        />
                        <h4>Lộ trình vận chuyển</h4>
                        <Timeline style={{ marginTop: 8 }}>
                            {detailOrder.shipment?.progress?.map((prog, idx) => (
                                <Timeline.Item key={idx}>
                                    <div><b>{shipmentStatusVN[prog.status] || prog.status}</b> - {dayjs(prog.timestamp).format('DD/MM/YYYY HH:mm')}</div>
                                    <div>{prog.note}</div>
                                    <div style={{ color: '#888' }}>{prog.location}</div>
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default OrderPage; 