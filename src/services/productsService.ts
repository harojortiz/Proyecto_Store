import apiClient from "@/lib/api";
import { PaginationParams, PaginatedResponse } from "./salesService";

export interface Product {
    id: string;
    ref: string;
    nombre: string;
    costoBase: number;
    precioSugerido: number;
    imagen?: string;
    categoriaId: string;
    stock: number;
    stockMinimo: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateProductData {
    ref: string;
    nombre: string;
    costoBase: number;
    precioSugerido: number;
    imagen?: string;
    stock?: number;
    stockMinimo?: number;
    categoriaId: string;
}

export interface ProductFilterParams extends PaginationParams {
    search?: string;
    categoriaId?: string;
    minPrice?: number;
    maxPrice?: number;
    stockStatus?: 'low' | 'out' | 'available';
    ordenPrecio?: 'asc' | 'desc';
    material?: string;
    stone?: string;
}

export const productsService = {
    getAll: async (params?: ProductFilterParams): Promise<PaginatedResponse<Product> | Product[]> => {
        const { data } = await apiClient.get(`/products`, { params });
        return data;
    },

    create: async (product: CreateProductData): Promise<Product> => {
        const { data } = await apiClient.post(`/products`, product);
        return data;
    },

    update: async (id: string, product: Partial<CreateProductData>): Promise<Product> => {
        const { data } = await apiClient.put(`/products/${id}`, product);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/products/${id}`);
    },
};
