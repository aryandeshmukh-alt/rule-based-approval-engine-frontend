import api from '@/lib/api';
import { DiscountRequest } from '@/types';
import { transformDiscountRequest } from '@/lib/transformers';

export const discountService = {
    async getMyDiscounts(): Promise<DiscountRequest[]> {
        console.log('GET /discounts/my');
        const response = await api.get<any>('/discounts/my');
        console.log('RAW Response (Discounts):', response.data);
        const data = response.data.data || [];
        return data.map(transformDiscountRequest);
    },

    async requestDiscount(payload: { discountPercentage: number; reason: string }): Promise<DiscountRequest> {
        const apiPayload = {
            discount_percentage: payload.discountPercentage,
            reason: payload.reason,
        };
        console.log('POST /discounts/request:', apiPayload);
        const response = await api.post<any>('/discounts/request', apiPayload);
        console.log('RAW Response (Create Discount):', response.data);
        return transformDiscountRequest(response.data.data || response.data);
    },

    async cancelDiscount(id: number): Promise<void> {
        await api.post(`/discounts/${id}/cancel`);
    },

    async getPendingDiscounts(): Promise<DiscountRequest[]> {
        const response = await api.get<any>('/discounts/pending');
        const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
        return data.map(transformDiscountRequest);
    },

    async approveDiscount(id: number): Promise<void> {
        await api.post(`/discounts/${id}/approve`);
    },

    async rejectDiscount(id: number): Promise<void> {
        await api.post(`/discounts/${id}/reject`);
    }
};
