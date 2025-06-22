import React from 'react';
import { Modal, Form, Input, Select, Button, DatePicker, Spin } from 'antd';
import { ProductApi } from '../../../types/Product';
import dayjs from 'dayjs';

interface EditProductFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (formData: FormData) => void;
    initialValues: ProductApi;
    loading: boolean;
}

const EditProductForm: React.FC<EditProductFormProps> = ({
    visible,
    onCancel,
    onSubmit,
    initialValues,
    loading
}) => {
    const [form] = Form.useForm();

    React.useEffect(() => {
        if (visible && initialValues) {
            form.setFieldsValue({
                import_price: parseInt(initialValues.import_price),
                retail_price: parseInt(initialValues.retail_price),
                stock: initialValues.stock,
                import_date: initialValues.import_date ? dayjs(initialValues.import_date) : undefined,
                is_returnable: initialValues.return_policy?.is_returnable,
                return_period: initialValues.return_policy?.return_period,
                is_exchangeable: initialValues.return_policy?.is_exchangeable,
                return_conditions: initialValues.return_policy?.return_conditions,
            });
        }
    }, [visible, initialValues, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Build return_policy object
            const return_policy = {
                is_returnable: values.is_returnable,
                return_period: values.return_period,
                is_exchangeable: values.is_exchangeable,
                return_conditions: values.return_conditions
            };

            const formData = new FormData();

            // Required fields from the original product
            formData.append('catalog_product_id', initialValues.product_type_id);
            formData.append('seller_id', initialValues.seller_id);
            formData.append('seller_name', initialValues.seller_name);

            // Fields that can be edited
            formData.append('import_price', values.import_price);
            formData.append('retail_price', values.retail_price);
            formData.append('stock', values.stock);
            formData.append('return_policy', JSON.stringify(return_policy));

            // Convert date to ISO string format
            if (values.import_date) {
                formData.append('import_date', values.import_date.format('YYYY-MM-DD'));
            }

            onSubmit(formData);
        } catch (error) {
            // Validation error
            console.error('Validation error:', error);
        }
    };

    return (
        <Modal
            title="Chỉnh sửa sản phẩm"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                    Lưu
                </Button>
            ]}
            width={600}
        >
            <Spin spinning={loading}>
                <Form
                    form={form}
                    layout="vertical"
                >
                    {initialValues && (
                        <div style={{ marginBottom: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                            <h3 style={{ margin: '0 0 10px 0' }}>{initialValues.name}</h3>
                            <p style={{ margin: '0' }}>Brand: {initialValues.brand}</p>
                        </div>
                    )}

                    <Form.Item
                        name="import_price"
                        label="Giá nhập"
                        rules={[{ required: true, message: 'Vui lòng nhập giá nhập' }]}
                    >
                        <Input type="number" min={0} suffix="₫" />
                    </Form.Item>

                    <Form.Item
                        name="retail_price"
                        label="Giá bán"
                        rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
                    >
                        <Input type="number" min={0} suffix="₫" />
                    </Form.Item>

                    <Form.Item
                        name="stock"
                        label="Số lượng"
                        rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                    >
                        <Input type="number" min={0} />
                    </Form.Item>

                    <Form.Item
                        name="import_date"
                        label="Ngày nhập hàng"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày nhập hàng' }]}
                    >
                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                    </Form.Item>

                    <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Chính sách đổi trả</h3>

                    <Form.Item name="is_returnable" label="Cho phép đổi trả">
                        <Select>
                            <Select.Option value={true}>Có</Select.Option>
                            <Select.Option value={false}>Không</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="return_period" label="Thời gian đổi trả (ngày)">
                        <Input type="number" min={0} />
                    </Form.Item>

                    <Form.Item name="is_exchangeable" label="Cho phép đổi hàng">
                        <Select>
                            <Select.Option value={true}>Có</Select.Option>
                            <Select.Option value={false}>Không</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="return_conditions" label="Điều kiện đổi trả">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
};

export default EditProductForm; 