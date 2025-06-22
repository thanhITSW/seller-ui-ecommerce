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
    uploadAvatar: (id: string, file: File): Promise<HttpResponse<any>> => {
        const url = `/store/stores/${id}/avatar`;
        const formData = new FormData();
        formData.append('avatar', file);
        return handleRequest(axiosClient.patch(url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }));
    },
    uploadBanner: (id: string, file: File): Promise<HttpResponse<any>> => {
        const url = `/store/stores/${id}/banner`;
        const formData = new FormData();
        formData.append('banner', file);
        return handleRequest(axiosClient.patch(url, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }));
    },
    getStoreByUserId: (userId: string): Promise<HttpResponse<{ code: number; message: string; data: any }>> => {
        const url = `/store/user_seller_access/user/${userId}`;
        return handleRequest(axiosClient.get(url));
    },
    createStore: (data: any): Promise<HttpResponse<any>> => {
        const url = '/store/stores';
        return handleRequest(axiosClient.post(url, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }));
    },
    updateLicense: (storeId: string, licenseId: string, data: FormData): Promise<HttpResponse<any>> => {
        const url = `/store/stores/${storeId}/license/${licenseId}`;
        return handleRequest(axiosClient.patch(url, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }));
    },
};

export default storeApi; 