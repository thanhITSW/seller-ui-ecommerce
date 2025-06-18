import axiosClient, { handleRequest } from './axiosClient';
import { WithdrawRequest, WithdrawRequestListResponse, WithdrawRequestCreatePayload, StorePaymentInfo } from '../types/WithdrawRequest';
import { HttpResponse } from '../types/http';

function getStoreId() {
    const storeId = localStorage.getItem('store_id');
    if (!storeId) throw new Error('No store_id in localStorage');
    return storeId;
}

const withdrawRequestApi = {
    getWithdrawRequests: (params?: { page?: number; limit?: number; status?: string }): Promise<HttpResponse<{ code: number; message: string; data: WithdrawRequestListResponse }>> => {
        const url = '/store/withdraw_requests';
        return handleRequest(axiosClient.get(url, { params }));
    },
    createWithdrawRequest: (data: WithdrawRequestCreatePayload): Promise<HttpResponse<{ code: number; message: string; data: WithdrawRequest }>> => {
        const url = '/store/withdraw_requests';
        return handleRequest(axiosClient.post(url, data));
    },
    getStorePaymentInfos: (): Promise<HttpResponse<{ code: number; message: string; data: StorePaymentInfo[] }>> => {
        const url = `/store/store_payment_infos/store/${getStoreId()}`;
        return handleRequest(axiosClient.get(url));
    },
    createStorePaymentInfo: (data: Partial<StorePaymentInfo> & { qr_code_file?: File }): Promise<HttpResponse<any>> => {
        const url = '/store/store_payment_infos';
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (key === 'qr_code_file' && value instanceof File) {
                    formData.append('qr_code', value);
                } else {
                    formData.append(key, value as string);
                }
            }
        });
        return handleRequest(axiosClient.post(url, formData));
    },
    updateStorePaymentInfo: (id: string, data: Partial<StorePaymentInfo> & { qr_code_file?: File }): Promise<HttpResponse<any>> => {
        const url = `/store/store_payment_infos/${id}`;
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (key === 'qr_code_file' && value instanceof File) {
                    formData.append('qr_code', value);
                } else {
                    formData.append(key, value as string);
                }
            }
        });
        return handleRequest(axiosClient.put(url, formData));
    },
    deleteStorePaymentInfo: (id: string): Promise<HttpResponse<any>> => {
        const url = `/store/store_payment_infos/${id}`;
        return handleRequest(axiosClient.delete(url));
    },
};

export default withdrawRequestApi; 