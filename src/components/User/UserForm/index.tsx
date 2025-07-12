import React, { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { User, UserFormData } from '../../../types/user';
import './styles.scss';

interface UserFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (data: UserFormData & { role?: string, password?: string }) => Promise<void>;
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
    const isEditMode = !!initialValues;

    useEffect(() => {
        if (visible && initialValues) {
            form.setFieldsValue({
                email: initialValues.email,
                fullname: initialValues.fullname,
                phone: initialValues.phone,
                status: initialValues.status,
                role: initialValues.role,
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
            title={isEditMode ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}
            open={visible}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            width={600}
            okText={isEditMode ? "Cập nhật" : "Thêm mới"}
            cancelText="Hủy"
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
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                >
                    <Input />
                </Form.Item>

                {!isEditMode && (
                    <Form.Item
                        name="password"
                        label="Mật khẩu"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                )}

                <Form.Item
                    name="fullname"
                    label="Họ và tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại!' },
                        { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="role"
                    label="Vai trò"
                    rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                >
                    <Select>
                        <Option value="admin_seller">Chủ cửa hàng</Option>
                        <Option value="staff_seller">Nhân viên cửa hàng</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="status"
                    label="Trạng thái"
                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                >
                    <Select>
                        <Option value="active">Hoạt động</Option>
                        <Option value="inactive">Vô hiệu</Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UserForm; 