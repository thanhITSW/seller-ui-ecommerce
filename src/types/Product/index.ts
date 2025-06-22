export interface Product {
    id: number;
    name: string;
    description: string;
    brand_id: number;
    brand: Brand;
    status: 'pending' | 'approved' | 'hidden' | 'rejected';
    stock: number;
    price: number;
    category: string;
    created_at: string;
    updated_at: string;
}

export interface Brand {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface ProductType {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface Attribute {
    id: number;
    product_type_id: number;
    name: string;
    description: string;
    data_type: 'text' | 'number' | 'boolean' | 'date';
    is_required: boolean;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    product_type_id: number;
    name: string;
    description: string;
    productCount: number;
    created_at: string;
    updated_at: string;
}

export interface ProductApi {
    id: string;
    name: string;
    brand: string;
    import_price: string;
    retail_price: string;
    stock: number;
    seller_id: string;
    seller_name: string;
    approval_status: string;
    active_status: string;
    url_image: string;
    url_registration_license: string;
    product_type_id: string;
    category_id: string;
    import_date?: string;
    return_policy: {
        is_returnable: boolean;
        return_period: number;
        is_exchangeable: boolean;
        return_conditions: string;
    };
    product_details: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface ProductReview {
    id: string;
    user_id: string;
    order_id: string;
    user_fullname: string;
    product_id: string;
    comment: string;
    rating: number;
    createdAt: string;
    updatedAt: string;
}