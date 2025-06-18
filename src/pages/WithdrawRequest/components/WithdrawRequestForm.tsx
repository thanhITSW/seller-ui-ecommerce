import React, { useState } from 'react';
import { Modal, Form, InputNumber, Select, message } from 'antd';
import withdrawRequestApi from '../../../api/withdrawRequestApi';
import { WithdrawRequestCreatePayload } from '../../../types/WithdrawRequest';

interface PaymentMethodOption {
    id: string;
    method_type: string;
    account_number: string;
    account_name: string;
    bank_name?: string | null;
}

interface WithdrawRequestFormProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    paymentMethods: PaymentMethodOption[];
}

const WithdrawRequestForm: React.FC<WithdrawRequestFormProps> = ({ visible, onCancel, onSuccess, paymentMethods }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const STORE_ID = localStorage.getItem('store_id') || '';

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const payload: WithdrawRequestCreatePayload = {
                store_id: STORE_ID,
                amount: values.amount,
                store_payment_info_id: values.store_payment_info_id,
            };
            const res = await withdrawRequestApi.createWithdrawRequest(payload);
            console.log(res);
            if (res.ok && res.body?.code === 0) {
                message.success('Tạo yêu cầu rút tiền thành công');
                form.resetFields();
                onSuccess();
            } else {
                message.error(res.body?.message || 'Lỗi khi tạo yêu cầu');
            }
        } catch (e) {
            // validation error or api error
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={visible}
            title="Tạo yêu cầu rút tiền"
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Tạo yêu cầu"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Số tiền rút"
                    name="amount"
                    rules={[{ required: true, message: 'Vui lòng nhập số tiền' }, { type: 'number', min: 1, message: 'Số tiền phải lớn hơn 0' }]}
                >
                    <InputNumber min={1} style={{ width: '100%' }} placeholder="Nhập số tiền muốn rút" />
                </Form.Item>
                <Form.Item
                    label="Phương thức nhận tiền"
                    name="store_payment_info_id"
                    rules={[{ required: true, message: 'Vui lòng chọn phương thức nhận tiền' }]}
                >
                    <Select placeholder="Chọn phương thức nhận tiền">
                        {paymentMethods.map(pm => (
                            <Select.Option key={pm.id} value={pm.id}>
                                {pm.method_type} - {pm.account_name} {pm.bank_name ? `(${pm.bank_name})` : ''} - {pm.account_number}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default WithdrawRequestForm; 