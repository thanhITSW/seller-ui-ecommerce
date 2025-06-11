export interface ProductType {
    id: string;
    product_type_name: string;
}

export interface Attribute {
    id: string;
    product_type_id: string;
    attribute_name: string;
}

export interface Category {
    id: string;
    product_type_id: string;
    category_name: string;
}

export interface ProductTypeWithDetails extends ProductType {
    attributes: Attribute[];
    categories: Category[];
} 