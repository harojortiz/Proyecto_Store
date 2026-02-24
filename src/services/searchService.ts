import apiClient from '@/lib/api';

export interface SearchResultItem {
    id: string;
    title: string;
    subtitle: string;
    type: 'product' | 'customer' | 'sale';
    url: string;
}

export interface SearchResults {
    products: SearchResultItem[];
    customers: SearchResultItem[];
    sales: SearchResultItem[];
}

export const searchService = {
    searchGlobal: async (query: string): Promise<SearchResults> => {
        const { data } = await apiClient.get('/search', {
            params: { q: query }
        });
        return data;
    }
};
