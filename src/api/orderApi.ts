import axiosClient, { handleRequest } from './axiosClient';
import { Order, OrderListResponse } from '../types/Order';
import { HttpResponse } from '../types/http';

function getStoreId() {
    const storeId = localStorage.getItem('store_id');
    if (!storeId) throw new Error('No store_id in localStorage');
    return storeId;
}

const orderApi = {
    getList: (params?: any): Promise<HttpResponse<OrderListResponse>> => {
        const url = `/order/orders?seller_id=${getStoreId()}`;
        return handleRequest(axiosClient.get(url, { params }));
    },
    getOrderById: (id: string): Promise<HttpResponse<{ code: number; message: string; data: Order }>> => {
        const url = `/order/orders/${id}`;
        return handleRequest(axiosClient.get(url));
    },
    getOrderDetails: (id: string): Promise<HttpResponse<{ code: number; message: string; data: any }>> => {
        const url = `/order/orders/details/${id}`;
        return handleRequest(axiosClient.get(url));
    },
    updateOrder: (id: string, data: Partial<Order>): Promise<HttpResponse<any>> => {
        const url = `/order/orders/${id}`;
        return handleRequest(axiosClient.put(url, data));
    },
    cancelOrder: (id: string): Promise<HttpResponse<any>> => {
        const url = `/order/orders/${id}`;
        return handleRequest(axiosClient.delete(url));
    },
    getDetailedOrders: (params?: any): Promise<HttpResponse<any>> => {
        const url = `/order/orders/get-details-order?seller_id=${getStoreId()}`;
        return handleRequest(axiosClient.get(url, { params }));
    },
};

export default orderApi; 