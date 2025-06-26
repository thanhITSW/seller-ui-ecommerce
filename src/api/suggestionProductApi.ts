import axiosClient, { handleRequest } from './axiosClient';
import { HttpResponse } from '../types/http';
import { ProductApi } from '../types/Product';

function getStoreId() {
    const storeId = localStorage.getItem('store_id');
    if (!storeId) throw new Error('No store_id in localStorage');
    return storeId;
}

const suggestionProductApi = {
    getSuggestionProducts: (approval_status = 'pending'): Promise<HttpResponse<{ code: number; message: string; data: ProductApi[] }>> => {
        const url = `/product/suggestion-products?seller_id=${getStoreId()}&approval_status=${approval_status}`;
        return handleRequest(axiosClient.get(url));
    },
    addSuggestionProduct: (formData: FormData): Promise<HttpResponse<any>> => {
        const url = '/product/suggestion-products';
        return handleRequest(axiosClient.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } }));
    },
    updateSuggestionProduct: (id: string, formData: FormData): Promise<HttpResponse<any>> => {
        const url = `/product/suggestion-products/${id}`;
        return handleRequest(axiosClient.put(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } }));
    },
    deleteSuggestionProduct: (id: string): Promise<HttpResponse<any>> => {
        const url = `/product/suggestion-products/${id}`;
        return handleRequest(axiosClient.delete(url));
    },
};

export default suggestionProductApi; 