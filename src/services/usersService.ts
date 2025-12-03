import axios from '@/lib/api';
import { User } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface CreateUserData {
    name: string;
    email?: string;
    password: string;
    role: 'ADMIN' | 'USER';
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    password?: string;
    role?: 'ADMIN' | 'USER';
}

export const usersService = {
    findAll: async (): Promise<User[]> => {
        const { data } = await axios.get(`${API_URL}/users`);
        return data;
    },

    create: async (userData: CreateUserData): Promise<User> => {
        const { data } = await axios.post(`${API_URL}/users`, userData);
        return data;
    },

    update: async (id: string, userData: UpdateUserData): Promise<User> => {
        const { data } = await axios.put(`${API_URL}/users/${id}`, userData);
        return data;
    },

    delete: async (id: string): Promise<{ message: string }> => {
        const { data } = await axios.delete(`${API_URL}/users/${id}`);
        return data;
    },
};
