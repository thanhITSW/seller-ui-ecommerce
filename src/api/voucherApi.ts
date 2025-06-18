import axiosClient, { handleRequest } from './axiosClient';
import { HttpResponse } from '../types/http';
import { Voucher, VoucherFormData } from '../types/Voucher';

function getStoreId() {
    const storeId = localStorage.getItem('store_id');
    if (!storeId) throw new Error('No store_id in localStorage');
    return storeId;
}

const voucherApi = {
    getVouchers: (): Promise<HttpResponse<{ code: number; message: string; data: Voucher[] }>> => {
        const url = `/discount/vouchers/shop/${getStoreId()}`;
        return handleRequest(axiosClient.get(url));
    },

    getVoucherById: (id: string): Promise<HttpResponse<{ code: number; message: string; data: Voucher }>> => {
        const url = `/discount/vouchers/shop/${getStoreId()}/${id}`;
        return handleRequest(axiosClient.get(url));
    },

    createVoucher: (data: VoucherFormData): Promise<HttpResponse<any>> => {
        const url = `/discount/vouchers/shop/${getStoreId()}`;
        return handleRequest(axiosClient.post(url, data));
    },

    updateVoucher: (id: string, data: Partial<VoucherFormData>): Promise<HttpResponse<any>> => {
        const url = `/discount/vouchers/shop/${getStoreId()}/${id}`;
        return handleRequest(axiosClient.put(url, data));
    },

    updateVoucherStatus: (id: string, data: Partial<VoucherFormData>): Promise<HttpResponse<any>> => {
        const url = `/discount/vouchers/shop/${getStoreId()}/status/${id}`;
        return handleRequest(axiosClient.put(url, data));
    },

    deleteVoucher: (id: string): Promise<HttpResponse<any>> => {
        const url = `/discount/vouchers/shop/${getStoreId()}/${id}`;
        return handleRequest(axiosClient.delete(url));
    },
};

export default voucherApi; 