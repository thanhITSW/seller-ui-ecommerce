import axiosClient, { handleRequest } from './axiosClient';
import { Store } from '../types/Store';
import { HttpResponse } from '../types/http';

const storeApi = {
    getAll: (params?: any): Promise<HttpResponse<{ code: number; message: string; data: { stores: Store[] } }>> => {
        const url = '/store/stores';
        return handleRequest(axiosClient.get(url, { params }));
    },
    getById: (id: string): Promise<HttpResponse<{ code: number; message: string; data: Store }>> => {
        const url = `/store/stores/${id}`;
        return handleRequest(axiosClient.get(url));
    },
    update: (id: string, data: Partial<Store>): Promise<HttpResponse<any>> => {
        const url = `/store/stores/${id}`;
        return handleRequest(axiosClient.put(url, data));
    },
    updateStatus: (id: string, status: string): Promise<HttpResponse<any>> => {
        const url = `/store/stores/${id}/status`;
        return handleRequest(axiosClient.patch(url, { status }));
    },
    delete: (id: string): Promise<HttpResponse<any>> => {
        const url = `/store/stores/${id}`;
        return handleRequest(axiosClient.delete(url));
    },
};

export default storeApi; 