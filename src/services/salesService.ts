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

export const obtenerSales = async (): Promise<SaleFromApi[]> => {
    const { data } = await apiClient.get(`/sales`);
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
