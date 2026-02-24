import apiClient from '@/lib/api';

// Tipos para las respuestas de analytics
export interface AnalyticsSummary {
    ventas: {
        hoy: {
            total: number;
            cantidad: number;
        };
    };
    clientes: {
        total: number;
    };
    productos: {
        stockBajo: number;
    };
    tendenciaVentas: Array<{
        mes: string;
        total: number;
        cantidad: number;
    }>;
    mesActual: {
        ventas: number;
        ingresos: number;
        ganancias: number;
    };
    comparativa: {
        variacionPorcentual: number;
    };
}

export interface SalesByMonth {
    month: string;
    total: number;
    ganancias: number;
    count: number;
}

export interface SalesByCategory {
    categoriaId: string;
    nombre: string;
    color: string;
    total: number;
    ganancias: number;
    cantidad: number;
}

export interface TopProduct {
    productoId: string;
    nombre: string;
    ref: string;
    categoria: string;
    ventasTotales: number;
    ganancias: number;
    unidadesVendidas: number;
}

export interface TopCustomer {
    clienteId: string;
    nombre: string;
    totalCompras: number;
    cantidadCompras: number;
}

/**
 * Servicio para obtener datos de analytics del backend
 */
export const analyticsService = {
    /**
     * Obtener resumen general
     */
    getSummary: async (): Promise<AnalyticsSummary> => {
        const { data } = await apiClient.get('/analytics/summary');
        return data;
    },

    /**
     * Obtener ventas por mes
     * @param months - Número de meses a consultar (default: 12)
     */
    getSalesByMonth: async (months: number = 12): Promise<SalesByMonth[]> => {
        const { data } = await apiClient.get('/analytics/sales-by-month', {
            params: { months },
        });
        return data;
    },

    /**
     * Obtener ventas por categoría
     */
    getSalesByCategory: async (): Promise<SalesByCategory[]> => {
        const { data } = await apiClient.get('/analytics/sales-by-category');
        return data;
    },

    /**
     * Obtener productos más vendidos
     * @param limit - Número de productos a obtener (default: 5)
     */
    getTopProducts: async (limit: number = 5): Promise<TopProduct[]> => {
        const { data } = await apiClient.get('/analytics/top-products', {
            params: { limit },
        });
        return data;
    },

    /**
     * Obtener clientes con más compras
     * @param limit - Número de clientes a obtener (default: 5)
     */
    getTopCustomers: async (limit: number = 5): Promise<TopCustomer[]> => {
        const { data } = await apiClient.get('/analytics/top-customers', {
            params: { limit },
        });
        return data;
    },

    /**
     * Obtener productos con bajo stock
     */
    getLowStockProducts: async (): Promise<LowStockProduct[]> => {
        const { data } = await apiClient.get('/analytics/low-stock');
        return data;
    },
};

export interface LowStockProduct {
    id: string;
    ref: string;
    nombre: string;
    stock: number;
    stockMinimo: number;
    imagen?: string;
    categoriaId: string;
}
