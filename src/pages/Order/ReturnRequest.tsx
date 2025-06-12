import React, { useEffect, useState } from 'react';
import { Button, Table, Select, Modal, Form, Input, message, Space, Tag, Badge, Typography, Descriptions } from 'antd';
import { EyeOutlined, CheckCircleTwoTone, CloseCircleTwoTone, ClockCircleTwoTone } from '@ant-design/icons';
import returnRequestApi from '../../api/returnRequestApi';
import { ReturnRequest, ReturnRequestDetail } from '../../types/Order/returnRequest.types';
import dayjs from 'dayjs';
import './styles/ReturnRequest.module.scss';
import { Table as AntTable } from 'antd';

const { Option } = Select;
const { Title, Text } = Typography;

const statusOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'requested', label: 'Chờ phản hồi' },
    { value: 'accepted', label: 'Đã chấp nhận' },
    { value: 'rejected', label: 'Đã từ chối' },
];

const statusColor = (status: string) => {
    switch (status) {
        case 'requested': return 'warning';
        case 'accepted': return 'success';
        case 'rejected': return 'error';
        default: return 'default';
    }
};
const statusIcon = (status: string) => {
    switch (status) {
        case 'requested': return <ClockCircleTwoTone twoToneColor="#faad14" />;
        case 'accepted': return <CheckCircleTwoTone twoToneColor="#52c41a" />;
        case 'rejected': return <CloseCircleTwoTone twoToneColor="#ff4d4f" />;
        default: return null;
    }
};

