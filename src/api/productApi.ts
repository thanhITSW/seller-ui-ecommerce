import axiosClient, { handleRequest } from './axiosClient';
import { HttpResponse } from '../types/http';
import { ProductApi } from '../types/Product';
import { ProductType } from '../types/ProductType';
import { Category, Attribute } from '../types/ProductType';
import { ProductReview, ResponseReview } from '../types/Product';
import { ProductStatistics } from '../types/Product';

function getStoreId() {
    const storeId = localStorage.getItem('store_id');
    if (!storeId) throw new Error('No store_id in localStorage');
    return storeId;
}

const productApi = {
    getProducts: (): Promise<HttpResponse<{ code: number; message: string; total: number; data: ProductApi[] }>> => {
        const url = `/product/products/list-product?approval_status=approved&seller_id=${getStoreId()}`;
        return handleRequest(axiosClient.get(url));
    },
    getPendingProducts: (): Promise<HttpResponse<{ code: number; message: string; total: number; data: ProductApi[] }>> => {
        const url = `/product/products/list-product?approval_status=pending&seller_id=${getStoreId()}`;
        return handleRequest(axiosClient.get(url));
    },
    getBrands: (): Promise<HttpResponse<{ code: number; message: string; data: string[] }>> => {
        const url = '/product/products/brands';
        return handleRequest(axiosClient.get(url));
    },
    getProductById: (id: string): Promise<HttpResponse<{ code: number; message: string; data: ProductApi }>> => {
        const url = `/product/products/${id}`;
        return handleRequest(axiosClient.get(url));
    },
    addProduct: (formData: FormData): Promise<HttpResponse<any>> => {
        const url = '/product/products/add-product';
        return handleRequest(axiosClient.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } }));
    },
    updateProduct: (id: string, formData: FormData): Promise<HttpResponse<any>> => {
        const url = `/product/products/update-product/${id}`;
        return handleRequest(axiosClient.put(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } }));
    },
    deleteProduct: (id: string): Promise<HttpResponse<any>> => {
        const url = `/product/products/delete-product/${id}`;
        return handleRequest(axiosClient.delete(url));
    },
    approvalProduct: (id: string, approval_status: 'approved' | 'rejected'): Promise<HttpResponse<any>> => {
        const url = `/product/products/approval-product/${id}`;
        return handleRequest(axiosClient.put(url, { approval_status }));
    },
    getProductTypes: (): Promise<HttpResponse<{ code: number; message: string; data: ProductType[] }>> => {
        const url = '/product/product-types/list-product-type';
        return handleRequest(axiosClient.get(url));
    },
    getCategoriesByType: (productTypeId: string): Promise<HttpResponse<{ code: number; message: string; data: Category[] }>> => {
        const url = `/product/product-types/list-category/${productTypeId}`;
        return handleRequest(axiosClient.get(url));
    },
    getAttributesByType: (productTypeId: string): Promise<HttpResponse<{ code: number; message: string; data: Attribute[] }>> => {
        const url = `/product/product-types/list-detail-attribute/${productTypeId}`;
        return handleRequest(axiosClient.get(url));
    },
    getProductReviews: (productId: string): Promise<HttpResponse<{ code: number; message: string; data: ProductReview[] }>> => {
        const url = `/product/reviews/${productId}`;
        return handleRequest(axiosClient.get(url));
    },
    deleteReviewByManager: (reviewId: string): Promise<HttpResponse<any>> => {
        const url = `/product/reviews/delete-by-manager/${reviewId}`;
        return handleRequest(axiosClient.delete(url));
    },
    getCatalogProducts: (): Promise<HttpResponse<{ code: number; message: string; total: number; data: any[] }>> => {
        const url = '/product/catalog-products';
        return handleRequest(axiosClient.get(url));
    },
    getReviewStats: (params: { rating?: number[] | number; search?: string; from_date?: string; to_date?: string; seller_id?: string }): Promise<HttpResponse<{
        code: number;
        message: string;
        stats: {
            totalReviews: number;
            goodReviewRatio: number;
            reviewRate: number;
            badReviewsNoResponse: number;
            todayReviews: number;
            starCount: { [key: number]: number };
        };
        data: {
            reviewsWithResponse: ProductReview[];
            reviewsWithoutResponse: ProductReview[];
        };
    }>> => {
        const url = '/product/reviews/stats';
        return handleRequest(axiosClient.get(url, { params }));
    },
    responseReview: (
        review_id: string,
        formData: FormData
    ): Promise<HttpResponse<{ code: number; message: string; data: ResponseReview }>> => {
        const url = `/product/reviews/response/${review_id}`;
        return handleRequest(axiosClient.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } }));
    },
    getProductStatistics: (params?: { startDate?: string; endDate?: string; seller_id?: string }): Promise<HttpResponse<{ code: number; message: string; data: ProductStatistics[] }>> => {
        let url = `/product/reports/products?seller_id=${getStoreId()}`;
        if (params) {
            const query = Object.entries(params)
                .filter(([_, v]) => v)
                .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
                .join('&');
            if (query) url += `?${query}`;
        }
        return handleRequest(axiosClient.get(url));
    },
};

export default productApi; 