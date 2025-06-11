export type ShipmentStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';

export interface Shipment {
    id: number;
    order_id: number;
    shipping_provider_id: number;
    shipping_address_from_id: number;
    shipping_address_to_id: number;
    status: ShipmentStatus;
    estimated_delivery: string; // ISO date string
    createdAt?: string;
    updatedAt?: string;
}

export interface ShippingProvider {
    id: number;
    name: string;
    tracking_url?: string;
    status: 'active' | 'inactive';
    createdAt?: string;
    updatedAt?: string;
}

export interface ShippingAddress {
    id: number;
    address_name: string;
    user_id: number;
    full_name: string;
    phone: string;
    province_id: number;
    province_name: string;
    district_id: number;
    district_name: string;
    ward_code: string;
    ward_name: string;
    address_detail: string;
    is_default?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ShipmentListResponse {
    shipments: Shipment[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ShippingProviderListResponse {
    providers: ShippingProvider[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ShippingAddressListResponse {
    addresses: ShippingAddress[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
} 