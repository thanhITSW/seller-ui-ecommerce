import React, { useEffect, useState } from 'react';
import { Table, DatePicker, Input, Button, Image, Space, Spin, notification, Form } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import productApi from '../../api/productApi';
import { ProductStatistics } from '../../types/Product';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const ProductStatisticsPage: React.FC = () => {
    const [data, setData] = useState<ProductStatistics[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<{ startDate?: string; endDate?: string; seller_id?: string }>({});
    const [form] = Form.useForm();

    const fetchData = async (params?: { startDate?: string; endDate?: string; }) => {
        setLoading(true);
        try {
            const response = await productApi.getProductStatistics(params);
            if (response.ok && response.body?.code === 0) {
                setData(response.body.data);
            } else {
                notification.error({ message: 'Lỗi', description: response.body?.message || 'Không thể tải dữ liệu thống kê!' });
            }
        } catch (error) {
            notification.error({ message: 'Lỗi', description: 'Không thể tải dữ liệu thống kê!' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFilter = (values: any) => {
        const { dateRange, seller_id } = values;
        const params: { startDate?: string; endDate?: string; seller_id?: string } = {};
        if (dateRange && dateRange.length === 2) {
            params.startDate = dateRange[0].format('YYYY-MM-DD');
            params.endDate = dateRange[1].format('YYYY-MM-DD');
        }
        if (seller_id) params.seller_id = seller_id;
        setFilters(params);
        fetchData(params);
    };

    const columns: ColumnsType<ProductStatistics> = [
        {
            title: 'Hình ảnh',
            dataIndex: 'url_image',
            key: 'url_image',
            render: (url: string) => <Image src={url} alt="product" width={60} height={60} />,
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Giá nhập',
            dataIndex: 'import_price',
            key: 'import_price',
            render: (price: string) => `${Number(price).toLocaleString()}₫`,
        },
        {
            title: 'Giá bán lẻ',
            dataIndex: 'retail_price',
            key: 'retail_price',
            render: (price: string) => `${Number(price).toLocaleString()}₫`,
        },
        {
            title: 'Số lượng đã bán',
            dataIndex: 'quantity_sold',
            key: 'quantity_sold',
        },
        {
            title: 'Tổng giá vốn',
            dataIndex: 'cost',
            key: 'cost',
            render: (cost: number) => `${cost.toLocaleString()}₫`,
        },
        {
            title: 'Tổng doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (revenue: number) => `${revenue.toLocaleString()}₫`,
        },
        {
            title: 'Lợi nhuận',
            dataIndex: 'profit',
            key: 'profit',
            render: (profit: number) => `${profit.toLocaleString()}₫`,
        },
        {
            title: 'Biên lợi nhuận (%)',
            dataIndex: 'profit_margin',
            key: 'profit_margin',
            render: (margin: string) => `${margin}%`,
        },
    ];

    return (
        <div className="product-page">
            <div className="page-header">
                <h1>Thống kê sản phẩm đã bán</h1>
            </div>
            <Form
                form={form}
                layout="inline"
                onFinish={handleFilter}
                style={{ marginBottom: 16 }}
            >
                <Form.Item name="dateRange" label="Khoảng ngày">
                    <RangePicker allowClear format="YYYY-MM-DD" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">Lọc</Button>
                </Form.Item>
            </Form>
            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="product_id"
                    pagination={{ pageSize: 10 }}
                />
            </Spin>
        </div>
    );
};

export default ProductStatisticsPage; 