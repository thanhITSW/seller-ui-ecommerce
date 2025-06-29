import React, { useEffect, useState } from 'react';
import { Card, DatePicker, Row, Col, Spin, notification, Statistic } from 'antd';
import orderApi from '../../api/orderApi';
import { OrderStatistics } from '../../types/Order';
import dayjs from 'dayjs';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const { RangePicker } = DatePicker;

const OrderStatisticsPage: React.FC = () => {
    const [data, setData] = useState<OrderStatistics | null>(null);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<any>(null);

    const fetchData = async (params?: { startDate?: string; endDate?: string }) => {
        setLoading(true);
        try {
            const response = await orderApi.getOrderStatistics(params);
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

    const handleDateChange = (dates: any) => {
        setDateRange(dates);
        if (dates && dates.length === 2) {
            fetchData({
                startDate: dates[0].format('YYYY-MM-DD'),
                endDate: dates[1].format('YYYY-MM-DD'),
            });
        } else {
            fetchData();
        }
    };

    // Chart data
    const barData = {
        labels: ['Đơn hàng', 'Sản phẩm đã bán', 'Doanh thu', 'Hoàn tiền', 'Sản phẩm hoàn', 'Lợi nhuận'],
        datasets: [
            {
                label: 'Thống kê',
                data: data ? [
                    data.totalOrders,
                    data.totalProductsSold,
                    data.totalRevenue,
                    data.totalRefund,
                    data.totalProductsRefunded,
                    data.profit
                ] : [0, 0, 0, 0, 0, 0],
                backgroundColor: [
                    '#1890ff',
                    '#52c41a',
                    '#faad14',
                    '#ff4d4f',
                    '#b37feb',
                    '#13c2c2'
                ],
            },
        ],
    };

    const pieData = {
        labels: ['Doanh thu', 'Hoàn tiền', 'Lợi nhuận'],
        datasets: [
            {
                label: 'Tỷ lệ',
                data: data ? [data.totalRevenue, data.totalRefund, data.profit] : [0, 0, 0],
                backgroundColor: [
                    '#faad14',
                    '#ff4d4f',
                    '#13c2c2'
                ],
            },
        ],
    };

    return (
        <div className="order-page">
            <div className="header">
                <h1>Thống kê doanh thu đơn hàng</h1>
            </div>
            <div className="filters" style={{ marginBottom: 24 }}>
                <RangePicker
                    value={dateRange}
                    onChange={handleDateChange}
                    format="YYYY-MM-DD"
                    placeholder={["Từ ngày", "Đến ngày"]}
                />
            </div>
            <Spin spinning={loading}>
                <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                        <Card title="Tổng quan">
                            <Statistic title="Tổng đơn hàng" value={data?.totalOrders || 0} />
                            <Statistic title="Sản phẩm đã bán" value={data?.totalProductsSold || 0} />
                            <Statistic title="Tổng doanh thu" value={data ? data.totalRevenue.toLocaleString() + '₫' : '0₫'} />
                            <Statistic title="Tổng hoàn tiền" value={data ? data.totalRefund.toLocaleString() + '₫' : '0₫'} />
                            <Statistic title="Sản phẩm hoàn" value={data?.totalProductsRefunded || 0} />
                            <Statistic title="Lợi nhuận" value={data ? data.profit.toLocaleString() + '₫' : '0₫'} />
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <Card title="Biểu đồ cột">
                            <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <Card title="Tỷ lệ doanh thu/hoàn tiền/lợi nhuận">
                            <Pie data={pieData} options={{ responsive: true }} />
                        </Card>
                    </Col>
                </Row>
            </Spin>
        </div>
    );
};

export default OrderStatisticsPage; 