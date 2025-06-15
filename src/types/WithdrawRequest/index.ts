export type WithdrawRequestStatus = 'processing' | 'completed' | 'failed';

export interface WithdrawRequest {
    id: string;
    store_id: string;
    amount: number;
    status: WithdrawRequestStatus;
    store_payment_info_id: string;
    createdAt: string;
    updatedAt: string;
}

export interface WithdrawRequestListResponse {
    requests: WithdrawRequest[];
    total: number;
    totalPages: number;
    currentPage: number;
}

export interface WithdrawRequestCreatePayload {
    store_id: string; // always '1' for now
    amount: number;
    store_payment_info_id: string;
}

export interface StorePaymentInfo {
    id: string;
    store_id: string;
    method_type: 'bank_transfer' | 'momo' | 'zalopay';
    account_number: string;
    account_name: string;
    bank_name?: string | null;
    qr_code_url?: string | null;
    is_default: boolean;
    createdAt: string;
    updatedAt: string;
} 