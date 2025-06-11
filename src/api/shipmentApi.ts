import axiosClient, { handleRequest } from './axiosClient';
import { Shipment, ShipmentStatus, ShippingProvider, ShippingAddress } from '../types/Shipment';
import { HttpResponse } from '../types/http';

const shipmentApi = {
    // Shipments
    getShipments: (params?: { page?: number; limit?: number; status?: ShipmentStatus }): Promise<HttpResponse<{ code: number; success: boolean; data: { shipments: Shipment[]; pagination: any } }>> => {
        const url = '/shipment/shipments/shipping';
        return handleRequest(axiosClient.get(url, { params }));
    },
    getShipmentById: (id: number): Promise<HttpResponse<{ code: number; success: boolean; data: Shipment }>> => {
        const url = `/shipment/shipments/shipping/${id}`;
        return handleRequest(axiosClient.get(url));
    },
    createShipment: (data: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<HttpResponse<{ code: number; success: boolean; data: Shipment }>> => {
        const url = '/shipment/shipments/shipping';
        return handleRequest(axiosClient.post(url, data));
    },
    updateShipment: (id: number, data: Partial<Shipment>): Promise<HttpResponse<{ code: number; success: boolean; data: Shipment }>> => {
        const url = `/shipment/shipments/shipping/${id}`;
        return handleRequest(axiosClient.put(url, data));
    },
    deleteShipment: (id: number): Promise<HttpResponse<{ code: number; success: boolean; message: string }>> => {
        const url = `/shipment/shipments/shipping/${id}`;
        return handleRequest(axiosClient.delete(url));
    },

    // Shipping Addresses
    getShippingAddresses: (user_id?: number): Promise<HttpResponse<{ code: number; success: boolean; data: ShippingAddress[] }>> => {
        const url = '/shipment/shipments/addresses';
        const params = user_id ? { user_id } : undefined;
        return handleRequest(axiosClient.get(url, { params }));
    },
    getShippingAddressById: (id: number): Promise<HttpResponse<{ code: number; success: boolean; data: ShippingAddress }>> => {
        const url = `/shipment/shipments/addresses/${id}`;
        return handleRequest(axiosClient.get(url));
    },
    createShippingAddress: (data: Omit<ShippingAddress, 'id' | 'createdAt' | 'updatedAt'>): Promise<HttpResponse<{ code: number; success: boolean; data: ShippingAddress }>> => {
        const url = '/shipment/shipments/addresses';
        return handleRequest(axiosClient.post(url, data));
    },
    updateShippingAddress: (id: number, data: Partial<ShippingAddress>): Promise<HttpResponse<{ code: number; success: boolean; data: ShippingAddress, message: string }>> => {
        const url = `/shipment/shipments/addresses/${id}`;
        return handleRequest(axiosClient.put(url, data));
    },
    deleteShippingAddress: (id: number): Promise<HttpResponse<{ code: number; success: boolean; message: string }>> => {
        const url = `/shipment/shipments/addresses/${id}`;
        return handleRequest(axiosClient.delete(url));
    },
    setDefaultShippingAddress: (id: number): Promise<HttpResponse<{ code: number; success: boolean; message: string; data: ShippingAddress }>> => {
        const url = `/shipment/shipments/addresses/${id}/set-default`;
        return handleRequest(axiosClient.post(url));
    },

    // Shipping Providers
    getShippingProviders: (params?: { page?: number; limit?: number }): Promise<HttpResponse<{ code: number; success: boolean; data: ShippingProvider[] }>> => {
        const url = '/shipment/shipments/providers';
        return handleRequest(axiosClient.get(url, { params }));
    },
    getShippingProviderById: (id: number): Promise<HttpResponse<{ code: number; success: boolean; data: ShippingProvider }>> => {
        const url = `/shipment/shipments/providers/${id}`;
        return handleRequest(axiosClient.get(url));
    },
    createShippingProvider: (data: Omit<ShippingProvider, 'id' | 'createdAt' | 'updatedAt'>): Promise<HttpResponse<{ code: number; success: boolean; data: ShippingProvider }>> => {
        const url = '/shipment/shipments/providers';
        return handleRequest(axiosClient.post(url, data));
    },
    updateShippingProvider: (id: number, data: Partial<ShippingProvider>): Promise<HttpResponse<{ code: number; success: boolean; data: ShippingProvider }>> => {
        const url = `/shipment/shipments/providers/${id}`;
        return handleRequest(axiosClient.put(url, data));
    },
    deleteShippingProvider: (id: number): Promise<HttpResponse<{ code: number; success: boolean; message: string }>> => {
        const url = `/shipment/shipments/providers/${id}`;
        return handleRequest(axiosClient.delete(url));
    },
};

export default shipmentApi; 