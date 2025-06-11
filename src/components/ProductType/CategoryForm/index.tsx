import React from 'react';
import { Modal, Form, Input } from 'antd';
import { Category } from '../../../../types/ProductType';
import './styles.scss';

interface CategoryFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: Partial<Category>) => void;
    initialValues?: Category;
    loading: boolean;
    productTypeId: string;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
    visible,
    onCancel,
    onSubmit,
    initialValues,
    loading,
    productTypeId
}) => {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onSubmit({
                ...values,
                product_type_id: productTypeId
            });
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title={initialValues ? 'Edit Category' : 'Add Category'}
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
                    name="category_name"
                    label="Category Name"
                    rules={[{ required: true, message: 'Please enter the category name' }]}
                >
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CategoryForm; 