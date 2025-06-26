export interface Promotion {
    id: string;
    catalog_promotion_id: string;
    seller_id: string;
    type: 'fixed' | 'percent' | 'same_price';
    value: string;
    start_date: string;
    end_date: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
    name: string;
    product_ids: string[];
}

export interface CatalogPromotion {
    id: string;
    name: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
} 