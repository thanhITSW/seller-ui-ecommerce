import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Select, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { WithdrawRequest, WithdrawRequestStatus } from '../../../types/WithdrawRequest';
import withdrawRequestApi from '../../../api/withdrawRequestApi';
import dayjs from 'dayjs';
import styles from '../styles/WithdrawRequest.module.scss';

const { Option } = Select;

const statusOptions: WithdrawRequestStatus[] = ['processing', 'completed', 'failed'];

interface WithdrawRequestListProps {
    loading: boolean;
    onCreate: () => void;
}

const WithdrawRequestList: React.FC<WithdrawRequestListProps> = ({ loading, onCreate }) => {
    const [data, setData] = useState<WithdrawRequest[]>([]);
    const [tableLoading, setTableLoading] = useState(false);
    const [status, setStatus] = useState<WithdrawRequestStatus | undefined>();
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const fetchData = async (page = 1, pageSize = 10) => {
        setTableLoading(true);
        try {
            const params: any = { page, limit: pageSize };
            if (status) params.status = status;
            const res = await withdrawRequestApi.getWithdrawRequests(params);
            if (res.ok && res.body?.code === 0) {
                setData(res.body.data.requests);
                setPagination({
                    current: res.body.data.currentPage,
                    pageSize,
                    total: res.body.data.total,
                });
            } else {
                message.error(res.body?.message || 'Lỗi khi lấy danh sách yêu cầu rút tiền');
            }
        } catch (e) {
            message.error('Lỗi khi lấy danh sách yêu cầu rút tiền');
        } finally {
            setTableLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [status]);

    const handleTableChange = (pagination: any) => {
        fetchData(pagination.current, pagination.pageSize);
    };

    const columns: ColumnsType<WithdrawRequest> = [
        { title: 'STT', key: 'stt', render: (_: any, __: any, idx: number) => idx + 1 },
        { title: 'Số tiền', dataIndex: 'amount', key: 'amount', render: (v) => v.toLocaleString() },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => <Tag className={styles.statusTag + ' ' + styles[status]}>{status}</Tag> },
        { title: 'Ngày tạo', dataIndex: 'createdAt', key: 'createdAt', render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm') },
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Select
                    allowClear
                    placeholder="Trạng thái"
                    style={{ width: 150 }}
                    onChange={setStatus}
                >
                    {statusOptions.map(s => <Option key={s} value={s}>{s}</Option>)}
                </Select>
                <Button type="primary" onClick={onCreate}>Tạo yêu cầu rút tiền</Button>
            </Space>
            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={tableLoading || loading}
                pagination={pagination}
                onChange={handleTableChange}
            />
        </div>
    );
};

export default WithdrawRequestList; 