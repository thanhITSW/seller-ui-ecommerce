import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Upload, Checkbox, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { StorePaymentInfo } from '../../../types/WithdrawRequest';
import withdrawRequestApi from '../../../api/withdrawRequestApi';

interface StorePaymentInfoFormProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    initialValues?: Partial<StorePaymentInfo>;
    isEdit?: boolean;
}

const methodTypeOptions = [
    { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng' },
    { value: 'momo', label: 'Momo' },
    { value: 'zalopay', label: 'ZaloPay' },
];

const StorePaymentInfoForm: React.FC<StorePaymentInfoFormProps> = ({ visible, onCancel, onSuccess, initialValues, isEdit }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);
    const [qrFile, setQrFile] = React.useState<any[]>([]);
    const methodType = Form.useWatch('method_type', form);
    const STORE_ID = localStorage.getItem('store_id') || '';

    useEffect(() => {
        if (visible) {
            form.setFieldsValue(initialValues || { method_type: 'bank_transfer', is_default: false });
            setQrFile(initialValues?.qr_code_url ? [{ url: initialValues.qr_code_url, name: 'QR code', status: 'done' }] : []);
        }
    }, [visible, initialValues, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const payload: any = {
                ...values,
                store_id: STORE_ID,
                is_default: !!values.is_default,
            };
            if (qrFile.length && qrFile[0].originFileObj) {
                payload.qr_code_file = qrFile[0].originFileObj;
            }
            if (isEdit && initialValues?.id) {
                const res = await withdrawRequestApi.updateStorePaymentInfo(initialValues.id, payload);
                if (res.ok && res.body?.code === 0) {
                    message.success('Cập nhật thành công');
                    onSuccess();
                } else {
                    message.error(res.body?.message || 'Lỗi khi cập nhật');
                }
            } else {
                const res = await withdrawRequestApi.createStorePaymentInfo(payload);
                if (res.ok && res.body?.code === 0) {
                    message.success('Thêm thành công');
                    onSuccess();
                } else {
                    message.error(res.body?.message || 'Lỗi khi thêm');
                }
            }
        } catch (e) {
            // validation error
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={visible}
            title={isEdit ? 'Sửa phương thức nhận tiền' : 'Thêm phương thức nhận tiền'}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText={isEdit ? 'Cập nhật' : 'Thêm'}
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item name="method_type" label="Loại phương thức" rules={[{ required: true, message: 'Chọn loại phương thức' }]}
                    initialValue="bank_transfer"
                >
                    <Select options={methodTypeOptions} disabled={isEdit} />
                </Form.Item>
                <Form.Item name="account_number" label="Số tài khoản/Số điện thoại" rules={[{ required: true, message: 'Nhập số tài khoản/SĐT' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item name="account_name" label="Chủ tài khoản" rules={[{ required: true, message: 'Nhập tên chủ tài khoản' }]}
                >
                    <Input />
                </Form.Item>
                {methodType === 'bank_transfer' && (
                    <Form.Item name="bank_name" label="Tên ngân hàng" rules={[{ required: true, message: 'Nhập tên ngân hàng' }]}
                    >
                        <Input />
                    </Form.Item>
                )}
                <Form.Item label="QR code (nếu có)" valuePropName="fileList">
                    <Upload
                        accept="image/*"
                        beforeUpload={() => false}
                        fileList={qrFile}
                        onChange={({ fileList }) => setQrFile(fileList)}
                        listType="picture"
                        maxCount={1}
                    >
                        <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                    </Upload>
                </Form.Item>
                <Form.Item name="is_default" valuePropName="checked">
                    <Checkbox>Mặc định</Checkbox>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default StorePaymentInfoForm; 