export interface Store {
    id: string;
    owner_id: string;
    name: string;
    description: string;
    avatar_url: string;
    banner_url: string;
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
}

export type StoreStatus = 'active' | 'inactive' | 'pending' | 'rejected';

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