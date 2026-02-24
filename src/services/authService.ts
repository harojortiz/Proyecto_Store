import axios from 'axios';
import apiClient from '@/lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface User {
    id: string;
    username: string;
    email: string | null;
    name: string;
    role: 'ADMIN' | 'USER';
    createdAt: string;
}

export interface LoginResponse {
    user: User;
    // Los tokens ahora están en cookies httpOnly, no en la respuesta JSON
}

export interface RegisterData {
    email?: string;
    password: string;
    name: string;
}

export const authService = {
    login: async (username: string, password: string): Promise<LoginResponse> => {
        // withCredentials: true permite que axios envíe y reciba cookies
        const { data } = await axios.post(`${API_URL}/auth/login`,
            { username, password },
            { withCredentials: true }
        );
        return data;
    },

    register: async (registerData: RegisterData): Promise<LoginResponse> => {
        const { data } = await axios.post(`${API_URL}/auth/register`,
            registerData,
            { withCredentials: true }
        );
        return data;
    },

    getCurrentUser: async (): Promise<User> => {
        const { data } = await apiClient.get(`/auth/me`);
        return data;
    },

    updateProfile: async (data: { name: string; email?: string }): Promise<User> => {
        const { data: response } = await apiClient.put(`/auth/profile`, data);
        return response;
    },

    changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
        const { data: response } = await apiClient.put(`/auth/change-password`, data);
        return response;
    },

    refreshToken: async (): Promise<void> => {
        // El refreshToken está en cookies httpOnly, no necesitamos enviarlo manualmente
        await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
    },

    logout: async (): Promise<void> => {
        // Llamar al endpoint de logout para limpiar cookies en el servidor
        try {
            await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
        } catch (error) {
            console.error('Error al hacer logout:', error);
        }
        // Limpiar datos locales
        localStorage.removeItem('user');
    },
};
