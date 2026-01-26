import api from '@/lib/api';
import { ExpenseRequest } from '@/types';
import { transformExpenseRequest } from '@/lib/transformers';

export const expenseService = {
    async getMyExpenses(): Promise<ExpenseRequest[]> {
        console.log('GET /expenses/my');
        const response = await api.get<any>('/expenses/my');
        console.log('RAW Response (Expenses):', response.data);
        const data = response.data.data || [];
        return data.map(transformExpenseRequest);
    },

    async requestExpense(payload: { amount: number; category: string; reason: string }): Promise<ExpenseRequest> {
        console.log('POST /expenses/request:', payload);
        const response = await api.post<any>('/expenses/request', payload);
        console.log('RAW Response (Create Expense):', response.data);
        return transformExpenseRequest(response.data.data || response.data);
    },

    async cancelExpense(id: number): Promise<void> {
        await api.post(`/expenses/${id}/cancel`);
    },

    async getPendingExpenses(): Promise<ExpenseRequest[]> {
        const response = await api.get<any>('/expenses/pending');
        const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
        return data.map(transformExpenseRequest);
    },

    async approveExpense(id: number): Promise<void> {
        await api.post(`/expenses/${id}/approve`);
    },

    async rejectExpense(id: number): Promise<void> {
        await api.post(`/expenses/${id}/reject`);
    }
};
