import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import { ShippingProvider } from '../../../types/Shipment';

interface ShippingProviderFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: Omit<ShippingProvider, 'id' | 'createdAt' | 'updatedAt'>) => void;
    initialValues?: Partial<ShippingProvider>;
    loading: boolean;
}

const ShippingProviderForm: React.FC<ShippingProviderFormProps> = ({ visible, onCancel, onSubmit, initialValues, loading }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (initialValues && initialValues.id) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
                form.setFieldsValue({ status: 'active' });
            }
        }
    }, [visible, initialValues, form]);

    const handleOk = () => {
        form.validateFields().then(values => {
            // Only send required fields
            const submitData = {
                name: values.name,
                tracking_url: values.tracking_url || '',
                status: values.status
            };
            onSubmit(submitData);
        });
    };

    return (
        <Modal
            open={visible}
            onCancel={onCancel}
            onOk={handleOk}
            title={initialValues && initialValues.id ? 'Sửa đơn vị vận chuyển' : 'Thêm đơn vị vận chuyển'}
            confirmLoading={loading}
            footer={[
                <Button key="back" onClick={onCancel}>Hủy</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
                    Lưu
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical">
                <Form.Item name="name" label="Tên đơn vị" rules={[{ required: true, message: 'Nhập tên đơn vị' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="tracking_url" label="Tracking URL">
                    <Input />
                </Form.Item>
                <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Chọn trạng thái' }]}>
                    <Select>
                        <Select.Option value="active">Kích hoạt</Select.Option>
                        <Select.Option value="inactive">Ẩn</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ShippingProviderForm; 