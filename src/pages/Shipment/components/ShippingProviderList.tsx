import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Table, Button, Space, Tag, message, Modal } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ShippingProvider } from '../../../types/Shipment';
import shipmentApi from '../../../api/shipmentApi';
import styles from '../styles/Shipment.module.scss';

interface ShippingProviderListProps {
    loading: boolean;
    onEdit: (provider: ShippingProvider) => void;
}

const ShippingProviderList = forwardRef<any, ShippingProviderListProps>(({ loading, onEdit }, ref) => {
    const [data, setData] = useState<ShippingProvider[]>([]);
    const [tableLoading, setTableLoading] = useState(false);

    const fetchData = async () => {
        setTableLoading(true);
        try {
            const res = await shipmentApi.getShippingProviders();
            if (res.ok && res.body?.code === 0) {
                setData(res.body.data || []);
            } else {
                message.error('Lỗi khi lấy danh sách đơn vị vận chuyển');
            }
        } catch (e) {
            message.error('Lỗi khi lấy danh sách đơn vị vận chuyển');
        } finally {
            setTableLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({ fetchData }));

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa đơn vị vận chuyển?',
            content: 'Bạn có chắc chắn muốn xóa đơn vị này không?',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    const res = await shipmentApi.deleteShippingProvider(id);
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
        { title: 'Tên đơn vị', dataIndex: 'name', key: 'name' },
        { title: 'Tracking URL', dataIndex: 'tracking_url', key: 'tracking_url', render: (url: string) => <a href={url} target="_blank" rel="noopener noreferrer">{url}</a> },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? 'Kích hoạt' : 'Ẩn'}</Tag> },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_: any, record: ShippingProvider) => (
                <Space>
                    <Button type="primary" icon={<EditOutlined />} size="small" className={styles.actionBtn} onClick={() => onEdit(record)}>
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
        </div>
    );
});

export default ShippingProviderList; 