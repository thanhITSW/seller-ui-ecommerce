import axiosClient, { handleRequest } from './axiosClient';
import { PaymentMethod, PaymentHistory, PaymentHistoryListResponse, PaymentStatus } from '../types/Payment';
import { HttpResponse } from '../types/http';

function getStoreId() {
    const storeId = localStorage.getItem('store_id');
    if (!storeId) throw new Error('No store_id in localStorage');
    return storeId;
}

const paymentApi = {
    getPaymentMethods: (): Promise<HttpResponse<{ code: number; success: boolean; data: PaymentMethod[] }>> => {
        const url = '/payment/payments/methods';
        return handleRequest(axiosClient.get(url));
    },
    createPaymentMethod: (data: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>): Promise<HttpResponse<any>> => {
        const url = '/payment/payments/methods';
        return handleRequest(axiosClient.post(url, data));
    },
    updatePaymentMethod: (id: string, data: Partial<PaymentMethod>): Promise<HttpResponse<any>> => {
        const url = `/payment/payments/methods/${id}`;
        return handleRequest(axiosClient.put(url, data));
    },
    deletePaymentMethod: (id: string): Promise<HttpResponse<any>> => {
        const url = `/payment/payments/methods/${id}`;
        return handleRequest(axiosClient.delete(url));
    },
    getPaymentHistory: (params?: { from_date?: string; to_date?: string; status?: PaymentStatus; page?: number; limit?: number }): Promise<HttpResponse<{ code: number; success: boolean; data: PaymentHistoryListResponse }>> => {
        const url = `/payment/payments/history?seller_id=${getStoreId()}`;
        return handleRequest(axiosClient.get(url, { params }));
    },
    getPaymentDetails: (id: string): Promise<HttpResponse<{ code: number; success: boolean; data: PaymentHistory }>> => {
        const url = `/payment/payments/${id}`;
        return handleRequest(axiosClient.get(url));
    },
    updatePaymentStatus: (id: string, status: PaymentStatus): Promise<HttpResponse<any>> => {
        const url = `/payment/payments/${id}/status`;
        return handleRequest(axiosClient.patch(url, { status }));
    },
};

export default paymentApi; 