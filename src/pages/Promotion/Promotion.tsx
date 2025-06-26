import React, { useEffect, useState } from 'react';
import { Table, Input, Spin, message, Card, Typography, Button, Modal, Popconfirm, Form, Select, DatePicker, InputNumber } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import promotionApi from '../../api/promotionApi';
import { Promotion, CatalogPromotion } from '../../types/Promotion';
import styles from './styles/Promotion.module.scss';
import StatusTabs from '../../components/Common/StatusTabs';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const PROMOTION_TYPES = [
    { value: 'percent', label: 'Phần trăm' },
    { value: 'fixed', label: 'Cố định' },
    { value: 'same_price', label: 'Đồng giá' },
];

const PromotionPage: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | undefined>(undefined);
    const [formLoading, setFormLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
    const [activePromotions, setActivePromotions] = useState<Promotion[]>([]);
    const [inactivePromotions, setInactivePromotions] = useState<Promotion[]>([]);
    const [catalogPromotions, setCatalogPromotions] = useState<CatalogPromotion[]>([]);
    const [form] = Form.useForm();

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const [activeRes, inactiveRes] = await Promise.all([
                promotionApi.getPromotions('active'),
                promotionApi.getPromotions('inactive'),
            ]);
            if (activeRes.ok && activeRes.body?.data) {
                setActivePromotions(activeRes.body.data);
            } else {
                setActivePromotions([]);
            }
            if (inactiveRes.ok && inactiveRes.body?.data) {
                setInactivePromotions(inactiveRes.body.data);
            } else {
                setInactivePromotions([]);
            }
        } catch (error) {
            setActivePromotions([]);
            setInactivePromotions([]);
            message.error('Không thể tải danh sách chương trình khuyến mãi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
        promotionApi.getCatalogPromotions().then(res => {
            if (res.ok && res.body?.data) setCatalogPromotions(res.body.data);
        });
    }, []);

    const handleAdd = () => {
        setEditingPromotion(undefined);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record: Promotion) => {
        setEditingPromotion(record);
        form.setFieldsValue({
            ...record,
            start_date: dayjs(record.start_date),
            end_date: dayjs(record.end_date),
        });
        setModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        setLoading(true);
        try {
            const res = await promotionApi.deletePromotion(id);
            if (res.ok && res.body?.code === 0) {
                message.success('Xóa chương trình khuyến mãi thành công');
                fetchPromotions();
            } else {
                message.error(res.body?.message || 'Xóa chương trình khuyến mãi thất bại');
            }
        } catch (error) {
            message.error('Xóa chương trình khuyến mãi thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values: any) => {
        setFormLoading(true);
        try {
            const sellerId = localStorage.getItem('store_id');
            if (!sellerId) throw new Error('Không tìm thấy seller_id');
            const data = {
                ...values,
                seller_id: sellerId,
                start_date: values.start_date.format('YYYY-MM-DD'),
                end_date: values.end_date.format('YYYY-MM-DD'),
            };
            let res;
            if (editingPromotion) {
                res = await promotionApi.updatePromotion(editingPromotion.id, data);
            } else {
                res = await promotionApi.addPromotion(data);
            }
            if (res.ok && res.body?.code === 0) {
                message.success(editingPromotion ? 'Cập nhật thành công' : 'Thêm thành công');
                setModalVisible(false);
                fetchPromotions();
            } else {
                message.error(res.body?.message || 'Lỗi thao tác');
            }
        } catch (error) {
            message.error('Lỗi thao tác');
        } finally {
            setFormLoading(false);
        }
    };

    const columns: ColumnsType<Promotion> = [
        {
            title: 'Tên chương trình',
            dataIndex: 'name',
            key: 'name',
            filteredValue: [searchText],
            onFilter: (value, record) => {
                return record.name.toLowerCase().includes(value.toString().toLowerCase());
            },
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => PROMOTION_TYPES.find(t => t.value === type)?.label || type,
        },
        {
            title: 'Giá trị',
            dataIndex: 'value',
            key: 'value',
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'start_date',
            key: 'start_date',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'end_date',
            key: 'end_date',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => status === 'active' ? 'Đang hoạt động' : 'Không hoạt động',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ marginRight: 8 }} />
                    <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(record.id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </>
            ),
        },
    ];

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    const statusTabs = [
        {
            key: 'active',
            label: 'Đang hoạt động',
            count: activePromotions.length,
            content: (
                <Spin spinning={loading && activeTab === 'active'}>
                    <Table
                        columns={columns}
                        dataSource={activePromotions}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} chương trình`,
                            className: styles.promotionPagination
                        }}
                        className={styles.promotionTable}
                    />
                </Spin>
            )
        },
        {
            key: 'inactive',
            label: 'Không hoạt động',
            count: inactivePromotions.length,
            content: (
                <Spin spinning={loading && activeTab === 'inactive'}>
                    <Table
                        columns={columns}
                        dataSource={inactivePromotions}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} chương trình`,
                            className: styles.promotionPagination
                        }}
                        className={styles.promotionTable}
                    />
                </Spin>
            )
        }
    ];

    return (
        <div className={styles.promotionPage}>
            <Card className={styles.promotionCard}>
                <div className={styles.promotionHeader}>
                    <div className={styles.promotionTitle}>
                        <Title level={2}>Quản lý chương trình khuyến mãi</Title>
                        <p className={styles.subtitle}>Danh sách các chương trình khuyến mãi</p>
                    </div>
                    <div className={styles.promotionSearch}>
                        <Input
                            placeholder="Tìm kiếm chương trình..."
                            prefix={<SearchOutlined />}
                            onChange={handleSearch}
                            allowClear
                            className={styles.searchInput}
                        />
                        <Button type="primary" icon={<PlusOutlined />} style={{ marginLeft: 16 }} onClick={handleAdd}>
                            Thêm chương trình
                        </Button>
                    </div>
                </div>
                <StatusTabs
                    tabs={statusTabs}
                    activeKey={activeTab}
                    onChange={setActiveTab as any}
                />
            </Card>
            <Modal
                visible={modalVisible}
                title={editingPromotion ? 'Cập nhật chương trình' : 'Thêm chương trình'}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                confirmLoading={formLoading}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ type: 'percent' }}
                >
                    <Form.Item
                        name="catalog_promotion_id"
                        label="Chọn chương trình mẫu"
                        rules={[{ required: true, message: 'Vui lòng chọn chương trình mẫu' }]}
                    >
                        <Select placeholder="Chọn chương trình mẫu" disabled={!!editingPromotion}>
                            {catalogPromotions.map(c => (
                                <Option value={c.id} key={c.id}>{c.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="type"
                        label="Loại khuyến mãi"
                        rules={[{ required: true, message: 'Vui lòng chọn loại khuyến mãi' }]}
                    >
                        <Select>
                            {PROMOTION_TYPES.map(t => (
                                <Option value={t.value} key={t.value}>{t.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="value"
                        label="Giá trị"
                        rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="start_date"
                        label="Ngày bắt đầu"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                    <Form.Item
                        name="end_date"
                        label="Ngày kết thúc"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                    {editingPromotion && (
                        <Form.Item
                            name="status"
                            label="Trạng thái"
                            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                        >
                            <Select>
                                <Option value="active">Đang hoạt động</Option>
                                <Option value="inactive">Không hoạt động</Option>
                            </Select>
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default PromotionPage; 