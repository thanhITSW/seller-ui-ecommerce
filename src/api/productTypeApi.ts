import axiosClient, { handleRequest } from './axiosClient';
import { ProductType, Attribute } from '../types/ProductType';
import { Category } from '../types/ProductType';
import { HttpResponse } from '../types/http';

const productTypeApi = {
    getList: (): Promise<HttpResponse<{ code: number; message: string; data: ProductType[] }>> => {
        const url = '/product/product-types/list-product-type';
        return handleRequest(axiosClient.get(url));
    },
    addProductType: (data: Omit<ProductType, 'id'>): Promise<HttpResponse<any>> => {
        const url = '/product/product-types/add-product-type';
        return handleRequest(axiosClient.post(url, data));
    },
    deleteProductType: (id: string): Promise<HttpResponse<any>> => {
        const url = `/product/product-types/delete-product-type/${id}`;
        return handleRequest(axiosClient.delete(url));
    },
    updateProductType: (id: string, data: Omit<ProductType, 'id'>): Promise<HttpResponse<any>> => {
        const url = `/product/product-types/update-product-type/${id}`;
        return handleRequest(axiosClient.put(url, data));
    },
    getCategories: (productTypeId: string): Promise<HttpResponse<{ code: number; message: string; data: Category[] }>> => {
        const url = `/product/product-types/list-category/${productTypeId}`;
        return handleRequest(axiosClient.get(url));
    },
    getDistinctCategoryNames: (): Promise<HttpResponse<{ code: number; message: string; data: string[] }>> => {
        const url = '/product/product-types/category-names';
        return handleRequest(axiosClient.get(url));
    },
    addCategories: (productTypeId: string, data: { category_name: string }[]): Promise<HttpResponse<any>> => {
        const url = `/product/product-types/add-categories/${productTypeId}`;
        return handleRequest(axiosClient.post(url, data));
    },
    deleteCategory: (id: string): Promise<HttpResponse<any>> => {
        const url = `/product/product-types/delete-category/${id}`;
        return handleRequest(axiosClient.delete(url));
    },
    updateCategory: (id: string, data: { category_name: string }): Promise<HttpResponse<any>> => {
        const url = `/product/product-types/update-category/${id}`;
        return handleRequest(axiosClient.put(url, data));
    },
    getAttributes: (productTypeId: string): Promise<HttpResponse<{ code: number; message: string; data: Attribute[] }>> => {
        const url = `/product/product-types/list-detail-attribute/${productTypeId}`;
        return handleRequest(axiosClient.get(url));
    },
    addAttributes: (productTypeId: string, data: { attribute_name: string }[]): Promise<HttpResponse<any>> => {
        const url = `/product/product-types/add-detail-attributes/${productTypeId}`;
        return handleRequest(axiosClient.post(url, data));
    },
    deleteAttribute: (id: string): Promise<HttpResponse<any>> => {
        const url = `/product/product-types/delete-detail-attribute/${id}`;
        return handleRequest(axiosClient.delete(url));
    },
    updateAttribute: (id: string, data: { attribute_name: string }): Promise<HttpResponse<any>> => {
        const url = `/product/product-types/update-detail-attribute/${id}`;
        return handleRequest(axiosClient.put(url, data));
    },
    getProducts: (): Promise<HttpResponse<{ code: number; message: string; total: number; data: any[] }>> => {
        const url = '/product/products/list-product?approval_status=approved';
        return handleRequest(axiosClient.get(url));
    },
};

export default productTypeApi; 