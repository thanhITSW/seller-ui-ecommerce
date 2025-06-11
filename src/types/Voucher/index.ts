export interface Voucher {
    id: string;
    code: string;
    type: 'order' | 'freeship';
    issuer_type: 'platform';
    issuer_id: string | null;
    issuer_name: string | null;
    description: string;
    discount_unit: 'percent' | 'amount';
    discount_value: string;
    max_discount_value: string | null;
    min_order_value: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
    is_used?: boolean;
}

export interface VoucherFormData {
    type: 'order' | 'freeship';
    description: string;
    discount_unit: 'percent' | 'amount';
    discount_value: string;
    max_discount_value?: string;
    min_order_value: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
} 