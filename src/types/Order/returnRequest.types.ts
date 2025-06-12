export interface ReturnRequest {
    id: string;
    order_id: string;
    seller_id: string;
    user_id: string;
    reason: string;
    return_shipping_fee_paid_by: string;
    customer_message: string;
    request_at: string;
    response_message: string | null;
    response_at: string | null;
    status: 'requested' | 'accepted' | 'rejected';
    customer_shipping_address_id: string;
    createdAt: string;
    updatedAt: string;
    Order: {
        id: string;
        total_quantity: number;
        final_total: string;
        createdAt: string;
        updatedAt: string;
    };
}

export interface ReturnRequestListResponse {
    code: number;
    message: string;
    data: ReturnRequest[];
}

export interface ReturnRequestDetail {
    id: string;
    order_return_request_id: string;
    returned_order_id: string | null;
    product_id: string;
    product_name: string;
    product_price: string;
    product_quantity: number;
    product_url_image: string;
    createdAt: string;
    updatedAt: string;
}

export interface ReturnRequestResponse {
    code: number;
    message: string;
    data: ReturnRequest;
} 