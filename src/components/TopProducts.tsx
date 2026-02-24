import { TrendingUp, Package } from 'lucide-react';

interface TopProduct {
    id: string;
    name: string;
    price: number;
    category?: { name: string };
    totalSold: number;
    revenue: number;
}

interface TopProductsProps {
    products: TopProduct[];
}

export function TopProducts({ products }: TopProductsProps) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    Productos Más Vendidos
                </h3>
                <TrendingUp className="w-5 h-5 text-green-500" />
            </div>

            {products.length > 0 ? (
                <div className="space-y-4">
                    {products.map((product, index) => (
                        <div
                            key={`${product.id}-${index}`}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-bold text-blue-600">
                                    {index + 1}
                                </span>
                            </div>

                            <div className="flex-shrink-0">
                                <Package className="w-10 h-10 text-gray-400" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {product.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {product.category?.name || 'Sin categoría'}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">
                                    ${(product.revenue || 0).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {product.totalSold} vendidos
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Package className="w-12 h-12 mb-2" />
                    <p>No hay datos de productos vendidos</p>
                </div>
            )}
        </div>
    );
}
