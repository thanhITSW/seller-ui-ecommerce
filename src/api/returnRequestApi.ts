import axiosClient, { handleRequest } from './axiosClient';
import { ReturnRequest, ReturnRequestListResponse, ReturnRequestDetail, ReturnRequestResponse } from '../types/Order/returnRequest.types';
import { HttpResponse } from '../types/http';

function getStoreId() {
    const storeId = localStorage.getItem('store_id');
    if (!storeId) throw new Error('No store_id in localStorage');
    return storeId;
}

const returnRequestApi = {
    getList: (params?: any): Promise<HttpResponse<ReturnRequestListResponse>> => {
        const url = `/order/order-returns/requests?seller_id=${getStoreId()}`;
        return handleRequest(axiosClient.get(url, { params }));
    },
    getById: (id: string): Promise<HttpResponse<{ code: number; message: string; data: ReturnRequest }>> => {
        const url = `/order/order-returns/request/${id}`;
        return handleRequest(axiosClient.get(url));
    },
    getDetails: (order_return_request_id: string): Promise<HttpResponse<{ code: number; message: string; data: ReturnRequestDetail[] }>> => {
        const url = `/order/order-returns/request/details?order_return_request_id=${order_return_request_id}`;
        return handleRequest(axiosClient.get(url));
    },
    responseRequest: (request_id: string, data: { status: 'accepted' | 'rejected', response_message: string }): Promise<HttpResponse<ReturnRequestResponse>> => {
        const url = `/order/order-returns/request/${request_id}/response`;
        return handleRequest(axiosClient.put(url, data));
    },
};

export default returnRequestApi; 