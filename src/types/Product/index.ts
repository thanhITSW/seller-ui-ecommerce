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
    seller_id?: string;
    order_id: string;
    user_fullname: string;
    product_id: string;
    product_name?: string;
    product_image?: string;
    comment: string;
    rating: number;
    url_images_related?: string[];
    is_edited?: boolean;
    createdAt: string;
    updatedAt: string;
    response_review?: ResponseReview | null;
}

export interface ResponseReview {
    id: string;
    review_id: string;
    seller_name: string;
    response_comment: string;
    url_image_related?: string | null;
    createdAt: string;
    updatedAt: string;
}