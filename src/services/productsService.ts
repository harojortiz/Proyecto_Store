import apiClient from "@/lib/api";

export interface Product {
    id: string;
    ref: string;
    nombre: string;
    costoBase: number;
    precioSugerido: number;
    imagen?: string;
    categoriaId: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateProductData {
    ref: string;
    nombre: string;
    costoBase: number;
    precioSugerido: number;
    imagen?: string;
    categoriaId: string;
}

export const productsService = {
    getAll: async (): Promise<Product[]> => {
        const { data } = await apiClient.get(`/products`);
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
