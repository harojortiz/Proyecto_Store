import apiClient from '@/lib/api';

export interface DashboardData {
    sales: {
        today: { total: number; count: number };
        week: { total: number; count: number };
        month: { total: number; count: number };
    };
    customers: {
        total: number;
        recent: Array<{
            id: string;
            name: string;
            phone: string | null;
            createdAt: string;
        }>;
    };
    products: {
        total: number;
        lowStock: number;
    };
}

export interface SalesTrendData {
    date: string;
    total: number;
    count: number;
}

export const dashboardService = {
    getDashboard: async (): Promise<DashboardData> => {
        const { data } = await apiClient.get('/analytics/dashboard');
        return data;
    },

    getSalesTrend: async (): Promise<SalesTrendData[]> => {
        const { data } = await apiClient.get('/analytics/sales-trend');
        return data;
    },
};
