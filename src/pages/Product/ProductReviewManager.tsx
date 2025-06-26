import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Tag, Image, Rate, Modal, Input, Space, Tooltip, Row, Col, Statistic, Tabs, Checkbox, DatePicker, Spin, notification, Upload } from 'antd';
import { MessageOutlined, CopyOutlined, UserOutlined, ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined, UploadOutlined, CheckCircleTwoTone } from '@ant-design/icons';
import { ProductReview } from '../../types/Product';
import styles from '../../styles/Product/ProductReviewManager.module.scss';
import StatusTabs from '../../components/Common/StatusTabs';
import productApi from '../../api/productApi';
import useLocalStorage from '../../hooks/useLocalStorage';

const { Title, Paragraph, Link } = Typography;
const { RangePicker } = DatePicker;

const tabKeys = [
    { key: 'all', label: 'Tất cả' },
    { key: 'need_reply', label: 'Cần phản hồi' },
    { key: 'replied', label: 'Đã trả lời' },
];

const ProductReviewManager: React.FC = () => {
    const [replyModal, setReplyModal] = useState<{ open: boolean; review?: ProductReview }>({ open: false });
    const [reply, setReply] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'need_reply' | 'replied'>('all');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [reviewsWithResponse, setReviewsWithResponse] = useState<ProductReview[]>([]);
    const [reviewsWithoutResponse, setReviewsWithoutResponse] = useState<ProductReview[]>([]);
    const [starOptions, setStarOptions] = useState<any[]>([]);
    const [filter, setFilter] = useState<{ rating: number[]; search: string; dateRange: any }>({ rating: [1, 2, 3, 4, 5], search: '', dateRange: null });
    const [tempRating, setTempRating] = useState<(number)[]>([1, 2, 3, 4, 5]);
    const [tempSearch, setTempSearch] = useState('');
    const [tempDateRange, setTempDateRange] = useState<any>(null);
    const [replyImage, setReplyImage] = useState<any[]>([]);

    const seller_id = localStorage.getItem('store_id') || '';

    const fetchData = async (paramsOverride?: any) => {
        setLoading(true);
        try {
            const params: any = { seller_id };
            const rating = paramsOverride?.rating ?? filter.rating;
            const search = paramsOverride?.search ?? filter.search;
            const dateRange = paramsOverride?.dateRange ?? filter.dateRange;
            if (rating && rating.length > 0 && rating.length < 5) {
                params.rating = rating.join(',');
            }
            if (rating && rating.length === 5) {
                if (params.rating) delete params.rating;
            }
            if (search) params.search = search;
            if (dateRange && dateRange.length === 2) {
                params.from_date = dateRange[0].format('YYYY-MM-DD');
                params.to_date = dateRange[1].format('YYYY-MM-DD');
            }
            const res = await productApi.getReviewStats(params);
            if (res.body && res.body.code === 0) {
                setStats(res.body.stats);
                setReviewsWithResponse(res.body.data.reviewsWithResponse);
                setReviewsWithoutResponse(res.body.data.reviewsWithoutResponse);
                const starCount = res.body.stats.starCount || {};
                const total = res.body.stats.totalReviews || 0;
                setStarOptions([
                    { label: 'Tất cả', value: 'all', count: total },
                    ...[5, 4, 3, 2, 1].map(star => ({ label: `${star} Sao`, value: star, count: starCount[star] || 0 }))
                ]);
            } else {
                notification.error({ message: 'Lỗi', description: res.body?.message || 'Không thể tải dữ liệu' });
            }
        } catch (err: any) {
            notification.error({ message: 'Lỗi', description: err.message || 'Không thể tải dữ liệu' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [seller_id]);

    const handleStarChange = (checkedValues: any[]) => {
        if (checkedValues.includes('all')) {
            setTempRating([1, 2, 3, 4, 5]);
        } else {
            setTempRating(checkedValues as number[]);
        }
    };

    const handleSearch = () => {
        setFilter({ rating: tempRating, search: tempSearch, dateRange: tempDateRange });
        fetchData({ rating: tempRating, search: tempSearch, dateRange: tempDateRange });
    };

    const handleReset = () => {
        setTempRating([1, 2, 3, 4, 5]);
        setTempSearch('');
        setTempDateRange(null);
        setFilter({ rating: [1, 2, 3, 4, 5], search: '', dateRange: null });
        fetchData({ rating: [1, 2, 3, 4, 5], search: '', dateRange: null });
    };

    let filteredReviews: ProductReview[] = [];
    if (activeTab === 'all') {
        filteredReviews = [...reviewsWithResponse, ...reviewsWithoutResponse];
    } else if (activeTab === 'need_reply') {
        filteredReviews = reviewsWithoutResponse;
    } else if (activeTab === 'replied') {
        filteredReviews = reviewsWithResponse;
    }

    const statusTabData = [
        { key: 'all', label: 'Tất cả', count: (reviewsWithResponse.length + reviewsWithoutResponse.length) },
        { key: 'need_reply', label: 'Cần phản hồi', count: reviewsWithoutResponse.length },
        { key: 'replied', label: 'Đã trả lời', count: reviewsWithResponse.length },
    ];

    const handleReply = async () => {
        if (!replyModal.review) return;
        if (!reply.trim()) {
            notification.warning({ message: 'Vui lòng nhập nội dung phản hồi' });
            return;
        }
        const localStore = JSON.parse(localStorage.getItem('store') || '{}');
        const seller_name = localStore.name || '';
        setLoading(true);
        try {
            // Chuẩn bị FormData với nhiều ảnh
            const formData = new FormData();
            formData.append('seller_name', seller_name);
            formData.append('response_comment', reply);
            replyImage.forEach((fileObj: any) => {
                if (fileObj.originFileObj) {
                    formData.append('image_related', fileObj.originFileObj);
                }
            });
            const res = await productApi.responseReview(
                replyModal.review.id,
                formData
            );
            if (res.body && res.body.code === 0) {
                notification.success({ message: 'Phản hồi đánh giá thành công' });
                setReply('');
                setReplyImage([]);
                setReplyModal({ open: false });
                fetchData();
            } else {
                notification.error({ message: 'Lỗi', description: res.body?.message || 'Phản hồi đánh giá thất bại' });
            }
        } catch (err: any) {
            notification.error({ message: 'Lỗi', description: err.message || 'Phản hồi đánh giá thất bại' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles['product-review-page']}>
            <div className={styles.header}>
                <Title level={2}>Quản lý đánh giá sản phẩm</Title>
            </div>
            <Spin spinning={loading}>
                <Card bordered={false} style={{ marginBottom: 24 }} bodyStyle={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div>
                            <span style={{ fontWeight: 600, fontSize: 20 }}>Đánh Giá Shop </span>
                            <span style={{ color: '#ff4d4f', fontWeight: 600, fontSize: 22 }}>{stats ? (stats.goodReviewRatio * 5).toFixed(1) : '--'}</span>
                            <span style={{ color: '#888', fontSize: 16 }}>/5</span>
                        </div>
                        <div style={{ color: '#888', fontSize: 15, fontWeight: 400 }}>
                            {filter.dateRange && filter.dateRange.length === 2 ? (
                                <>Từ {filter.dateRange[0].format('DD-MM-YYYY')} đến {filter.dateRange[1].format('DD-MM-YYYY')}</>
                            ) : 'Tất cả thời gian'}
                        </div>
                    </div>
                    <Row gutter={24} style={{ marginTop: 18 }}>
                        <Col xs={24} md={8}>
                            <Card size="small" bordered={false} style={{ background: '#fafbfc' }}>
                                <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 2 }}>
                                    Tổng lượt đánh giá <InfoCircleOutlined style={{ color: '#aaa', fontSize: 14, marginLeft: 4 }} />
                                </div>
                                <div style={{ fontSize: 32, fontWeight: 600 }}>{stats ? stats.totalReviews : '--'}</div>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card size="small" bordered={false} style={{ background: '#fafbfc' }}>
                                <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 2 }}>
                                    Tỷ lệ đánh giá đơn hàng <InfoCircleOutlined style={{ color: '#aaa', fontSize: 14, marginLeft: 4 }} />
                                </div>
                                <div style={{ fontSize: 32, fontWeight: 600 }}>{stats ? Math.round(stats.reviewRate * 100) : '--'}%</div>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card size="small" bordered={false} style={{ background: '#fafbfc' }}>
                                <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 2 }}>
                                    Tỷ lệ đánh giá tốt <InfoCircleOutlined style={{ color: '#aaa', fontSize: 14, marginLeft: 4 }} />
                                </div>
                                <div style={{ fontSize: 32, fontWeight: 600 }}>{stats ? Math.round(stats.goodReviewRatio * 100) : '--'}%</div>
                            </Card>
                        </Col>
                    </Row>
                    <Row gutter={24} style={{ marginTop: 8 }}>
                        <Col xs={24} md={12}>
                            <Card size="small" bordered={false} style={{ background: '#f6f7fa' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <span style={{ fontWeight: 500, fontSize: 15 }}>Đánh giá tiêu cực cần phản hồi</span>
                                    </div>
                                    <div>
                                        <span style={{ color: '#ff4d4f', fontWeight: 600, fontSize: 22 }}>{stats ? stats.badReviewsNoResponse : '--'}</span>
                                    </div>
                                </div>
                                <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>Các đánh giá có 1 & 2 sao cần bạn phản hồi</div>
                            </Card>
                        </Col>
                        <Col xs={24} md={12}>
                            <Card size="small" bordered={false} style={{ background: '#f6f7fa' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <span style={{ fontWeight: 500, fontSize: 15 }}>Đánh giá hôm nay</span>
                                    </div>
                                    <div>
                                        <span style={{ color: '#faad14', fontWeight: 600, fontSize: 22 }}>{stats ? stats.todayReviews : '--'}</span>
                                    </div>
                                </div>
                                <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>Đánh giá mới được cập nhật trong ngày</div>
                            </Card>
                        </Col>
                    </Row>
                </Card>
                <h3 style={{ margin: '0 0 18px 0', fontWeight: 600, fontSize: 18 }}>Đánh giá của </h3>
                <div className={styles.reviewFilter} style={{ marginBottom: 24 }}>
                    <StatusTabs
                        tabs={statusTabData.map(tab => ({ ...tab, content: null }))}
                        activeKey={activeTab}
                        onChange={key => setActiveTab(key as any)}
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20, margin: '18px 0 12px 0' }}>
                        <Checkbox.Group
                            options={starOptions.map(opt => ({
                                label: `${opt.label} (${opt.count})`,
                                value: opt.value,
                                defaultChecked: true,
                            }))}
                            value={tempRating.length === 5 ? ['all'] : tempRating}
                            onChange={handleStarChange}
                            style={{ display: 'flex', gap: 12 }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 12 }}>
                        <Input
                            placeholder="Tên Sản Phẩm, Mã Đơn Hàng, Tên đăng nhập người mua"
                            style={{ width: 320, maxWidth: '100%' }}
                            value={tempSearch}
                            onChange={e => setTempSearch(e.target.value)}
                            allowClear
                        />
                        <RangePicker
                            style={{ minWidth: 220 }}
                            placeholder={["Thời gian đánh giá", "Chọn thời gian"]}
                            value={tempDateRange}
                            onChange={setTempDateRange}
                            allowClear
                        />
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <Button type="primary" style={{ background: '#ff4d4f', borderColor: '#ff4d4f', minWidth: 110 }} onClick={handleSearch}>Tìm kiếm</Button>
                        <Button style={{ minWidth: 90 }} onClick={handleReset}>Đặt lại</Button>
                    </div>
                </div>
                <div className={styles.reviewList}>
                    {filteredReviews.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#888', padding: 32 }}>Không có đánh giá nào phù hợp.</div>
                    ) : filteredReviews.map((review) => (
                        <Card key={review.id} className={styles.reviewCard} bordered={false}>
                            <div className={styles.reviewRow}>
                                <div className={styles.userCol}>
                                    <Space align="start" size={8}>
                                        <Image
                                            src={'https://ui-avatars.com/api/?name=' + encodeURIComponent(review.user_fullname)}
                                            width={32}
                                            height={32}
                                            preview={false}
                                            style={{ borderRadius: '50%', background: '#f5f5f5' }}
                                            fallback="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkVZoGW3vdRhfccLRhRbX_7DjzBqF0w6SB5g&s"
                                        />
                                        <div>
                                            <b>{review.user_fullname}</b>
                                            <div style={{ fontSize: 13, color: '#888' }}>
                                                ID đơn hàng: {' '}
                                                <Tooltip title="Sao chép ID">
                                                    <span style={{ marginRight: 4 }}>{review.order_id}</span>
                                                    <CopyOutlined style={{ fontSize: 13, cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(review.order_id)} />
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </Space>
                                </div>
                                <div className={styles.productCol}>
                                    <Space align="start" size={12}>
                                        <Image src={review.product_image} width={60} height={60} style={{ borderRadius: 4, objectFit: 'cover' }} />
                                        <div>
                                            <Paragraph ellipsis={{ rows: 2, expandable: false }} style={{ marginBottom: 0, fontWeight: 500 }}>{review.product_name}</Paragraph>
                                        </div>
                                    </Space>
                                </div>
                                <div className={styles.contentCol}>
                                    <div style={{ marginBottom: 4 }}>
                                        <Rate disabled value={review.rating} style={{ color: '#faad14', fontSize: 18, verticalAlign: 'middle' }} />
                                    </div>
                                    <div style={{ fontSize: 15, marginBottom: 4 }}>{review.comment}</div>
                                    {review.url_images_related && review.url_images_related.length > 0 && (
                                        <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                                            {review.url_images_related.map((img, idx) => (
                                                <Image key={idx} src={img} width={60} height={60} style={{ borderRadius: 4, objectFit: 'cover' }} />
                                            ))}
                                        </div>
                                    )}
                                    <div style={{ fontSize: 13, color: '#888' }}>{new Date(review.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {new Date(review.createdAt).toLocaleDateString('vi-VN')}</div>
                                    {review.response_review && (
                                        <div style={{
                                            background: '#f6ffed',
                                            border: '1px solid #b7eb8f',
                                            borderRadius: 6,
                                            marginTop: 12,
                                            padding: 12,
                                            color: '#389e0d',
                                            fontSize: 15
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                                <CheckCircleTwoTone twoToneColor="#52c41a" style={{ marginRight: 6 }} />
                                                <b>Phản hồi của nhà bán:</b>
                                                <span style={{ marginLeft: 8, color: '#222' }}>{review.response_review.seller_name}</span>
                                            </div>
                                            <div style={{ color: '#222', marginBottom: 4 }}>{review.response_review.response_comment}</div>
                                            {review.response_review.url_image_related && (
                                                <Image src={review.response_review.url_image_related} width={60} height={60} style={{ borderRadius: 4, objectFit: 'cover', marginBottom: 4 }} />
                                            )}
                                            <div style={{ fontSize: 13, color: '#888' }}>{new Date(review.response_review.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {new Date(review.response_review.createdAt).toLocaleDateString('vi-VN')}</div>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.actionCol}>
                                    {review.response_review ? (
                                        <div style={{ color: '#52c41a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <CheckCircleTwoTone twoToneColor="#52c41a" /> Đã phản hồi
                                        </div>
                                    ) : (
                                        <Button
                                            icon={<MessageOutlined />}
                                            onClick={() => setReplyModal({ open: true, review })}
                                            style={{ minWidth: 80 }}
                                        >
                                            Trả lời
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
                <Modal
                    title="Trả lời đánh giá"
                    open={replyModal.open}
                    onCancel={() => { setReplyModal({ open: false }); setReplyImage([]); }}
                    onOk={handleReply}
                    okText="Gửi trả lời"
                    cancelText="Hủy"
                >
                    <Input.TextArea
                        rows={4}
                        placeholder="Nhập nội dung trả lời..."
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                    />
                    <div style={{ margin: '12px 0 0 0' }}>
                        <Upload
                            accept="image/*"
                            fileList={replyImage}
                            beforeUpload={() => false}
                            maxCount={10}
                            multiple
                            onChange={({ fileList }) => setReplyImage(fileList)}
                            listType="picture-card"
                        >
                            {replyImage.length < 10 && <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>}
                        </Upload>
                    </div>
                </Modal>
            </Spin>
        </div>
    );
};

export default ProductReviewManager; 