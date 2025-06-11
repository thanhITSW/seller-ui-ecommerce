export interface PaymentMethod {
    id: string;
    method_name: string;
    description: string;
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';

export interface PaymentHistory {
    id: string;
    order_id: string;
    seller_id: string;
    user_id: string;
    payment_method_id: string;
    payment_group_id: string | number | null;
    amount: string;
    status: PaymentStatus;
    createdAt: string;
    updatedAt: string;
    Payment_method: {
        method_name: string;
        description: string;
    };
}

export interface PaymentHistoryListResponse {
    payments: PaymentHistory[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface PaymentHistoryDetail extends PaymentHistory {
    // Add more fields if detail API returns more
} 