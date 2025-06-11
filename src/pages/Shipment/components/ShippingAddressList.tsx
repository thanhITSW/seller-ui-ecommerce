import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Table, Button, Space, Tag, message, Modal, Form, Input } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { ShippingAddress } from '../../../types/Shipment';
import shipmentApi from '../../../api/shipmentApi';
import styles from '../styles/Shipment.module.scss';
import moment from 'moment';

interface ShippingAddressListProps {
    loading: boolean;
}

const ShippingAddressList = forwardRef<any, ShippingAddressListProps>(({ loading }, ref) => {
    const [data, setData] = useState<ShippingAddress[]>([]);
    const [tableLoading, setTableLoading] = useState(false);
    const [detail, setDetail] = useState<ShippingAddress | null>(null);
    const [detailVisible, setDetailVisible] = useState(false);
    const [editVisible, setEditVisible] = useState(false);
    const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setTableLoading(true);
        try {
            const res = await shipmentApi.getShippingAddresses();
            if (res.ok && res.body?.code === 0) {
                setData(res.body.data || []);
            } else {
                message.error('Lỗi khi lấy danh sách địa chỉ');
            }
        } catch (e) {
            message.error('Lỗi khi lấy danh sách địa chỉ');
        } finally {
            setTableLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({ fetchData }));

    useEffect(() => {
        fetchData();
    }, []);

    const handleShowDetail = async (record: ShippingAddress) => {
        try {
            const res = await shipmentApi.getShippingAddressById(record.id);
            if (res.ok && res.body?.code === 0) {
                setDetail(res.body.data);
                setDetailVisible(true);
            } else {
                message.error('Không lấy được chi tiết địa chỉ');
            }
        } catch (e) {
            message.error('Không lấy được chi tiết địa chỉ');
        }
    };

    const handleEdit = (record: ShippingAddress) => {
        setEditingAddress(record);
        setEditVisible(true);
        form.setFieldsValue(record);
    };

    const handleEditSubmit = async () => {
        try {
            const values = await form.validateFields();
            setEditLoading(true);
            const submitData = {
                ...editingAddress,
                ...values,
                user_id: editingAddress?.user_id,
                province_id: editingAddress?.province_id,
                district_id: editingAddress?.district_id,
                ward_code: editingAddress?.ward_code,
                is_default: editingAddress?.is_default,
            };
            const res = await shipmentApi.updateShippingAddress(Number(editingAddress!.id), submitData);
            if (res.ok && res.body?.code === 0) {
                message.success('Cập nhật thành công');
                setEditVisible(false);
                setEditingAddress(null);
                fetchData();
            } else {
                message.error(res.body?.message || 'Cập nhật thất bại');
            }
        } catch (e) {
            // validation error
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa địa chỉ?',
            content: 'Bạn có chắc chắn muốn xóa địa chỉ này không?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const res = await shipmentApi.deleteShippingAddress(id);
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
        { title: 'Tên địa chỉ', dataIndex: 'address_name', key: 'address_name' },
        { title: 'Người nhận', dataIndex: 'full_name', key: 'full_name' },
        // { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
        { title: 'Tỉnh/TP', dataIndex: 'province_name', key: 'province_name' },
        { title: 'Quận/Huyện', dataIndex: 'district_name', key: 'district_name' },
        { title: 'Phường/Xã', dataIndex: 'ward_name', key: 'ward_name' },
        // { title: 'Chi tiết', dataIndex: 'address_detail', key: 'address_detail' },
        { title: 'Mặc định', dataIndex: 'is_default', key: 'is_default', render: (val: boolean) => val ? <Tag color="green">Mặc định</Tag> : <Tag color="gray">-</Tag> },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_: any, record: ShippingAddress) => (
                <Space>
                    <Button icon={<EyeOutlined />} size="small" className={styles.actionBtn} onClick={() => handleShowDetail(record)}>
                        Chi tiết
                    </Button>
                    {/* <Button type="primary" icon={<EditOutlined />} size="small" className={styles.actionBtn} onClick={() => handleEdit(record)}>
                        Sửa
                    </Button> */}
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
                title="Chi tiết địa chỉ giao hàng"
                footer={null}
            >
                {detail ? (
                    <div style={{ lineHeight: '2', fontSize: 15 }}>
                        <div><b>ID:</b> {detail.id}</div>
                        <div><b>Tên địa chỉ:</b> {detail.address_name}</div>
                        <div><b>Người nhận:</b> {detail.full_name}</div>
                        <div><b>SĐT:</b> {detail.phone}</div>
                        <div><b>Tỉnh/TP:</b> {detail.province_name}</div>
                        <div><b>Quận/Huyện:</b> {detail.district_name}</div>
                        <div><b>Phường/Xã:</b> {detail.ward_name}</div>
                        <div><b>Chi tiết:</b> {detail.address_detail}</div>
                        <div><b>Mặc định:</b> <Tag color={detail.is_default ? 'green' : 'gray'}>{detail.is_default ? 'Có' : 'Không'}</Tag></div>
                        <div><b>Ngày tạo:</b> {moment(detail.createdAt).format('DD/MM/YYYY HH:mm:ss')}</div>
                        <div><b>Ngày cập nhật:</b> {moment(detail.updatedAt).format('DD/MM/YYYY HH:mm:ss')}</div>
                    </div>
                ) : 'Đang tải...'}
            </Modal>
            <Modal
                open={editVisible}
                onCancel={() => setEditVisible(false)}
                title="Sửa địa chỉ giao hàng"
                confirmLoading={editLoading}
                onOk={handleEditSubmit}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="address_name" label="Tên địa chỉ" rules={[{ required: true, message: 'Nhập tên địa chỉ' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="full_name" label="Người nhận" rules={[{ required: true, message: 'Nhập tên người nhận' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="SĐT" rules={[{ required: true, message: 'Nhập số điện thoại' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="province_name" label="Tỉnh/TP" rules={[{ required: true, message: 'Nhập tỉnh/thành phố' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="district_name" label="Quận/Huyện" rules={[{ required: true, message: 'Nhập quận/huyện' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="ward_name" label="Phường/Xã" rules={[{ required: true, message: 'Nhập phường/xã' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="address_detail" label="Chi tiết" rules={[{ required: true, message: 'Nhập địa chỉ chi tiết' }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
});

export default ShippingAddressList; 