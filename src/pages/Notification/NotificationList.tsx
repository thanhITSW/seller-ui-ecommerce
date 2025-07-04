import React, { useEffect, useState } from 'react';
import { List, Spin, Button, Card, Tag, Typography, Row, Col, Empty } from 'antd';
import { CheckCircleOutlined, BellFilled } from '@ant-design/icons';
import { getNotifications, markNotificationAsRead } from '../../api/notificationApi';
import { useNavigate } from 'react-router-dom';
import { HttpResponse } from '../../types/http';

const { Title, Text } = Typography;

const NotificationList: React.FC = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await getNotifications() as unknown as HttpResponse<any>;
            setNotifications(res.body?.data || []);
        } catch (err) {
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await markNotificationAsRead(notificationId);
            fetchNotifications();
        } catch { }
    };

    return (
        <Row justify="center" style={{ minHeight: '100vh', background: '#f4f6fb', padding: '32px 0' }}>
            <Col xs={24} sm={20} md={16} lg={12} xl={10}>
                <Card
                    style={{ borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', minHeight: 500 }}
                    bodyStyle={{ padding: 0 }}
                >
                    <div style={{ padding: '32px 32px 16px 32px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <BellFilled style={{ fontSize: 32, color: '#1890ff' }} />
                        <Title level={2} style={{ margin: 0, color: '#222' }}>Tất cả thông báo</Title>
                    </div>
                    <div style={{ padding: 24 }}>
                        {loading ? (
                            <Spin style={{ width: '100%', margin: '40px 0' }} />
                        ) : notifications.length === 0 ? (
                            <Empty description="Không có thông báo nào" style={{ margin: '40px 0' }} />
                        ) : (
                            <List
                                itemLayout="vertical"
                                dataSource={notifications}
                                renderItem={item => (
                                    <Card
                                        key={item.id}
                                        style={{
                                            marginBottom: 18,
                                            borderRadius: 12,
                                            background: item.is_read ? '#fff' : 'linear-gradient(90deg, #e6f7ff 0%, #fff 100%)',
                                            boxShadow: item.is_read ? 'none' : '0 2px 8px rgba(24,144,255,0.08)',
                                            border: item.is_read ? '1px solid #f0f0f0' : '1.5px solid #1890ff33',
                                            transition: 'box-shadow 0.2s',
                                        }}
                                        bodyStyle={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}
                                        hoverable
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Text strong style={{ fontSize: 18, color: item.is_read ? '#222' : '#1890ff' }}>{item.title}</Text>
                                                {!item.is_read && <Tag color="blue" style={{ marginLeft: 8 }}>Mới</Tag>}
                                            </div>
                                            <div style={{ margin: '8px 0 4px 0', color: '#444', fontSize: 15 }}>{item.body}</div>
                                            <div style={{ fontSize: 13, color: '#888' }}>{item.created_at}</div>
                                        </div>
                                        {!item.is_read && (
                                            <Button
                                                type="text"
                                                icon={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: 22 }} />}
                                                title="Đánh dấu đã đọc"
                                                onClick={() => handleMarkAsRead(item.id)}
                                                style={{ marginLeft: 12 }}
                                            />
                                        )}
                                    </Card>
                                )}
                            />
                        )}
                        <div style={{ marginTop: 32, textAlign: 'center' }}>
                            <Button onClick={() => navigate(-1)} size="large" style={{ borderRadius: 8 }}>
                                Quay lại
                            </Button>
                        </div>
                    </div>
                </Card>
            </Col>
        </Row>
    );
};

export default NotificationList; 