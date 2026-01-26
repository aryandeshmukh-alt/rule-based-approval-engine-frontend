import api from '@/lib/api';
import { User } from '@/types';

interface LoginResponse {
    message: string;
    user: User;
}

interface RegisterResponse {
    message: string;
    user: User;
}

export const authService = {
    async login(email: string, password: string): Promise<User> {
        const response = await api.post<any>('/auth/login', { email, password });
        console.log('Login API Response:', response.data);

        // Map backend response to User object
        // Backend returns: { data: { role: "EMPLOYEE" }, message: "...", success: true }
        // We need to construct a User object. Since backend doesn't return ID/Name/Email in this specific response from the logs,
        // we might need to rely on what we have, or maybe the logs were partial.
        // Assuming we at least get the role. Ideally backend should return full user info.
        // For now, we'll extract what we can and maybe fetch /me if needed, or just construct minimal user.

        const responseData = response.data.data || response.data; // Handle nested data if present

        if (!responseData.role) {
            console.error('Missing role in login response', response.data);
            throw new Error('Invalid login response: Missing role');
        }

        const user: User = {
            id: responseData.id || 0,
            name: responseData.name || email.split('@')[0], // Derive name from email
            email: email,
            role: responseData.role.toLowerCase() as any,
        };

        return user;
    },

    async register(name: string, email: string, password: string): Promise<User> {
        const response = await api.post<RegisterResponse>('/auth/register', { name, email, password });
        return response.data.user;
    },

    async logout(): Promise<void> {
        await api.post('/auth/logout');
    },
};
