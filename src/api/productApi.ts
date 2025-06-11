import axiosClient, { handleRequest } from './axiosClient';
import { HttpResponse } from '../types/http';
import { ProductApi } from '../types/Product';
import { ProductType } from '../types/ProductType';
import { Category, Attribute } from '../types/ProductType';

const productApi = {
    getProducts: (): Promise<HttpResponse<{ code: number; message: string; total: number; data: ProductApi[] }>> => {
        const url = '/product/products/list-product?approval_status=approved';
        return handleRequest(axiosClient.get(url));
    },
    getPendingProducts: (): Promise<HttpResponse<{ code: number; message: string; total: number; data: ProductApi[] }>> => {
        const url = '/product/products/list-product?approval_status=pending';
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
};

export default productApi; 