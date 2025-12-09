import apiClient from "@/lib/api";
import { SaleFromApi } from "@/types";

export interface CreateSaleData {
    modeloId: string;
    ref?: string;
    modelo?: string;
    neto: number;
    iva19: number;
    total: number;
    cuota1?: number;
    cuota2?: number;
    deuda: number;
    venta: number;
    ganancias: number;
    clienteId: string;
    fecha: Date;
    estado: string;
    notas?: string;
    costoBase?: number;
    categoriaId: string;
}

export interface PaginationParams {
    cursor?: string;
    limit?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        nextCursor: string | null;
        hasMore: boolean;
        total?: number;
    };
}

export const obtenerSales = async (params?: PaginationParams): Promise<PaginatedResponse<SaleFromApi>> => {
    const { data } = await apiClient.get(`/sales`, { params });
    // Handle both paginated and non-paginated responses for backward compatibility
    if (Array.isArray(data)) {
        return {
            data,
            pagination: { nextCursor: null, hasMore: false }
        };
    }
    return data;
}

export const crearSale = async (sale: CreateSaleData): Promise<SaleFromApi> => {
    const { data } = await apiClient.post(`/sales`, sale);
    return data;
}

export const actualizarSale = async (id: string, sale: Partial<CreateSaleData>): Promise<SaleFromApi> => {
    const { data } = await apiClient.put(`/sales/${id}`, sale);
    return data;
}

export const eliminarSale = async (id: string): Promise<void> => {
    await apiClient.delete(`/sales/${id}`);
}
