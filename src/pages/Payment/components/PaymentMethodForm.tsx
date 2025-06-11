import React, { useEffect } from 'react';
import { Modal, Form, Input, Switch, Button } from 'antd';
import { PaymentMethod } from '../../../types/Payment';

interface PaymentMethodFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: Partial<PaymentMethod>) => void;
    initialValues?: Partial<PaymentMethod>;
    loading: boolean;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ visible, onCancel, onSubmit, initialValues, loading }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (initialValues && initialValues.id) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
                form.setFieldsValue({ is_active: true });
            }
        }
    }, [visible, initialValues, form]);

    const handleOk = () => {
        form.validateFields().then(values => {
            onSubmit(values);
        });
    };

    return (
        <Modal
            open={visible}
            onCancel={onCancel}
            onOk={handleOk}
            title={initialValues && initialValues.id ? 'Sửa phương thức' : 'Thêm phương thức'}
            confirmLoading={loading}
            footer={[
                <Button key="back" onClick={onCancel}>Hủy</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
                    Lưu
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical">
                <Form.Item name="method_name" label="Tên phương thức" rules={[{ required: true, message: 'Nhập tên phương thức' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Nhập mô tả' }]}>
                    <Input.TextArea rows={2} />
                </Form.Item>
                <Form.Item name="is_active" label="Kích hoạt" valuePropName="checked">
                    <Switch />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PaymentMethodForm; 