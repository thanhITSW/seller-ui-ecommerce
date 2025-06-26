import React, { useState, useEffect } from 'react';
import { Card, Typography, Select, Table, Button, InputNumber, Input, Popconfirm, notification } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import styles from './styles/Promotion.module.scss';
import StatusTabs from '../../components/Common/StatusTabs';
import promotionApi from '../../api/promotionApi';

const { Title } = Typography;
const { Option } = Select;

const ProductPromotionManager: React.FC = () => {
    const [promotionList, setPromotionList] = useState<any[]>([]);
    const [selectedPromotion, setSelectedPromotion] = useState<string | undefined>(undefined);
    const [promotionProducts, setPromotionProducts] = useState<any[]>([]);
    const [searchPromotion, setSearchPromotion] = useState('');
    const [searchAdd, setSearchAdd] = useState('');
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    // customDiscounts: { [productId]: { percent: number, price: number } }
    const [customDiscounts, setCustomDiscounts] = useState<Record<string, { percent?: number; price?: number }>>({});
    const [activeTab, setActiveTab] = useState('in-promotion');
    const [productsNotInPromotion, setProductsNotInPromotion] = useState<any[]>([]);
    const [selectedRowKeysTab1, setSelectedRowKeysTab1] = useState<string[]>([]);
    const [originalPromotionProducts, setOriginalPromotionProducts] = useState<any[]>([]); // Lưu bản gốc để so sánh khi lưu

    // Fetch promotions on mount
    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const res = await promotionApi.getPromotions('active');
                if (res.ok && res.body?.data) {
                    setPromotionList(res.body.data);
                    if (res.body.data.length > 0) {
                        setSelectedPromotion(res.body.data[0].id);
                    }
                }
            } catch (e) {
                setPromotionList([]);
            }
        };
        fetchPromotions();
    }, []);

    // Fetch products of selected promotion
    useEffect(() => {
        const fetchPromotionProducts = async () => {
            if (!selectedPromotion) return;
            try {
                const res = await promotionApi.getPromotionProducts(selectedPromotion);
                if (res.ok && res.body?.data) {
                    const mapped = res.body.data.map((item: any) => ({
                        ...item,
                        price: Number(item.retail_price),
                        discountPercent: item.promotion_value_percent,
                        discountPrice: item.actual_price,
                    }));
                    setPromotionProducts(mapped);
                    setOriginalPromotionProducts(mapped);
                } else {
                    setPromotionProducts([]);
                    setOriginalPromotionProducts([]);
                }
            } catch (e) {
                setPromotionProducts([]);
                setOriginalPromotionProducts([]);
            }
        };
        fetchPromotionProducts();
    }, [selectedPromotion]);

    // Fetch products not in promotion when tab2 active or selectedPromotion changes
    useEffect(() => {
        if (activeTab !== 'add-product' || !selectedPromotion) return;
        const fetchProductsNotInPromotion = async () => {
            try {
                const res = await promotionApi.getProductsNotInPromotion();
                if (res.ok && res.body?.data) {
                    // Lấy chương trình hiện tại
                    const promo = promotionList.find(p => p.id === selectedPromotion);
                    setProductsNotInPromotion(res.body.data.map((item: any) => {
                        let percent = 0;
                        let price = Number(item.retail_price);
                        if (promo) {
                            if (promo.type === 'percent') {
                                percent = Number(promo.value);
                                price = Math.round(Number(item.retail_price) * (1 - percent / 100));
                            } else if (promo.type === 'fixed') {
                                percent = Math.round((Number(promo.value) / Number(item.retail_price)) * 100 * 100) / 100;
                                price = Math.max(0, Number(item.retail_price) - Number(promo.value));
                            } else if (promo.type === 'same_price') {
                                price = Number(promo.value);
                                percent = Math.round((1 - price / Number(item.retail_price)) * 100 * 100) / 100;
                            }
                        }
                        const name = item.name ?? '';
                        return {
                            ...item,
                            name,
                            price: Number(item.retail_price),
                            discountPercent: percent,
                            discountPrice: price,
                        };
                    }));
                    console.log('productsNotInPromotion:', res.body.data);
                } else {
                    setProductsNotInPromotion([]);
                }
            } catch (e) {
                setProductsNotInPromotion([]);
            }
        };
        fetchProductsNotInPromotion();
    }, [activeTab, selectedPromotion, promotionList]);

    // Tab 1: Quản lý sản phẩm đã tham gia chương trình
    const filteredPromotionProducts = promotionProducts.filter(p =>
        p.name.toLowerCase().includes(searchPromotion.toLowerCase())
    );

    // Xử lý thay đổi discount theo % hoặc giá cụ thể cho sản phẩm đã tham gia
    const handleDiscountChange = (productId: string, value: number, type: 'percent' | 'price', price: number) => {
        setPromotionProducts(prev => prev.map(p => {
            if (p.id !== productId) return p;
            if (type === 'percent') {
                const discountPrice = Math.round(price * (1 - value / 100));
                return { ...p, discountPercent: value, discountPrice };
            } else {
                const percent = Math.round((1 - value / price) * 100 * 100) / 100;
                return { ...p, discountPercent: percent, discountPrice: value };
            }
        }));
    };

    const handleRemoveProduct = async (productId: string) => {
        if (!selectedPromotion) return;
        try {
            await promotionApi.removeProductFromPromotion(selectedPromotion, [productId]);
            const res2 = await promotionApi.getPromotionProducts(selectedPromotion);
            if (res2.ok && res2.body?.data) {
                const mapped = res2.body.data.map((item: any) => ({
                    ...item,
                    price: Number(item.retail_price),
                    discountPercent: item.promotion_value_percent,
                    discountPrice: item.actual_price,
                }));
                setPromotionProducts(mapped);
                setOriginalPromotionProducts(mapped);
            }
            notification.success({ message: 'Xóa sản phẩm thành công!' });
        } catch (e) {
            notification.error({ message: 'Xóa sản phẩm thất bại!' });
        }
    };

    // Tab 2: Thêm sản phẩm mới vào chương trình
    const filteredAddProducts = productsNotInPromotion.filter(p =>
        (p.name?.toLowerCase() || '').includes(searchAdd.toLowerCase())
    );

    // Xử lý thay đổi discount khi thêm mới
    const handleCustomDiscountChange = (productId: string, value: number, type: 'percent' | 'price', price: number) => {
        setCustomDiscounts(prev => {
            if (type === 'percent') {
                const discountPrice = Math.round(price * (1 - value / 100));
                return { ...prev, [productId]: { percent: value, price: discountPrice } };
            } else {
                const percent = Math.round((1 - value / price) * 100 * 100) / 100;
                return { ...prev, [productId]: { percent, price: value } };
            }
        });
    };

    // Thêm sản phẩm vào chương trình
    const handleAddProducts = async () => {
        if (!selectedPromotion) return;
        const product_ids = selectedProductIds;
        if (product_ids.length === 0) return;
        try {
            const res = await promotionApi.applyProductsToPromotion(selectedPromotion, product_ids);
            if (res.ok && res.body?.code === 0) {
                // 2. Nếu có custom giá, gọi tiếp customProductInPromotion cho từng sản phẩm
                const customEntries = Object.entries(customDiscounts).filter(([pid, val]) => val && (val.percent !== undefined || val.price !== undefined) && product_ids.includes(pid));
                const promo = promotionList.find(p => p.id === selectedPromotion);
                for (const [pid, val] of customEntries) {
                    let custom_value = 0;
                    if (promo) {
                        if (promo.type === 'percent') {
                            custom_value = val.percent ?? 0;
                        } else if (promo.type === 'fixed' || promo.type === 'same_price') {
                            if (promo.type === 'fixed') {
                                custom_value = Number(productsNotInPromotion.find(p => p.id === pid)?.price) - (val.price ?? 0);
                            } else {
                                custom_value = val.price ?? 0;
                            }
                        }
                    }
                    try {
                        await promotionApi.customProductInPromotion(selectedPromotion, [pid], custom_value);
                        notification.success({ message: `Tùy chỉnh giá cho sản phẩm ${pid} thành công!` });
                    } catch {
                        notification.error({ message: `Tùy chỉnh giá cho sản phẩm ${pid} thất bại!` });
                    }
                }
        setSelectedProductIds([]);
        setCustomDiscounts({});
        setActiveTab('in-promotion');
                const res2 = await promotionApi.getPromotionProducts(selectedPromotion);
                if (res2.ok && res2.body?.data) {
                    setPromotionProducts(res2.body.data.map((item: any) => ({
                        ...item,
                        price: Number(item.retail_price),
                        discountPercent: item.promotion_value_percent,
                        discountPrice: item.actual_price,
                    })));
                }
                notification.success({ message: 'Thêm sản phẩm vào chương trình thành công!' });
            } else {
                notification.error({ message: 'Thêm sản phẩm vào chương trình thất bại!' });
            }
        } catch (e) {
            notification.error({ message: 'Thêm sản phẩm vào chương trình thất bại!' });
        }
    };

    // Lưu thay đổi custom giá
    const handleSaveChanges = async () => {
        if (!selectedPromotion) return;
        const changed = promotionProducts.filter(p => {
            const orig = originalPromotionProducts.find(o => o.id === p.id);
            return orig && (p.discountPercent !== orig.discountPercent || p.discountPrice !== orig.discountPrice);
        });
        if (changed.length === 0) {
            notification.info({ message: 'Không có thay đổi nào để lưu.' });
            return;
        }
        const promo = promotionList.find(p => p.id === selectedPromotion);
        try {
            for (const p of changed) {
                let custom_value = 0;
                if (promo) {
                    if (promo.type === 'percent') {
                        custom_value = p.discountPercent;
                    } else if (promo.type === 'fixed') {
                        custom_value = p.price - p.discountPrice;
                    } else if (promo.type === 'same_price') {
                        custom_value = p.discountPrice;
                    }
                }
                await promotionApi.customProductInPromotion(selectedPromotion, [p.id], custom_value);
            }
            const res2 = await promotionApi.getPromotionProducts(selectedPromotion);
            if (res2.ok && res2.body?.data) {
                const mapped = res2.body.data.map((item: any) => ({
                    ...item,
                    price: Number(item.retail_price),
                    discountPercent: item.promotion_value_percent,
                    discountPrice: item.actual_price,
                }));
                setPromotionProducts(mapped);
                setOriginalPromotionProducts(mapped);
            }
            notification.success({ message: 'Lưu thay đổi thành công!' });
        } catch (e) {
            notification.error({ message: 'Lưu thay đổi thất bại!' });
        }
    };

    // Xóa hàng loạt
    const handleBulkRemoveProducts = async () => {
        if (!selectedPromotion || selectedRowKeysTab1.length === 0) return;
        try {
            await promotionApi.removeProductFromPromotion(selectedPromotion, selectedRowKeysTab1);
            const res2 = await promotionApi.getPromotionProducts(selectedPromotion);
            if (res2.ok && res2.body?.data) {
                const mapped = res2.body.data.map((item: any) => ({
                    ...item,
                    price: Number(item.retail_price),
                    discountPercent: item.promotion_value_percent,
                    discountPrice: item.actual_price,
                }));
                setPromotionProducts(mapped);
                setOriginalPromotionProducts(mapped);
            }
            setSelectedRowKeysTab1([]);
            notification.success({ message: 'Xóa sản phẩm thành công!' });
        } catch (e) {
            notification.error({ message: 'Xóa sản phẩm thất bại!' });
        }
    };

    // Table columns for products in promotion
    const promotionColumns = [
        { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
        { title: 'Giá gốc', dataIndex: 'price', key: 'price', render: (v: number) => v.toLocaleString() + '₫' },
        {
            title: 'Giảm (%)',
            dataIndex: 'discountPercent',
            key: 'discountPercent',
            render: (percent: number, record: any) => (
                <InputNumber
                    min={0}
                    max={100}
                    value={percent}
                    onChange={val => handleDiscountChange(record.id, val as number, 'percent', record.price)}
                    style={{ width: 80 }}
                />
            )
        },
        {
            title: 'Giá sau giảm',
            dataIndex: 'discountPrice',
            key: 'discountPrice',
            render: (discountPrice: number, record: any) => (
                <InputNumber
                    min={0}
                    max={record.price}
                    value={discountPrice}
                    onChange={val => handleDiscountChange(record.id, val as number, 'price', record.price)}
                    style={{ width: 120 }}
                />
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: any) => (
                <Popconfirm title="Xóa sản phẩm khỏi chương trình?" onConfirm={() => handleRemoveProduct(record.id)}>
                    <Button icon={<DeleteOutlined />} danger size="small" />
                </Popconfirm>
            ),
        },
    ];

    // Table columns for selecting products to add
    const addColumns = [
        { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
        { title: 'Giá gốc', dataIndex: 'price', key: 'price', render: (v: number) => v.toLocaleString() + '₫' },
        {
            title: 'Giảm (%)',
            key: 'customDiscountPercent',
            render: (_: any, record: any) => (
                <InputNumber
                    min={0}
                    max={100}
                    value={customDiscounts[record.id]?.percent ?? record.discountPercent}
                    onChange={val => handleCustomDiscountChange(record.id, val as number, 'percent', record.price)}
                    style={{ width: 80 }}
                    disabled={!selectedProductIds.includes(record.id)}
                />
            ),
        },
        {
            title: 'Giá sau giảm',
            key: 'customDiscountPrice',
            render: (_: any, record: any) => (
                <InputNumber
                    min={0}
                    max={record.price}
                    value={customDiscounts[record.id]?.price ?? record.discountPrice}
                    onChange={val => handleCustomDiscountChange(record.id, val as number, 'price', record.price)}
                    style={{ width: 120 }}
                    disabled={!selectedProductIds.includes(record.id)}
                />
            ),
        },
    ];

    // StatusTabs data
    const statusTabs = [
        {
            key: 'in-promotion',
            label: 'Sản phẩm trong chương trình',
            count: promotionProducts.length,
            content: (
                <>
                    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Input
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchPromotion}
                            onChange={e => setSearchPromotion(e.target.value)}
                            style={{ width: 300 }}
                            allowClear
                        />
                        <div>
                            {selectedRowKeysTab1.length > 0 && (
                                <Button danger style={{ marginRight: 8 }} onClick={handleBulkRemoveProducts}>
                                    Xóa hàng loạt
                                </Button>
                            )}
                            <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveChanges}>Lưu thay đổi</Button>
                        </div>
                    </div>
                    <Table
                        rowSelection={{
                            type: 'checkbox',
                            selectedRowKeys: selectedRowKeysTab1,
                            onChange: (selectedRowKeys) => setSelectedRowKeysTab1(selectedRowKeys as string[]),
                        }}
                        columns={promotionColumns}
                        dataSource={filteredPromotionProducts}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        className={styles.promotionTable}
                    />
                </>
            )
        },
        {
            key: 'add-product',
            label: 'Thêm sản phẩm',
            count: filteredAddProducts.length,
            content: (
                <>
                    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Input
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchAdd}
                            onChange={e => setSearchAdd(e.target.value)}
                            style={{ width: 300 }}
                            allowClear
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            disabled={selectedProductIds.length === 0}
                            onClick={handleAddProducts}
                        >
                            Thêm vào chương trình
                        </Button>
                    </div>
                    <Table
                        rowSelection={{
                            type: 'checkbox',
                            selectedRowKeys: selectedProductIds,
                            onChange: (selectedRowKeys) => setSelectedProductIds(selectedRowKeys as string[]),
                        }}
                        columns={addColumns}
                        dataSource={filteredAddProducts}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        className={styles.promotionTable}
                    />
                </>
            )
        }
    ];

    return (
        <div className={styles.promotionPage}>
            <Card className={styles.promotionCard}>
                <div className={styles.promotionHeader}>
                    <div className={styles.promotionTitle}>
                        <Title level={3}>Quản lý sản phẩm trong chương trình khuyến mãi</Title>
                        <p className={styles.subtitle}>Thêm, xóa, chỉnh giá trị giảm giá cho từng sản phẩm</p>
                    </div>
                    <div style={{ minWidth: 240 }}>
                        <Select
                            value={selectedPromotion}
                            onChange={setSelectedPromotion}
                            style={{ width: '100%' }}
                        >
                            {promotionList.map(p => (
                                <Option value={p.id} key={p.id}>{p.name}</Option>
                            ))}
                        </Select>
                    </div>
                </div>
                <StatusTabs
                    tabs={statusTabs}
                    activeKey={activeTab}
                    onChange={setActiveTab}
                />
            </Card>
        </div>
    );
};

export default ProductPromotionManager; 