import React from 'react';
import { Modal, Form, Input } from 'antd';
import { ProductType } from '../../../types/ProductType';
import './styles.scss';

interface ProductTypeFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: Partial<ProductType>) => void;
    initialValues?: ProductType;
    loading: boolean;
}

const ProductTypeForm: React.FC<ProductTypeFormProps> = ({
    visible,
    onCancel,
    onSubmit,
    initialValues,
    loading
}) => {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit(values);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title={initialValues ? 'Edit Product Type' : 'Add Product Type'}
            open={visible}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
            >
                <Form.Item
                    name="product_type_name"
                    label="Product Type Name"
                    rules={[{ required: true, message: 'Please enter the product type name' }]}
                >
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ProductTypeForm; 