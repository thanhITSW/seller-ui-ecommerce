import React, { useEffect, useState } from 'react';
import { Table, DatePicker, Button, Image, Spin, notification, Form, Row, Col, Card, Statistic } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import productApi from '../../api/productApi';
import dayjs from 'dayjs';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { DollarOutlined, ShoppingCartOutlined, UserOutlined, ShoppingOutlined, RiseOutlined } from '@ant-design/icons';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const { RangePicker } = DatePicker;

type ProductStatistics = {
    product_id: string;
    name: string;
    url_image: string;
    import_price: string;
    retail_price: string;
    quantity_sold: number;
    cost: number;
    revenue: number;
    profit: number;
    profit_margin: string;
};

type ProductStatisticsOverview = {
    total_orders: number;
    total_customers: number;
    total_products_sold: number;
    total_revenue: number;
    total_profit: number;
    top_5_best_selling_products: Array<ProductStatistics>;
};

type ProductStatisticsAPIResponse = {
    code: number;
    message: string;
    data: ProductStatistics[];
    overview?: ProductStatisticsOverview;
};

const ProductStatisticsPage: React.FC = () => {
    const [data, setData] = useState<ProductStatistics[]>([]);
    const [overview, setOverview] = useState<ProductStatisticsOverview | null>(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const fetchData = async (params?: { startDate?: string; endDate?: string; }) => {
        setLoading(true);
        try {
            const response = await productApi.getProductStatistics(params) as { ok: boolean; body?: ProductStatisticsAPIResponse };
            if (response.ok && response.body?.code === 0) {
                setData(response.body.data);
                setOverview(response.body.overview as ProductStatisticsOverview);
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
        const { dateRange } = values;
        const params: { startDate?: string; endDate?: string; } = {};
        if (dateRange && dateRange.length === 2) {
            params.startDate = dateRange[0].format('YYYY-MM-DD');
            params.endDate = dateRange[1].format('YYYY-MM-DD');
        }
        fetchData(params);
    };

    // Bar chart data for top 5 best selling products
    const barData = overview?.top_5_best_selling_products ? {
        labels: overview.top_5_best_selling_products.map((p: any) => p.name),
        datasets: [
            {
                label: 'Số lượng đã bán',
                data: overview.top_5_best_selling_products.map((p: any) => p.quantity_sold),
                backgroundColor: '#1890ff',
            },
            {
                label: 'Doanh thu',
                data: overview.top_5_best_selling_products.map((p: any) => p.revenue),
                backgroundColor: '#52c41a',
                yAxisID: 'y1',
            }
        ]
    } : undefined;

    const barOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: 'Top 5 sản phẩm bán chạy nhất' },
        },
        scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Số lượng đã bán' } },
            y1: {
                beginAtZero: true,
                position: 'right' as const,
                grid: { drawOnChartArea: false },
                title: { display: true, text: 'Doanh thu (VNĐ)' },
            },
        },
    };

    const columns: ColumnsType<ProductStatistics> = [
        {
            title: 'Hình ảnh',
            dataIndex: 'url_image',
            key: 'url_image',
            render: (url: string) => <Image src={url} alt="product" width={60} height={60} style={{ borderRadius: 8, boxShadow: '0 2px 8px #eee' }} />,
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (name: string) => <b>{name}</b>,
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
            render: (q: number) => <span style={{ color: '#1890ff', fontWeight: 600 }}>{q}</span>
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
            render: (revenue: number) => <span style={{ color: '#52c41a', fontWeight: 600 }}>{revenue.toLocaleString()}₫</span>,
        },
        {
            title: 'Lợi nhuận',
            dataIndex: 'profit',
            key: 'profit',
            render: (profit: number) => <span style={{ color: '#faad14', fontWeight: 600 }}>{profit.toLocaleString()}₫</span>,
        },
        {
            title: 'Biên lợi nhuận (%)',
            dataIndex: 'profit_margin',
            key: 'profit_margin',
            render: (margin: string) => <span style={{ color: '#b37feb' }}>{margin}%</span>,
        },
    ];

    return (
        <div className="product-page" style={{ background: '#f7f8fa', minHeight: '100vh', padding: 24 }}>
            <div className="page-header">
                <h1 style={{ fontWeight: 700, fontSize: 28, marginBottom: 16 }}>Thống kê sản phẩm đã bán</h1>
            </div>
            {/* Filter trên cùng */}
            <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 12px #eee' }}>
                <Form
                    form={form}
                    layout="inline"
                    onFinish={handleFilter}
                >
                    <Form.Item name="dateRange" label="Khoảng ngày">
                        <RangePicker allowClear format="YYYY-MM-DD" placeholder={["Từ ngày", "Đến ngày"]} style={{ minWidth: 240 }} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">Lọc</Button>
                    </Form.Item>
                </Form>
            </Card>
            {/* Tổng quan */}
            {overview && (
                <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} md={8} lg={4}>
                        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
                            <Statistic title="Tổng đơn hàng" value={overview.total_orders} prefix={<ShoppingCartOutlined />} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={4}>
                        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
                            <Statistic title="Tổng khách hàng" value={overview.total_customers} prefix={<UserOutlined />} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={4}>
                        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
                            <Statistic title="Tổng sản phẩm đã bán" value={overview.total_products_sold} prefix={<ShoppingOutlined />} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
                            <Statistic title="Tổng doanh thu" value={overview.total_revenue} suffix="₫" valueStyle={{ color: '#1890ff' }} prefix={<DollarOutlined />} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
                            <Statistic title="Tổng lợi nhuận" value={overview.total_profit} suffix="₫" valueStyle={{ color: '#faad14' }} prefix={<RiseOutlined />} />
                        </Card>
                    </Col>
                </Row>
            )}
            {/* Bar chart top 5 sản phẩm bán chạy */}
            {barData && (
                <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
                    <Bar data={barData} options={barOptions} height={300} />
                </Card>
            )}
            <Spin spinning={loading}>
                <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey="product_id"
                        pagination={{ pageSize: 10 }}
                    />
                </Card>
            </Spin>
        </div>
    );
};

export default ProductStatisticsPage; 