import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, Modal, message, Form, Input, Select, DatePicker } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import moment from 'moment';
import { Shipment, ShipmentStatus } from '../../../types/Shipment';
import shipmentApi from '../../../api/shipmentApi';
import styles from '../styles/Shipment.module.scss';

interface ShipmentListProps {
    loading: boolean;
}

const statusOptions: ShipmentStatus[] = ['pending', 'shipped', 'delivered', 'cancelled'];

const ShipmentList: React.FC<ShipmentListProps> = ({ loading }) => {
    const [data, setData] = useState<Shipment[]>([]);
    const [tableLoading, setTableLoading] = useState(false);
    const [detail, setDetail] = useState<Shipment | null>(null);
    const [detailVisible, setDetailVisible] = useState(false);
    const [editVisible, setEditVisible] = useState(false);
    const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setTableLoading(true);
        try {
            const res = await shipmentApi.getShipments();
            if (res.ok && res.body?.code === 0) {
                setData(res.body.data || []);
            } else {
                message.error('Lỗi khi lấy danh sách đơn hàng vận chuyển');
            }
        } catch (e) {
            message.error('Lỗi khi lấy danh sách đơn hàng vận chuyển');
        } finally {
            setTableLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleShowDetail = async (record: Shipment) => {
        try {
            const res = await shipmentApi.getShipmentById(record.id);
            if (res.ok && res.body?.code === 0) {
                setDetail(res.body.data);
                setDetailVisible(true);
            } else {
                message.error('Không lấy được chi tiết đơn hàng');
            }
        } catch (e) {
            message.error('Không lấy được chi tiết đơn hàng');
        }
    };

    const handleEdit = (record: Shipment) => {
        setEditingShipment(record);
        setEditVisible(true);
        form.setFieldsValue({
            ...record,
            estimated_delivery: moment(record.estimated_delivery)
        });
    };

    const handleEditSubmit = async () => {
        try {
            const values = await form.validateFields();
            setEditLoading(true);

            // Convert form values to match backend expectations
            const submitData = {
                ...values,
                order_id: Number(values.order_id),
                shipping_provider_id: Number(values.shipping_provider_id),
                shipping_address_from_id: Number(values.shipping_address_from_id),
                shipping_address_to_id: Number(values.shipping_address_to_id),
                estimated_delivery: values.estimated_delivery.format('YYYY-MM-DD')
            };

            const res = await shipmentApi.updateShipment(editingShipment!.id, submitData);
            if (res.ok && res.body?.code === 0) {
                message.success('Cập nhật thành công');
                setEditVisible(false);
                setEditingShipment(null);
                fetchData();
            } else {
                message.error(res.body?.message || 'Cập nhật thất bại');
            }
        } catch (e) {
            if (e instanceof Error) {
                message.error(e.message);
            }
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa đơn hàng?',
            content: 'Bạn có chắc chắn muốn xóa đơn hàng này không?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const res = await shipmentApi.deleteShipment(id);
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
        { title: 'Mã đơn hàng', dataIndex: 'order_id', key: 'order_id' },
        { title: 'Nhà vận chuyển', dataIndex: 'shipping_provider_id', key: 'shipping_provider_id' },
        { title: 'Địa chỉ gửi', dataIndex: 'shipping_address_from_id', key: 'shipping_address_from_id' },
        { title: 'Địa chỉ nhận', dataIndex: 'shipping_address_to_id', key: 'shipping_address_to_id' },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: ShipmentStatus) => (
                <Tag className={`${styles.statusTag} ${styles[status]}`}>
                    {status === 'shipped' ? 'Đang vận chuyển' :
                        status === 'pending' ? 'Chờ xử lý' :
                            status === 'delivered' ? 'Đã giao' : 'Đã hủy'}
                </Tag>
            )
        },
        {
            title: 'Ngày dự kiến giao',
            dataIndex: 'estimated_delivery',
            key: 'estimated_delivery',
            render: (date: string) => moment(date).format('DD/MM/YYYY')
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_: any, record: Shipment) => (
                <Space>
                    <Button icon={<EyeOutlined />} size="small" className={styles.actionBtn} onClick={() => handleShowDetail(record)}>
                        Chi tiết
                    </Button>
                    <Button type="primary" icon={<EditOutlined />} size="small" className={styles.actionBtn} onClick={() => handleEdit(record)}>
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
            <Modal
                open={detailVisible}
                onCancel={() => setDetailVisible(false)}
                title="Chi tiết đơn hàng vận chuyển"
                footer={null}
            >
                {detail ? (
                    <div style={{ lineHeight: '2', fontSize: 15 }}>
                        <div><b>ID:</b> {detail.id}</div>
                        <div><b>Mã đơn hàng:</b> {detail.order_id}</div>
                        <div><b>Nhà vận chuyển:</b> {detail.shipping_provider_id}</div>
                        <div><b>Địa chỉ gửi:</b> {detail.shipping_address_from_id}</div>
                        <div><b>Địa chỉ nhận:</b> {detail.shipping_address_to_id}</div>
                        <div><b>Trạng thái:</b> <Tag color={
                            detail.status === 'shipped' ? 'blue' :
                                detail.status === 'pending' ? 'orange' :
                                    detail.status === 'delivered' ? 'green' : 'red'}>
                            {detail.status === 'shipped' ? 'Đang vận chuyển' :
                                detail.status === 'pending' ? 'Chờ xử lý' :
                                    detail.status === 'delivered' ? 'Đã giao' : 'Đã hủy'}
                        </Tag></div>
                        <div><b>Ngày dự kiến giao:</b> {moment(detail.estimated_delivery).format('DD/MM/YYYY')}</div>
                        <div><b>Ngày tạo:</b> {moment(detail.createdAt).format('DD/MM/YYYY HH:mm:ss')}</div>
                        <div><b>Ngày cập nhật:</b> {moment(detail.updatedAt).format('DD/MM/YYYY HH:mm:ss')}</div>
                    </div>
                ) : 'Đang tải...'}
            </Modal>
            <Modal
                open={editVisible}
                onCancel={() => setEditVisible(false)}
                title="Sửa đơn hàng vận chuyển"
                confirmLoading={editLoading}
                onOk={handleEditSubmit}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="order_id"
                        label="Mã đơn hàng"
                        rules={[
                            { required: true, message: 'Nhập mã đơn hàng' },
                            { type: 'number', message: 'Mã đơn hàng phải là số', transform: (value) => Number(value) }
                        ]}
                    >
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item
                        name="shipping_provider_id"
                        label="Nhà vận chuyển"
                        rules={[
                            { required: true, message: 'Nhập mã nhà vận chuyển' },
                            { type: 'number', message: 'Mã nhà vận chuyển phải là số', transform: (value) => Number(value) }
                        ]}
                    >
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item
                        name="shipping_address_from_id"
                        label="Địa chỉ gửi"
                        rules={[
                            { required: true, message: 'Nhập mã địa chỉ gửi' },
                            { type: 'number', message: 'Mã địa chỉ gửi phải là số', transform: (value) => Number(value) }
                        ]}
                    >
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item
                        name="shipping_address_to_id"
                        label="Địa chỉ nhận"
                        rules={[
                            { required: true, message: 'Nhập mã địa chỉ nhận' },
                            { type: 'number', message: 'Mã địa chỉ nhận phải là số', transform: (value) => Number(value) }
                        ]}
                    >
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Chọn trạng thái' }]}>
                        <Select>
                            {statusOptions.map(s => (
                                <Select.Option key={s} value={s}>
                                    {s === 'shipped' ? 'Đang vận chuyển' :
                                        s === 'pending' ? 'Chờ xử lý' :
                                            s === 'delivered' ? 'Đã giao' : 'Đã hủy'}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="estimated_delivery" label="Ngày dự kiến giao" rules={[{ required: true, message: 'Chọn ngày dự kiến giao' }]}>
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ShipmentList; 