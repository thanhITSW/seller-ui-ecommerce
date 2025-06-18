import axiosClient, { handleRequest } from './axiosClient';
import { HttpResponse } from '../types/http';
import { ProductApi } from '../types/Product';
import { ProductType } from '../types/ProductType';
import { Category, Attribute } from '../types/ProductType';
import { ProductReview } from '../types/Product';

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
};

export default productApi; 