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

export interface SaleFilterParams extends PaginationParams {
    search?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    categoriaId?: string;
    estado?: string;
    minAmount?: number;
    maxAmount?: number;
    clienteId?: string;
    paymentMethod?: string;
}

export const obtenerSales = async (params?: SaleFilterParams): Promise<PaginatedResponse<SaleFromApi>> => {
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

export const downloadInvoice = async (id: string): Promise<void> => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const url = `${API_URL}/sales/${id}/invoice`;

    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // Envía cookies httpOnly de autenticación
    });

    if (!response.ok) {
        // Intentar leer el error JSON del servidor
        try {
            const errorJson = await response.json();
            throw new Error(errorJson.error || `Error ${response.status}`);
        } catch {
            throw new Error(`Error al descargar la factura (${response.status})`);
        }
    }

    // Verificar que sea un PDF
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/pdf') && !contentType.includes('application/octet-stream')) {
        try {
            const errorJson = await response.json();
            throw new Error(errorJson.error || 'Respuesta inesperada del servidor');
        } catch {
            throw new Error('La respuesta del servidor no es un PDF válido');
        }
    }

    // Descargar el blob y crear link de descarga
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', `factura-${id.slice(0, 8)}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
}
