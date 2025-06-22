import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, DatePicker, Spin, Upload, message, Card, Descriptions, Image } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import productApi from '../../../api/productApi';

interface CatalogProduct {
    id: string;
    name: string;
    brand: string;
    active_status: string;
    url_image: string;
    url_registration_license: string;
    product_type_id: string;
    category_id: string;
    product_details: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

interface AddProductFromCatalogFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (formData: FormData) => void;
    loading: boolean;
}

const AddProductFromCatalogForm: React.FC<AddProductFromCatalogFormProps> = ({
    visible,
    onCancel,
    onSubmit,
    loading
}) => {
    const [form] = Form.useForm();
    const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
    const [fetchingCatalog, setFetchingCatalog] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    // Fetch catalog products when modal opens
    useEffect(() => {
        if (visible) {
            fetchCatalogProducts();
            form.resetFields();
            setSelectedProduct(null);
            setFileList([]);
        }
    }, [visible, form]);

    const fetchCatalogProducts = async () => {
        setFetchingCatalog(true);
        try {
            const response = await productApi.getCatalogProducts();
            if (response.ok && response.body?.code === 0) {
                setCatalogProducts(response.body.data);
            } else {
                message.error('Không thể tải danh mục sản phẩm');
                setCatalogProducts([]);
            }
        } catch (error) {
            message.error('Không thể tải danh mục sản phẩm');
            setCatalogProducts([]);
        } finally {
            setFetchingCatalog(false);
        }
    };

    const handleProductSelect = (productId: string) => {
        const product = catalogProducts.find(p => p.id === productId);
        if (product) {
            setSelectedProduct(product);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Kiểm tra file upload
            if (!fileList.length || !fileList[0].originFileObj) {
                message.error('Vui lòng tải lên hóa đơn nhập hàng');
                return;
            }

            if (!selectedProduct) {
                message.error('Vui lòng chọn sản phẩm từ danh mục');
                return;
            }

            // Build return_policy object
            const return_policy = {
                is_returnable: values.is_returnable,
                return_period: values.return_period,
                is_exchangeable: values.is_exchangeable,
                return_conditions: values.return_conditions
            };

            const formData = new FormData();

            // Add catalog product ID
            formData.append('catalog_product_id', selectedProduct.id);

            // Add seller information from localStorage
            const sellerId = localStorage.getItem('store_id');
            const sellerName = JSON.parse(localStorage.getItem('store') || '{}').name;

            if (!sellerId || !sellerName) {
                message.error('Thông tin người bán không tìm thấy, vui lòng đăng nhập lại');
                return;
            }

            formData.append('seller_id', sellerId);
            formData.append('seller_name', sellerName);

            // Add form values
            formData.append('import_price', values.import_price);
            formData.append('retail_price', values.retail_price);
            formData.append('stock', values.stock);
            formData.append('return_policy', JSON.stringify(return_policy));

            // Add import date in YYYY-MM-DD format
            if (values.import_date) {
                formData.append('import_date', values.import_date.format('YYYY-MM-DD'));
            }

            // Add import invoice file - ĐÂY LÀ PHẦN QUAN TRỌNG
            formData.append('import_invoice', fileList[0].originFileObj);

            onSubmit(formData);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    // Xử lý upload file
    const handleUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
        setFileList(newFileList);
    };

    const beforeUpload = (file: File) => {
        const isImage = file.type.startsWith('image/');
        const isPDF = file.type === 'application/pdf';

        if (!isImage && !isPDF) {
            message.error('Bạn chỉ có thể tải lên file ảnh hoặc PDF!');
            return Upload.LIST_IGNORE;
        }

        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            message.error('File phải nhỏ hơn 10MB!');
            return Upload.LIST_IGNORE;
        }

        return false; // Prevent automatic upload
    };

    // Show product details card after selection
    const renderProductDetails = () => {
        if (!selectedProduct) return null;

        return (
            <Card
                title={<span style={{ fontSize: 16 }}>Thông tin sản phẩm đã chọn</span>}
                style={{ marginBottom: 20 }}
            >
                <div style={{ display: 'flex', marginBottom: 16 }}>
                    <Image
                        src={selectedProduct.url_image}
                        alt={selectedProduct.name}
                        width={100}
                        style={{ objectFit: 'cover', borderRadius: 4, marginRight: 16 }}
                    />
                    <div>
                        <h3 style={{ margin: '0 0 8px 0' }}>{selectedProduct.name}</h3>
                        <p style={{ margin: '0 0 4px 0' }}>Thương hiệu: {selectedProduct.brand}</p>
                        <p style={{ margin: '0' }}>Trạng thái: <span style={{ color: selectedProduct.active_status === 'active' ? '#52c41a' : '#faad14' }}>{selectedProduct.active_status}</span></p>
                    </div>
                </div>

                {selectedProduct.product_details && (
                    <Descriptions
                        size="small"
                        column={1}
                        bordered
                        title="Chi tiết sản phẩm"
                    >
                        {Object.entries(selectedProduct.product_details)
                            .filter(([key]) => ['Mô tả ngắn', 'Quy cách', 'Đơn vị tính', 'Dạng bào chế', 'Nhà sản xuất'].includes(key))
                            .map(([key, value]) => (
                                <Descriptions.Item key={key} label={key}>
                                    {typeof value === 'string' ? value : JSON.stringify(value)}
                                </Descriptions.Item>
                            ))
                        }
                    </Descriptions>
                )}
            </Card>
        );
    };

    return (
        <Modal
            title="Thêm sản phẩm từ danh mục"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                    Thêm sản phẩm
                </Button>
            ]}
            width={800}
        >
            <Spin spinning={loading || fetchingCatalog}>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        import_date: dayjs(),
                        is_returnable: true,
                        return_period: 7,
                        is_exchangeable: true,
                    }}
                >
                    <Form.Item
                        name="catalog_product_id"
                        label="Chọn sản phẩm từ danh mục"
                        rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
                    >
                        <Select
                            placeholder="Chọn sản phẩm từ danh mục"
                            onChange={handleProductSelect}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                            }
                            options={catalogProducts.map(product => ({
                                value: product.id,
                                label: `${product.name} - ${product.brand}`,
                            }))}
                        />
                    </Form.Item>

                    {renderProductDetails()}

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item
                            name="import_price"
                            label="Giá nhập"
                            rules={[{ required: true, message: 'Vui lòng nhập giá nhập' }]}
                            style={{ flex: 1 }}
                        >
                            <Input type="number" min={0} suffix="₫" />
                        </Form.Item>

                        <Form.Item
                            name="retail_price"
                            label="Giá bán"
                            rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
                            style={{ flex: 1 }}
                        >
                            <Input type="number" min={0} suffix="₫" />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item
                            name="stock"
                            label="Số lượng"
                            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                            style={{ flex: 1 }}
                        >
                            <Input type="number" min={0} />
                        </Form.Item>

                        <Form.Item
                            name="import_date"
                            label="Ngày nhập hàng"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày nhập hàng' }]}
                            style={{ flex: 1 }}
                        >
                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                        </Form.Item>
                    </div>

                    <Form.Item
                        label="Hóa đơn nhập hàng"
                        rules={[{ required: true, message: 'Vui lòng tải lên hóa đơn nhập hàng' }]}
                    >
                        <Upload
                            fileList={fileList}
                            onChange={handleUploadChange}
                            beforeUpload={beforeUpload}
                            maxCount={1}
                            listType="picture"
                        >
                            {fileList.length === 0 && (
                                <Button icon={<UploadOutlined />}>Tải lên hóa đơn</Button>
                            )}
                        </Upload>
                    </Form.Item>

                    <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Chính sách đổi trả</h3>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item
                            name="is_returnable"
                            label="Cho phép đổi trả"
                            style={{ flex: 1 }}
                        >
                            <Select>
                                <Select.Option value={true}>Có</Select.Option>
                                <Select.Option value={false}>Không</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="return_period"
                            label="Thời gian đổi trả (ngày)"
                            style={{ flex: 1 }}
                        >
                            <Input type="number" min={0} />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item
                            name="is_exchangeable"
                            label="Cho phép đổi hàng"
                            style={{ flex: 1 }}
                        >
                            <Select>
                                <Select.Option value={true}>Có</Select.Option>
                                <Select.Option value={false}>Không</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="return_conditions"
                            label="Điều kiện đổi trả"
                            style={{ flex: 1 }}
                        >
                            <Input.TextArea rows={3} />
                        </Form.Item>
                    </div>
                </Form>
            </Spin>
        </Modal>
    );
};

export default AddProductFromCatalogForm;