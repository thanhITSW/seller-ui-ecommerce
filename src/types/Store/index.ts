export interface Store {
    id: string;
    owner_id: string;
    name: string;
    description: string | null;
    avatar_url: string | null;
    banner_url: string | null;
    phone: string;
    email: string;
    address_line: string;
    province_id: number;
    province_name: string;
    district_id: number;
    district_name: string;
    ward_code: string;
    ward_name: string;
    address_detail: string;
    license_url: string;
    balance: number;
    status: StoreStatus;
    createdAt: string;
    updatedAt: string;
    licenses?: StoreLicense[];
    photos?: StorePhoto[];
}

export type StoreStatus = 'active' | 'inactive' | 'pending' | 'rejected' | 'approved' | 'expired';

export interface StoreLicense {
    id: string;
    store_id: string;
    license_type: LicenseType;
    license_number: string;
    license_url: string;
    issued_date: string;
    expired_date: string;
    status: StoreStatus;
    createdAt: string;
    updatedAt: string;
}

export type LicenseType = 'BUSINESS_REGISTRATION' | 'PHARMACIST_CERTIFICATE' | 'PHARMACY_OPERATION_CERTIFICATE' | 'GPP_CERTIFICATE';

export interface StorePhoto {
    id: string;
    store_id: string;
    photo_url: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface StoreListResponse {
    code: number;
    message: string;
    data: {
        stores: Store[];
        total: number;
        totalPages: number;
        currentPage: number;
    };
} 