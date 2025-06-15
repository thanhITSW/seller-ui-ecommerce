import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Image, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { StorePaymentInfo } from '../../../types/WithdrawRequest';
import withdrawRequestApi from '../../../api/withdrawRequestApi';

interface StorePaymentInfoListProps {
    onAdd: () => void;
    onEdit: (info: StorePaymentInfo) => void;
    onDelete: (id: string) => void;
    reloadKey: number;
}

const methodTypeLabel: Record<string, string> = {
    bank_transfer: 'Chuyển khoản ngân hàng',
    momo: 'Momo',
    zalopay: 'ZaloPay',
};

const StorePaymentInfoList: React.FC<StorePaymentInfoListProps> = ({ onAdd, onEdit, onDelete, reloadKey }) => {
    const [data, setData] = useState<StorePaymentInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [qrPreview, setQrPreview] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await withdrawRequestApi.getStorePaymentInfos('1');
            if (res.ok && res.body?.code === 0) {
                setData(res.body.data);
            } else {
                message.error(res.body?.message || 'Lỗi khi lấy danh sách phương thức nhận tiền');
            }
        } catch (e) {
            message.error('Lỗi khi lấy danh sách phương thức nhận tiền');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [reloadKey]);

    const columns = [
        { title: 'Loại phương thức', dataIndex: 'method_type', key: 'method_type', render: (v: string) => methodTypeLabel[v] || v },
        { title: 'Số tài khoản/ĐT', dataIndex: 'account_number', key: 'account_number' },
        { title: 'Chủ tài khoản', dataIndex: 'account_name', key: 'account_name' },
        { title: 'Ngân hàng', dataIndex: 'bank_name', key: 'bank_name', render: (v: string | null) => v || '-' },
        { title: 'QR code', dataIndex: 'qr_code_url', key: 'qr_code_url', render: (url: string | null) => url ? <Image width={40} src={url} preview={{ visible: false }} onClick={() => setQrPreview(url)} style={{ cursor: 'pointer' }} /> : '-' },
        { title: 'Mặc định', dataIndex: 'is_default', key: 'is_default', render: (v: boolean) => v ? <Tag color="green">Mặc định</Tag> : null },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_: any, record: StorePaymentInfo) => (
                <Space>
                    <Button icon={<EditOutlined />} size="small" onClick={() => onEdit(record)}>Sửa</Button>
                    <Button icon={<DeleteOutlined />} size="small" danger onClick={() => onDelete(record.id)}>Xóa</Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }} onClick={onAdd}>Thêm phương thức</Button>
            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                pagination={false}
            />
            <Modal open={!!qrPreview} footer={null} onCancel={() => setQrPreview(null)}>
                {qrPreview && <Image src={qrPreview} width={300} />}
            </Modal>
        </div>
    );
};

export default StorePaymentInfoList; 