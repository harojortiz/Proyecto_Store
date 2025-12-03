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
    token: string;
}

export interface RegisterData {
    email?: string;
    password: string;
    name: string;
}

export const authService = {
    login: async (username: string, password: string): Promise<LoginResponse> => {
        const { data } = await axios.post(`${API_URL}/auth/login`, { username, password });
        return data;
    },

    register: async (registerData: RegisterData): Promise<LoginResponse> => {
        const { data } = await axios.post(`${API_URL}/auth/register`, registerData);
        return data;
    },

    getCurrentUser: async (token: string): Promise<User> => {
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
};

