import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, Upload, message, Spin } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import productApi from '../../../api/productApi';
import { ProductApi } from '../../../types/Product';
import { ProductType, Category, Attribute } from '../../../types/ProductType';
import './styles.scss';

interface ProductFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (formData: FormData) => void;
    initialValues?: ProductApi;
    loading: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
    visible,
    onCancel,
    onSubmit,
    initialValues,
    loading
}) => {
    const [form] = Form.useForm();
    const [productTypes, setProductTypes] = useState<ProductType[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [licensePreview, setLicensePreview] = useState<string | null>(null);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        productApi.getProductTypes().then(res => {
            if (res.ok && res.body?.data) setProductTypes(res.body.data);
        });
    }, []);

    // Reset form and files when modal opens/closes or switching products
    useEffect(() => {
        if (visible) {
            form.resetFields();
            setImageFile(null);
            setLicenseFile(null);
            if (initialValues) {
                if (initialValues.url_image) setImagePreview(initialValues.url_image);
                if (initialValues.url_registration_license) setLicensePreview(initialValues.url_registration_license);
                else setLicensePreview(null);
                // Set static fields, ép giá về số nguyên
                form.setFieldsValue({
                    name: initialValues.name,
                    brand: initialValues.brand,
                    import_price: parseInt(initialValues.import_price),
                    retail_price: parseInt(initialValues.retail_price),
                    stock: initialValues.stock,
                    seller_id: initialValues.seller_id,
                    seller_name: initialValues.seller_name,
                    product_type_id: initialValues.product_type_id,
                });
                // Fetch categories/attributes and set dynamic fields after fetch
                setFetching(true);
                Promise.all([
                    productApi.getCategoriesByType(initialValues.product_type_id),
                    productApi.getAttributesByType(initialValues.product_type_id)
                ]).then(([catRes, attrRes]) => {
                    if (catRes.ok && catRes.body?.data) setCategories(catRes.body.data);
                    if (attrRes.ok && attrRes.body?.data) setAttributes(attrRes.body.data);
                    // Set category
                    form.setFieldsValue({ category_id: initialValues.category_id });
                    // Set attribute fields
                    if (initialValues.product_details) {
                        Object.entries(initialValues.product_details).forEach(([key, value]) => {
                            form.setFieldsValue({ [key]: value });
                        });
                    }
                    // Set return_policy fields
                    if (initialValues.return_policy) {
                        form.setFieldsValue({
                            is_returnable: initialValues.return_policy.is_returnable,
                            return_period: initialValues.return_policy.return_period,
                            is_exchangeable: initialValues.return_policy.is_exchangeable,
                            return_conditions: initialValues.return_policy.return_conditions,
                        });
                    }
                }).finally(() => setFetching(false));
            } else {
                setImagePreview(null);
                setLicensePreview(null);
                // Reset toàn bộ form khi thêm mới
                form.resetFields();
                setImageFile(null);
                setLicenseFile(null);
                setCategories([]);
                setAttributes([]);
            }
        } else {
            form.resetFields();
            setImageFile(null);
            setLicenseFile(null);
            setImagePreview(null);
            setLicensePreview(null);
            setCategories([]);
            setAttributes([]);
        }
    }, [visible, initialValues]);

    const handleFileChange = (info: any, type: 'image' | 'license') => {
        const fileList = info.fileList;
        if (fileList.length === 0) {
            if (type === 'image') {
                setImageFile(null);
                setImagePreview(initialValues?.url_image || null);
            } else {
                setLicenseFile(null);
                setLicensePreview(initialValues?.url_registration_license || null);
            }
        } else {
            const fileObj = fileList[fileList.length - 1].originFileObj;
            if (type === 'image') {
                setImageFile(fileObj);
                setImagePreview(URL.createObjectURL(fileObj));
            } else {
                setLicenseFile(fileObj);
                // Nếu là ảnh thì preview, nếu là PDF thì chỉ hiện tên file
                if (fileObj.type.startsWith('image/')) {
                    setLicensePreview(URL.createObjectURL(fileObj));
                } else {
                    setLicensePreview(fileObj.name);
                }
            }
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!imageFile && !initialValues) {
                message.error('Vui lòng tải lên ảnh sản phẩm');
                return;
            }
            if (!licenseFile && !initialValues) {
                message.error('Vui lòng tải lên giấy phép');
                return;
            }
            // Build product_details from attributes
            const product_details: Record<string, any> = {};
            attributes.forEach(attr => {
                if (attr.attribute_name === 'Thành phần') {
                    product_details[attr.attribute_name] = values[attr.attribute_name] || [];
                } else {
                    product_details[attr.attribute_name] = values[attr.attribute_name];
                }
            });
            // Build return_policy (simple demo, can expand)
            const return_policy = {
                is_returnable: values.is_returnable,
                return_period: values.return_period,
                is_exchangeable: values.is_exchangeable,
                return_conditions: values.return_conditions
            };
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('brand', values.brand);
            formData.append('import_price', values.import_price);
            formData.append('retail_price', values.retail_price);
            formData.append('stock', values.stock);
            formData.append('seller_id', values.seller_id);
            formData.append('seller_name', values.seller_name);
            formData.append('product_type_id', values.product_type_id);
            formData.append('category_id', values.category_id);
            formData.append('return_policy', JSON.stringify(return_policy));
            formData.append('product_details', JSON.stringify(product_details));
            if (imageFile) formData.append('image', imageFile);
            if (licenseFile) formData.append('registration_license', licenseFile);
            onSubmit(formData);
        } catch (error) {
            // Validation error
        }
    };

    // Fetch categories and attributes when product_type_id changes (for add mode)
    const handleProductTypeChange = (productTypeId: string) => {
        setFetching(true);
        Promise.all([
            productApi.getCategoriesByType(productTypeId),
            productApi.getAttributesByType(productTypeId)
        ]).then(([catRes, attrRes]) => {
            if (catRes.ok && catRes.body?.data) setCategories(catRes.body.data);
            if (attrRes.ok && attrRes.body?.data) setAttributes(attrRes.body.data);
        }).finally(() => setFetching(false));
        // Reset category and attribute fields
        form.setFieldsValue({ category_id: undefined });
        attributes.forEach(attr => form.setFieldsValue({ [attr.attribute_name]: undefined }));
    };

    return (
        <Modal
            title={initialValues ? 'Edit Product' : 'Add Product'}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={700}
        >
            <Spin spinning={fetching}>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={initialValues}
                >
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="brand" label="Brand" rules={[{ required: true, message: 'Vui lòng nhập brand' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="import_price" label="Import Price" rules={[{ required: true, message: 'Vui lòng nhập giá nhập' }]}>
                        <Input type="number" min={0} />
                    </Form.Item>
                    <Form.Item name="retail_price" label="Retail Price" rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}>
                        <Input type="number" min={0} />
                    </Form.Item>
                    <Form.Item name="stock" label="Stock" rules={[{ required: true, message: 'Vui lòng nhập tồn kho' }]}>
                        <Input type="number" min={0} />
                    </Form.Item>
                    <Form.Item name="seller_id" label="Seller ID" rules={[{ required: true, message: 'Vui lòng nhập seller id' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="seller_name" label="Seller Name" rules={[{ required: true, message: 'Vui lòng nhập seller name' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="product_type_id" label="Product Type" rules={[{ required: true, message: 'Vui lòng chọn loại sản phẩm' }]}
                    >
                        <Select
                            placeholder="Chọn loại sản phẩm"
                            onChange={handleProductTypeChange}
                            showSearch
                            optionFilterProp="children"
                        >
                            {productTypes.map(pt => (
                                <Select.Option key={pt.id} value={pt.id}>{pt.product_type_name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="category_id" label="Category" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                    >
                        <Select placeholder="Chọn danh mục">
                            {categories.map(cat => (
                                <Select.Option key={cat.id} value={cat.id}>{cat.category_name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    {/* Dynamic attribute fields */}
                    {attributes.map(attr => (
                        attr.attribute_name === 'Thành phần' ? (
                            <Form.List name={attr.attribute_name} key={attr.id}>
                                {(fields, { add, remove }) => (
                                    <div>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <div key={key} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'Tên']}
                                                    rules={[{ required: true, message: 'Nhập tên thành phần' }]}
                                                    style={{ flex: 1 }}
                                                >
                                                    <Input placeholder="Tên thành phần" />
                                                </Form.Item>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'Hàm lượng']}
                                                    rules={[{ required: true, message: 'Nhập hàm lượng' }]}
                                                    style={{ flex: 1 }}
                                                >
                                                    <Input placeholder="Hàm lượng" />
                                                </Form.Item>
                                                <Button onClick={() => remove(name)} danger>Xóa</Button>
                                            </div>
                                        ))}
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm thành phần</Button>
                                    </div>
                                )}
                            </Form.List>
                        ) : (
                            <Form.Item
                                key={attr.id}
                                name={attr.attribute_name}
                                label={attr.attribute_name}
                                rules={[{ required: true, message: `Vui lòng nhập ${attr.attribute_name}` }]}
                            >
                                <Input />
                            </Form.Item>
                        )
                    ))}
                    {/* Return policy fields */}
                    <Form.Item name="is_returnable" label="Đổi trả" valuePropName="checked">
                        <Select>
                            <Select.Option value={true}>Có</Select.Option>
                            <Select.Option value={false}>Không</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="return_period" label="Thời gian đổi trả (ngày)">
                        <Input type="number" min={0} />
                    </Form.Item>
                    <Form.Item name="is_exchangeable" label="Đổi hàng" valuePropName="checked">
                        <Select>
                            <Select.Option value={true}>Có</Select.Option>
                            <Select.Option value={false}>Không</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="return_conditions" label="Điều kiện đổi trả">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    {/* File upload */}
                    <Form.Item label="Ảnh sản phẩm" required={initialValues ? false : true}>
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            onChange={info => handleFileChange(info, 'image')}
                            accept="image/*"
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                        </Upload>
                        {imagePreview && (
                            <img src={imagePreview} alt="preview" style={{ maxWidth: 200, marginTop: 8 }} />
                        )}
                    </Form.Item>
                    <Form.Item label="Giấy phép đăng ký" required={initialValues ? false : true}>
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            onChange={info => handleFileChange(info, 'license')}
                            accept="image/*,application/pdf"
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined />}>Chọn file</Button>
                        </Upload>
                        {licensePreview && (
                            licensePreview.endsWith('.pdf') || licensePreview.startsWith('http') && licensePreview.includes('.pdf') ? (
                                <div style={{ marginTop: 8 }}>
                                    <a href={licensePreview} target="_blank" rel="noopener noreferrer">Xem file PDF</a>
                                </div>
                            ) : licensePreview.startsWith('http') || licensePreview.startsWith('blob:') ? (
                                <img src={licensePreview} alt="license preview" style={{ maxWidth: 200, marginTop: 8 }} />
                            ) : (
                                <div style={{ marginTop: 8 }}>{licensePreview}</div>
                            )
                        )}
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" loading={loading} onClick={handleSubmit} block>
                            {initialValues ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
                        </Button>
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
};

export default ProductForm; 