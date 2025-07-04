import axiosClient, { handleRequest } from './axiosClient';
import { ReturnedOrder, ReturnedOrderListResponse, ReturnedOrderDetailResponse } from '../types/ReturnedOrder';
import { HttpResponse } from '../types/http';

function getStoreId() {
    const storeId = localStorage.getItem('store_id');
    if (!storeId) throw new Error('No store_id in localStorage');
    return storeId;
}

const returnedOrderApi = {
    getList: (params?: any): Promise<HttpResponse<ReturnedOrderListResponse>> => {
        const url = `/order/order-returns/returned-orders?seller_id=${getStoreId()}`;
        return handleRequest(axiosClient.get(url, { params }));
    },
    getDetailsList: (params?: any): Promise<HttpResponse<any>> => {
        const url = `/order/order-returns/returned-orders-details?seller_id=${getStoreId()}`;
        return handleRequest(axiosClient.get(url, { params }));
    },
    getById: (id: string): Promise<HttpResponse<{ code: number; message: string; data: ReturnedOrder }>> => {
        const url = `/order/order-returns/returned-order/${id}`;
        return handleRequest(axiosClient.get(url));
    },
    getDetail: (returned_order_id: string): Promise<HttpResponse<ReturnedOrderDetailResponse>> => {
        const url = `/order/order-returns/returned-order/details`;
        return handleRequest(axiosClient.get(url, { params: { returned_order_id } }));
    },
    update: (id: string, data: Partial<ReturnedOrder>): Promise<HttpResponse<any>> => {
        const url = `/order/order-returns/returned-order/${id}`;
        return handleRequest(axiosClient.put(url, data));
    },
};

export default returnedOrderApi; 