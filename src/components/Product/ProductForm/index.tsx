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
    hideSellerFields?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
    visible,
    onCancel,
    onSubmit,
    initialValues,
    loading,
    hideSellerFields
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

    // Reset form và các state chỉ khi thêm mới
    const resetFormData = () => {
        form.resetFields();
        setImageFile(null);
        setLicenseFile(null);
        setImagePreview(null);
        setLicensePreview(null);
        setCategories([]);
        setAttributes([]);
    };

    // Reset form and files when modal opens/closes or switching products
    useEffect(() => {
        if (visible) {
            if (initialValues) {
                // Đây là chế độ edit - không reset, chỉ load dữ liệu cũ
                // Đây là chế độ edit
                if (initialValues.url_image) setImagePreview(initialValues.url_image);
                if (initialValues.url_registration_license) setLicensePreview(initialValues.url_registration_license);

                // Set các field cơ bản trước
                form.setFieldsValue({
                    name: initialValues.name,
                    brand: initialValues.brand,
                    seller_id: initialValues.seller_id,
                    seller_name: initialValues.seller_name,
                    product_type_id: initialValues.product_type_id,
                });

                // Fetch categories/attributes và set dynamic fields sau khi fetch
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
                            if (key === 'Thành phần') {
                                let parsedValue = value;
                                if (typeof value === 'string') {
                                    try {
                                        parsedValue = JSON.parse(value);
                                    } catch {
                                        parsedValue = [];
                                    }
                                }
                                form.setFieldsValue({ [key]: parsedValue });
                            } else {
                                form.setFieldsValue({ [key]: value });
                            }
                        });
                    }
                }).finally(() => setFetching(false));
            } else {
                // Đây là chế độ thêm mới - reset
                resetFormData();
            }
        } else {
            // Modal đóng - chỉ reset khi đang ở chế độ thêm mới
            if (!initialValues) {
                resetFormData();
            }
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

            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('brand', values.brand);
            formData.append('seller_id', values.seller_id);
            formData.append('seller_name', values.seller_name);
            formData.append('product_type_id', values.product_type_id);
            formData.append('category_id', values.category_id);
            formData.append('product_details', JSON.stringify(product_details));

            if (imageFile) formData.append('image', imageFile);
            if (licenseFile) formData.append('registration_license', licenseFile);

            onSubmit(formData);
        } catch (error) {
            console.error('Validation failed:', error);
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

        // Reset category và attribute fields
        form.setFieldsValue({ category_id: undefined });
        // Reset các attribute fields về undefined
        const currentValues = form.getFieldsValue();
        const resetValues: any = {};
        attributes.forEach(attr => {
            resetValues[attr.attribute_name] = undefined;
        });
        form.setFieldsValue(resetValues);
    };

    const handleCancel = () => {
        // Chỉ reset khi đang ở chế độ thêm mới
        if (!initialValues) {
            resetFormData();
        }
        onCancel();
    };

    return (
        <Modal
            title={initialValues ? 'Edit Product' : 'Add Product'}
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={700}
            destroyOnClose={!initialValues} // Chỉ destroy khi thêm mới
        >
            <Spin spinning={fetching}>
                <Form
                    form={form}
                    layout="vertical"
                    preserve={!!initialValues} // Preserve khi edit, không preserve khi thêm mới
                >
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="brand" label="Brand" rules={[{ required: true, message: 'Vui lòng nhập brand' }]}>
                        <Input />
                    </Form.Item>
                    {!hideSellerFields && (
                        <>
                            <Form.Item name="seller_id" label="Seller ID" rules={[{ required: true, message: 'Vui lòng nhập seller id' }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="seller_name" label="Seller Name" rules={[{ required: true, message: 'Vui lòng nhập seller name' }]}>
                                <Input />
                            </Form.Item>
                        </>
                    )}
                    <Form.Item name="product_type_id" label="Product Type" rules={[{ required: true, message: 'Vui lòng chọn loại sản phẩm' }]}>
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
                    <Form.Item name="category_id" label="Category" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
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
                                        <label style={{ marginBottom: 8, display: 'block' }}>{attr.attribute_name}</label>
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

                    {/* File upload */}
                    <Form.Item label="Ảnh sản phẩm" required={initialValues ? false : true}>
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            onChange={info => handleFileChange(info, 'image')}
                            accept="image/*"
                            showUploadList={false}
                            fileList={[]} // Thêm fileList rỗng để reset
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
                            fileList={[]} // Thêm fileList rỗng để reset
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