import apiClient from "@/lib/api";
import { Payment } from "@/types";

export interface CreatePaymentData {
    saleId: string;
    monto: number;
    fecha?: string;
    metodo: 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Otro';
    notas?: string;
}

export const paymentsService = {
    // Obtener pagos de una venta
    getPaymentsBySale: async (saleId: string): Promise<Payment[]> => {
        const { data } = await apiClient.get(`/payments/sale/${saleId}`);
        return data;
    },

    // Crear pago
    createPayment: async (payment: CreatePaymentData): Promise<Payment> => {
        const { data } = await apiClient.post(`/payments`, payment);
        return data;
    },

    // Actualizar pago
    updatePayment: async (id: string, payment: Partial<CreatePaymentData>): Promise<Payment> => {
        const { data } = await apiClient.put(`/payments/${id}`, payment);
        return data;
    },

    // Eliminar pago
    deletePayment: async (id: string): Promise<void> => {
        await apiClient.delete(`/payments/${id}`);
    },
};
