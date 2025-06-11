import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, InputNumber, Switch } from 'antd';
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
                issuer_type: 'platform',
                start_date: values.start_date.format('YYYY-MM-DD'),
                end_date: values.end_date.format('YYYY-MM-DD'),
                discount_value: values.discount_value?.toString(),
                min_order_value: values.min_order_value?.toString(),
                max_discount_value: values.max_discount_value ? values.max_discount_value.toString() : null
            };
            onSubmit(formattedValues);
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
            title={isEditing ? 'Edit Voucher' : 'Create New Voucher'}
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
                        label="Type"
                        rules={[{ required: true, message: 'Please select type!' }]}
                    >
                        <Select disabled={isUsed}>
                            <Select.Option value="order">Order Discount</Select.Option>
                            <Select.Option value="shipping">Free Shipping</Select.Option>
                        </Select>
                    </Form.Item>
                )}

                <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ required: true, message: 'Please input description!' }]}
                >
                    <Input.TextArea rows={3} placeholder="Enter description" disabled={isUsed} />
                </Form.Item>

                <Form.Item
                    name="discount_unit"
                    label="Discount Unit"
                    rules={[{ required: true, message: 'Please select discount unit!' }]}
                >
                    <Select disabled={isUsed}>
                        <Select.Option value="percent">Percentage (%)</Select.Option>
                        <Select.Option value="amount">Fixed Amount (VND)</Select.Option>
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
                                label="Discount Value"
                                rules={[
                                    { required: true, message: 'Please input discount value!' },
                                    {
                                        validator: async (_, value) => {
                                            if (value === undefined || value === null || value < 0) {
                                                throw new Error('Value must be greater than or equal to 0!');
                                            }
                                            if (discountUnit === 'percent' && value > 100) {
                                                throw new Error('Percentage must be less than or equal to 100!');
                                            }
                                        }
                                    }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder={`Enter discount value (${discountUnit === 'percent' ? '%' : 'VND'})`}
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
                    label="Maximum Discount Value (VND)"
                    rules={[
                        {
                            validator: async (_, value) => {
                                if (value !== undefined && value !== null && value < 0) {
                                    throw new Error('Value must be greater than or equal to 0!');
                                }
                            }
                        }
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Enter maximum discount value"
                        formatter={(value) => formatCurrency(Number(value) || 0)}
                        parser={numberParser}
                        min={0}
                        max={999999999}
                        disabled={isUsed}
                    />
                </Form.Item>

                <Form.Item
                    name="min_order_value"
                    label="Minimum Order Value (VND)"
                    rules={[
                        { required: true, message: 'Please input minimum order value!' },
                        {
                            validator: async (_, value) => {
                                if (value === undefined || value === null || value < 0) {
                                    throw new Error('Value must be greater than or equal to 0!');
                                }
                            }
                        }
                    ]}
                >
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder="Enter minimum order value"
                        formatter={(value) => formatCurrency(Number(value) || 0)}
                        parser={numberParser}
                        min={0}
                        max={999999999}
                        disabled={isUsed}
                    />
                </Form.Item>

                <Form.Item
                    name="start_date"
                    label="Start Date"
                    rules={[{ required: true, message: 'Please select start date!' }]}
                >
                    <DatePicker
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD"
                        disabled={isUsed}
                    />
                </Form.Item>

                <Form.Item
                    name="end_date"
                    label="End Date"
                    rules={[
                        { required: true, message: 'Please select end date!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || !getFieldValue('start_date') || value.isAfter(getFieldValue('start_date'))) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('End date must be after start date!'));
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
                    label="Status"
                    valuePropName="checked"
                >
                    <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default VoucherForm; 