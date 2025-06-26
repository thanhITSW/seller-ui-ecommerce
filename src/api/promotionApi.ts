import axiosClient, { handleRequest } from './axiosClient';
import { HttpResponse } from '../types/http';
import { Promotion, CatalogPromotion } from '../types/Promotion';

function getStoreId() {
    const storeId = localStorage.getItem('store_id');
    if (!storeId) throw new Error('No store_id in localStorage');
    return storeId;
}

const promotionApi = {
    getPromotions: (status = 'active'): Promise<HttpResponse<{ code: number; message: string; data: Promotion[] }>> => {
        const url = `/product/promotions?seller_id=${getStoreId()}&status=${status}`;
        return handleRequest(axiosClient.get(url));
    },
    addPromotion: (data: any): Promise<HttpResponse<any>> => {
        const url = '/product/promotions';
        return handleRequest(axiosClient.post(url, data));
    },
    updatePromotion: (id: string, data: any): Promise<HttpResponse<any>> => {
        const url = `/product/promotions/${id}`;
        return handleRequest(axiosClient.put(url, data));
    },
    deletePromotion: (id: string): Promise<HttpResponse<any>> => {
        const url = `/product/promotions/${id}`;
        return handleRequest(axiosClient.delete(url));
    },
    getCatalogPromotions: (): Promise<HttpResponse<{ code: number; message: string; data: CatalogPromotion[] }>> => {
        const url = '/product/catalog-promotions?status=active';
        return handleRequest(axiosClient.get(url));
    },
    getPromotionProducts: (promotionId: string): Promise<HttpResponse<{ code: number; message: string; total: number; data: any[] }>> => {
        const url = `/product/promotions/${promotionId}/products`;
        return handleRequest(axiosClient.get(url));
    },
    removeProductFromPromotion: (promotionId: string, product_ids: string[]): Promise<HttpResponse<any>> => {
        const url = `/product/promotions/${promotionId}/products`;
        return handleRequest(axiosClient.delete(url, { data: { product_ids } }));
    },
    getProductsNotInPromotion: (): Promise<HttpResponse<{ code: number; message: string; total: number; data: any[] }>> => {
        const storeId = localStorage.getItem('store_id');
        const url = `/product/promotions/not-in-promotion?seller_id=${storeId}`;
        return handleRequest(axiosClient.get(url));
    },
    applyProductsToPromotion: (promotionId: string, product_ids: string[]): Promise<HttpResponse<any>> => {
        const url = `/product/promotions/${promotionId}/products`;
        return handleRequest(axiosClient.post(url, { product_ids }));
    },
    customProductInPromotion: (promotionId: string, product_ids: string[], custom_value: number): Promise<HttpResponse<any>> => {
        const url = `/product/promotions/${promotionId}/products/custom`;
        return handleRequest(axiosClient.put(url, { product_ids, custom_value }));
    },
};

export default promotionApi; 