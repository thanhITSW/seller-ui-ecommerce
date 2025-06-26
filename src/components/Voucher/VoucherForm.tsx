import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, Switch, notification } from 'antd';
import { Voucher, VoucherFormData } from '../../types/Voucher';
import dayjs from 'dayjs';
import { formatCurrency } from '../../utils/format';

interface VoucherFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (values: VoucherFormData) => void;
    initialValues?: Voucher;
    loading?: boolean;
    isEditing?: boolean;
    isUsed?: boolean;
}

const VoucherForm: React.FC<VoucherFormProps> = ({
    visible,
    onCancel,
    onSubmit,
    initialValues,
    loading,
    isEditing,
    isUsed
}) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible && initialValues) {
            form.setFieldsValue({
                ...initialValues,
                start_date: dayjs(initialValues.start_date),
                end_date: dayjs(initialValues.end_date),
            });
        } else if (visible) {
            form.resetFields();
        }
    }, [visible, initialValues, form]);

    const handleSubmit = () => {
        form.validateFields().then((values) => {
            const formattedValues = {
                ...values,
                issuer_type: 'shop',
                start_date: values.start_date.format('YYYY-MM-DD'),
                end_date: values.end_date.format('YYYY-MM-DD'),
                discount_value: values.discount_value?.toString(),
                min_order_value: values.min_order_value?.toString(),
                max_discount_value: values.max_discount_value ? values.max_discount_value.toString() : null
            };
            onSubmit(formattedValues);
        }).catch(info => {
            notification.error({ message: 'Vui lòng điền đầy đủ và chính xác thông tin!', description: info.errorFields[0]?.errors[0] || '' });
        });
    };

    const numberParser = (value: string | undefined): number => {
        if (!value) return 0;
        const parsedValue = value.replace(/[^\d]/g, '');
        return parsedValue ? Number(parsedValue) : 0;
    };

    const isFieldDisabled = (fieldName: string) => {
        if (!isEditing) return false;
        if (!isUsed) return false;

        const lockedFields = [
            'type',
            'description',
            'discount_unit',
            'discount_value',
            'max_discount_value',
            'min_order_value',
            'start_date'
        ];

        return lockedFields.includes(fieldName);
    };

    return (
        <Modal
            title={isEditing ? 'Sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
            open={visible}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    is_active: true,
                    type: 'order',
                    discount_unit: 'percent',
                }}
            >
                {!isEditing && (
                    <Form.Item
                        name="type"
                        label="Loại"
                        rules={[{ required: true, message: 'Vui lòng chọn loại!' }]}
                    >
                        <Select disabled={isUsed}>
                            <Select.Option value="order">Giảm giá đơn hàng</Select.Option>
                            <Select.Option value="shipping">Miễn phí vận chuyển</Select.Option>
                        </Select>
                    </Form.Item>
                )}

                <Form.Item
                    name="description"
                    label="Mô tả"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                >
                    <Input.TextArea rows={3} placeholder="Nhập mô tả" disabled={isUsed} />
                </Form.Item>

                <Form.Item
                    name="discount_unit"
                    label="Đơn vị giảm giá"
                    rules={[{ required: true, message: 'Vui lòng chọn đơn vị giảm giá!' }]}
                >
                    <Select disabled={isUsed}>
                        <Select.Option value="percent">Phần trăm (%)</Select.Option>
                        <Select.Option value="amount">Số tiền cố định (VND)</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) =>
                        prevValues.discount_unit !== currentValues.discount_unit
                    }
                >
                    {({ getFieldValue }) => {
                        const discountUnit = getFieldValue('discount_unit');
                        return (
                            <Form.Item
                                name="discount_value"
                                label="Giá trị giảm giá"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập giá trị giảm giá!' },
                                    {
                                        validator: async (_, value) => {
                                            if (value === undefined || value === null || value < 0) {
                                                throw new Error('Giá trị phải lớn hơn hoặc bằng 0!');
                                            }
                                            if (discountUnit === 'percent' && value > 100) {
                                                throw new Error('Phần trăm phải nhỏ hơn hoặc bằng 100!');
                                            }
                                        }
                                    }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder={`Nhập giá trị giảm giá (${discountUnit === 'percent' ? '%' : 'VND'})`}
                                    formatter={discountUnit === 'amount' ? (value) => formatCurrency(Number(value) || 0) : undefined}
                                    parser={discountUnit === 'amount' ? numberParser : undefined}
                                    min={0}
                                    max={discountUnit === 'percent' ? 100 : 999999999}
                                    disabled={isUsed}
                                />
                            </Form.Item>
                        );
                    }}
                </Form.Item>

                <Form.Item
                    name="max_discount_value"
                    label="Giá trị giảm tối đa (VND)"
                    rules={[
                        {
                            validator: async (_, value) => {
                                if (value !== undefined && value !== null && value < 0) {
                                    throw new Error('Giá trị phải lớn hơn hoặc bằng 0!');
                                }
                            }
                        }
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Nhập giá trị giảm tối đa"
                        formatter={(value) => formatCurrency(Number(value) || 0)}
                        parser={numberParser}
                        min={0}
                        max={999999999}
                        disabled={isUsed}
                    />
                </Form.Item>

                <Form.Item
                    name="min_order_value"
                    label="Giá trị đơn hàng tối thiểu (VND)"
                    rules={[
                        { required: true, message: 'Vui lòng nhập giá trị đơn hàng tối thiểu!' },
                        {
                            validator: async (_, value) => {
                                if (value === undefined || value === null || value < 0) {
                                    throw new Error('Giá trị phải lớn hơn hoặc bằng 0!');
                                }
                            }
                        }
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Nhập giá trị đơn hàng tối thiểu"
                        formatter={(value) => formatCurrency(Number(value) || 0)}
                        parser={numberParser}
                        min={0}
                        max={999999999}
                        disabled={isUsed}
                    />
                </Form.Item>

                <Form.Item
                    name="start_date"
                    label="Ngày bắt đầu"
                    rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
                >
                    <DatePicker
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD"
                        disabled={isUsed}
                    />
                </Form.Item>

                <Form.Item
                    name="end_date"
                    label="Ngày kết thúc"
                    rules={[
                        { required: true, message: 'Vui lòng chọn ngày kết thúc!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || !getFieldValue('start_date') || value.isAfter(getFieldValue('start_date'))) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu!'));
                            },
                        }),
                    ]}
                >
                    <DatePicker
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD"
                        disabled={isUsed}
                    />
                </Form.Item>

                <Form.Item
                    name="is_active"
                    label="Trạng thái"
                    valuePropName="checked"
                >
                    <Switch checkedChildren="Hoạt động" unCheckedChildren="Không hoạt động" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default VoucherForm; 