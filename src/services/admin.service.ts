import api from '@/lib/api';
import { Holiday } from '@/types';
import { transformHoliday } from '@/lib/transformers';

export const adminService = {
    async getHolidays(): Promise<Holiday[]> {
        const response = await api.get<any[]>('/admin/holidays');
        return response.data.map(transformHoliday);
    },

    async addHoliday(payload: { date: string; description: string }): Promise<Holiday> {
        const response = await api.post<any>('/admin/holidays', payload);
        return transformHoliday(response.data);
    },

    async deleteHoliday(id: number): Promise<void> {
        await api.delete(`/admin/holidays/${id}`);
    }
};
