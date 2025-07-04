import React from 'react';
import { Modal, Form, Input } from 'antd';
import { Attribute } from '../../../types/ProductType';
import './styles.scss';

interface AttributeFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: Partial<Attribute>) => void;
    initialValues?: Attribute;
    loading: boolean;
    productTypeId: string;
}

const AttributeForm: React.FC<AttributeFormProps> = ({
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
            title={initialValues ? 'Edit Attribute' : 'Add Attribute'}
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
                    name="attribute_name"
                    label="Attribute Name"
                    rules={[{ required: true, message: 'Please enter the attribute name' }]}
                >
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AttributeForm; 