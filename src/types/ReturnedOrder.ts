export interface ReturnedOrder {
    id: string;
    order_return_request_id: string;
    order_id: string;
    seller_id: string;
    seller_name: string;
    user_id: string;
    total_quantity: number;
    return_shipping_fee: string;
    return_shipping_fee_paid_by: string;
    refund_amount: string;
    order_status: 'processing' | 'returned' | 'failed';
    payment_refund_status: 'pending' | 'completed' | 'failed';
    is_completed: boolean;
    returned_at: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ReturnedOrderItem {
    id: string;
    order_return_request_id: string;
    returned_order_id: string;
    product_id: string;
    product_name: string;
    product_price: string;
    product_quantity: number;
    product_url_image: string;
    createdAt: string;
    updatedAt: string;
}

export interface ReturnedOrderListResponse {
    code: number;
    message: string;
    data: ReturnedOrder[];
}

export interface ReturnedOrderDetailResponse {
    code: number;
    message: string;
    data: ReturnedOrderItem[];
} 