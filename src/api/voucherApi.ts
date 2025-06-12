import axiosClient, { handleRequest } from './axiosClient';
import { HttpResponse } from '../types/http';
import { Voucher, VoucherFormData } from '../types/Voucher';

const voucherApi = {
    getVouchers: (): Promise<HttpResponse<{ code: number; message: string; data: Voucher[] }>> => {
        const url = '/discount/vouchers/shop/1';
        return handleRequest(axiosClient.get(url));
    },

    getVoucherById: (id: string): Promise<HttpResponse<{ code: number; message: string; data: Voucher }>> => {
        const url = `/discount/vouchers/shop/1/${id}`;
        return handleRequest(axiosClient.get(url));
    },

    createVoucher: (data: VoucherFormData): Promise<HttpResponse<any>> => {
        const url = '/discount/vouchers/shop/1';
        return handleRequest(axiosClient.post(url, data));
    },

    updateVoucher: (id: string, data: Partial<VoucherFormData>): Promise<HttpResponse<any>> => {
        const url = `/discount/vouchers/shop/1/${id}`;
        return handleRequest(axiosClient.put(url, data));
    },

    updateVoucherStatus: (id: string, data: Partial<VoucherFormData>): Promise<HttpResponse<any>> => {
        const url = `/discount/vouchers/shop/1/status/${id}`;
        return handleRequest(axiosClient.put(url, data));
    },

    deleteVoucher: (id: string): Promise<HttpResponse<any>> => {
        const url = `/discount/vouchers/shop/1/${id}`;
        return handleRequest(axiosClient.delete(url));
    },
};

export default voucherApi; 