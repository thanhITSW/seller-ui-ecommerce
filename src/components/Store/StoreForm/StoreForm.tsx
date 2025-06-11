import React from 'react';
import { Modal, Form, Input } from 'antd';
import { Store } from '../../../types/Store';

interface StoreFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: Partial<Store>) => void;
    initialValues?: Store;
    loading: boolean;
}

const StoreForm: React.FC<StoreFormProps> = ({
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
            // Validation failed
        }
    };

    return (
        <Modal
            title={initialValues ? 'Edit Store' : 'Add Store'}
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
                    name="name"
                    label="Store Name"
                    rules={[{ required: true, message: 'Please enter the store name' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="Description"
                >
                    <Input.TextArea rows={2} />
                </Form.Item>
                <Form.Item
                    name="phone"
                    label="Phone"
                    rules={[{ required: true, message: 'Please enter a valid phone number', pattern: /^[0-9]{10}$/ }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ required: true, message: 'Please enter a valid email', type: 'email' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="address_line"
                    label="Address Line"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="province_name"
                    label="Province/City"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="district_name"
                    label="District"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="ward_name"
                    label="Ward"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="address_detail"
                    label="Address Detail"
                >
                    <Input />
                </Form.Item>
                {initialValues?.license_url && (
                    <Form.Item label="License">
                        <a href={initialValues.license_url} target="_blank" rel="noopener noreferrer">View License</a>
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
};

export default StoreForm; 