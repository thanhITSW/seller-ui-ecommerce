export interface Order {
    id: string;
    user_id: string;
    seller_id: string;
    seller_name: string;
    total_quantity: number;
    original_items_total: string;
    original_shipping_fee: string;
    discount_amount_items: string;
    discount_amount_shipping: string;
    discount_amount_items_platform_allocated: string;
    discount_amount_shipping_platform_allocated: string;
    final_total: string;
    payment_method: string;
    payment_status: string;
    order_status: string;
    is_completed: boolean;
    payment_id: string | null;
    shipment_id: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface OrderListResponse {
    code: number;
    message: string;
    data: Order[];
} 