import React, { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { User, UserFormData } from '../../../types/user';
import './styles.scss';

interface UserFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (data: UserFormData) => Promise<void>;
    initialValues?: User;
    loading?: boolean;
}

const { Option } = Select;

const UserForm: React.FC<UserFormProps> = ({
    visible,
    onCancel,
    onSubmit,
    initialValues,
    loading = false,
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible && initialValues) {
            form.setFieldsValue({
                email: initialValues.email,
                fullname: initialValues.fullname,
                phone: initialValues.phone,
                status: initialValues.status,
            });
        } else {
            form.resetFields();
        }
    }, [visible, initialValues, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await onSubmit(values);
            form.resetFields();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title="Edit User"
            open={visible}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                className="user-form"
            >
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: 'Please input the email!' },
                        { type: 'email', message: 'Please input a valid email!' }
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="fullname"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please input the full name!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[
                        { required: true, message: 'Please input the phone number!' },
                        { pattern: /^[0-9]{10}$/, message: 'Please input a valid phone number!' }
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="status"
                    label="Status"
                    rules={[{ required: true, message: 'Please select the status!' }]}
                >
                    <Select>
                        <Option value="active">Active</Option>
                        <Option value="inactive">Inactive</Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UserForm; 