const ReturnRequestPage: React.FC = () => {
    const [requests, setRequests] = useState<ReturnRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [actionModalVisible, setActionModalVisible] = useState(false);
    const [requestDetails, setRequestDetails] = useState<ReturnRequestDetail[]>([]);
    const [actionForm] = Form.useForm();
    const [actionType, setActionType] = useState<'accepted' | 'rejected' | null>(null);

    const fetchRequests = async (filterStatus: string = status) => {
        setLoading(true);
        try {
            const params: any = {};
            if (filterStatus) params.status = filterStatus;
            const res = await returnRequestApi.getList(params);
            if (res.ok && res.body && res.body.code === 0) {
                setRequests(res.body.data);
            } else {
                message.error(res.body?.message || 'Lỗi lấy danh sách yêu cầu hoàn trả');
            }
        } catch (e) {
            message.error('Lỗi lấy danh sách yêu cầu hoàn trả');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests(status);
        // eslint-disable-next-line
    }, [status]);

    const handleViewDetails = async (request: ReturnRequest) => {
        setSelectedRequest(request);
        setDetailModalVisible(true);
        setRequestDetails([]);
        try {
            const res = await returnRequestApi.getDetails(request.id);
            if (res.ok && res.body && res.body.code === 0 && Array.isArray(res.body.data)) {
                setRequestDetails(res.body.data);
            } else {
                setRequestDetails([]);
            }
        } catch {
            setRequestDetails([]);
        }
    };

    const handleAction = (type: 'accepted' | 'rejected', request: ReturnRequest) => {
        setSelectedRequest(request);
        setActionType(type);
        actionForm.resetFields();
        setActionModalVisible(true);
    };

    const handleActionSubmit = async () => {
        if (!selectedRequest || !actionType) return;
        try {
            setLoading(true);
            const values = await actionForm.validateFields();
            const res = await returnRequestApi.responseRequest(selectedRequest.id, {
                status: actionType,
                response_message: values.response_message,
            });
            if (res.ok && res.body.code === 0) {
                message.success('Phản hồi yêu cầu hoàn trả thành công');
                setActionModalVisible(false);
                fetchRequests();
            } else {
                message.error(res.body?.message || 'Phản hồi thất bại');
            }
        } catch {
            // do nothing
        } finally {
            setLoading(false);
        }
    };

    const handleResetFilters = () => {
        setStatus('');
        fetchRequests('');
    };

    const columns = [
        {
            title: 'STT',
            key: 'stt',
            align: 'center' as const,
            render: (_: any, __: ReturnRequest, index: number) => index + 1
        },
        { title: 'ID Đơn hàng', dataIndex: ['Order', 'id'], key: 'order_id', align: 'center' as const },
        { title: 'Số lượng', dataIndex: ['Order', 'total_quantity'], key: 'total_quantity', align: 'center' as const },
        { title: 'Tổng tiền', dataIndex: ['Order', 'final_total'], key: 'final_total', align: 'center' as const, render: (v: string) => `${Number(v).toLocaleString()}₫` },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center' as const,
            render: (v: string) => <Tag color={statusColor(v)} icon={statusIcon(v)}>{statusOptions.find(opt => opt.value === v)?.label || v}</Tag>
        },
        {
            title: 'Ngày yêu cầu',
            dataIndex: 'request_at',
            key: 'request_at',
            align: 'center' as const,
            render: (v: string) => dayjs(v).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center' as const,
            render: (_: any, record: ReturnRequest) => (
                <Space>
                    <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
                    {record.status === 'requested' && (
                        <>
                            <Button type="primary" onClick={() => handleAction('accepted', record)}>Chấp nhận</Button>
                            <Button danger onClick={() => handleAction('rejected', record)}>Từ chối</Button>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    // Tính tổng số lượng yêu cầu đang chờ
    const waitingCount = requests.filter(r => r.status === 'requested').length;

    return (
        <div className="return-request-page">
            <div className="header">
                <Title level={2} style={{ margin: 0 }}>
                    Quản lý yêu cầu hoàn trả
                    <Badge count={waitingCount} style={{ backgroundColor: '#faad14', marginLeft: 12 }} title="Yêu cầu chờ phản hồi" />
                </Title>
            </div>
            <div className="filters" style={{ marginBottom: 24, marginTop: 16 }}>
                <Space wrap>
                    <Select
                        style={{ width: 200 }}
                        value={status}
                        onChange={value => setStatus(value)}
                        placeholder="Trạng thái yêu cầu"
                        allowClear
                    >
                        {statusOptions.map(opt => (
                            <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                        ))}
                    </Select>
                    <Button onClick={handleResetFilters}>Làm mới</Button>
                </Space>
            </div>
            <AntTable
                columns={columns}
                dataSource={requests}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                style={{ marginTop: 24 }}
                bordered
                scroll={{ x: 'max-content' }}
            />

            {/* Modal xem chi tiết */}
            <Modal
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                title={
                    <span>
                        Chi tiết yêu cầu hoàn trả <b>#{selectedRequest?.id}</b>
                        <Tag color={statusColor(selectedRequest?.status || '')} style={{ marginLeft: 8 }}>
                            {statusOptions.find(opt => opt.value === selectedRequest?.status)?.label}
                        </Tag>
                    </span>
                }
                footer={null}
                width={700}
                bodyStyle={{ padding: 24 }}
            >
                {selectedRequest && (
                    <Descriptions
                        bordered
                        column={1}
                        size="middle"
                        style={{ marginBottom: 16 }}
                        labelStyle={{ width: 180 }}
                    >
                        <Descriptions.Item label="ID Đơn hàng">{selectedRequest.Order.id}</Descriptions.Item>
                        <Descriptions.Item label="Ngày yêu cầu">{dayjs(selectedRequest.request_at).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                        <Descriptions.Item label="Lý do">
                            <Text strong type="danger">{selectedRequest.reason}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Lời nhắn khách hàng">
                            <Text italic>{selectedRequest.customer_message}</Text>
                        </Descriptions.Item>
                        {selectedRequest.response_message && (
                            <Descriptions.Item label="Phản hồi của bạn">
                                <Text type={selectedRequest.status === 'accepted' ? 'success' : 'danger'}>{selectedRequest.response_message}</Text>
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                )}
                <Title level={5} style={{ marginBottom: 12 }}>Danh sách sản phẩm hoàn trả</Title>
                <AntTable
                    dataSource={requestDetails}
                    rowKey="id"
                    pagination={false}
                    columns={[
                        {
                            title: 'Ảnh',
                            dataIndex: 'product_url_image',
                            key: 'product_url_image',
                            align: 'center' as const,
                            render: (url: string) => <img src={url} alt="product" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, boxShadow: '0 2px 8px #eee' }} />
                        },
                        { title: 'Tên sản phẩm', dataIndex: 'product_name', key: 'product_name', align: 'center' as const },
                        { title: 'Giá', dataIndex: 'product_price', key: 'product_price', align: 'center' as const, render: (v: string) => `${Number(v).toLocaleString()}₫` },
                        { title: 'Số lượng', dataIndex: 'product_quantity', key: 'product_quantity', align: 'center' as const },
                    ]}
                    locale={{ emptyText: 'Không có sản phẩm nào' }}
                    size="small"
                    bordered
                />
            </Modal>

            {/* Modal phản hồi */}
            <Modal
                open={actionModalVisible}
                onCancel={() => setActionModalVisible(false)}
                title={actionType === 'accepted' ? `Chấp nhận yêu cầu #${selectedRequest?.id}` : `Từ chối yêu cầu #${selectedRequest?.id}`}
                onOk={handleActionSubmit}
                okText={actionType === 'accepted' ? 'Chấp nhận' : 'Từ chối'}
                cancelText="Hủy"
                confirmLoading={loading}
                bodyStyle={{ padding: 24 }}
            >
                <Form form={actionForm} layout="vertical">
                    <Form.Item
                        label="Lời nhắn phản hồi"
                        name="response_message"
                        rules={[{ required: true, message: 'Vui lòng nhập lời nhắn' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Nhập lời nhắn cho khách hàng" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ReturnRequestPage; 