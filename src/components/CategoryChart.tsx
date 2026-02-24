import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Gem } from 'lucide-react';

interface CategoryChartProps {
    data: Array<{
        name: string;
        value: number;
        quantity: number;
        id?: string; // ID de la categoría para navegación
    }>;
}

const COLORS = ['#d4a574', '#8b7355', '#c9b896', '#a08d6c', '#e0c9a6', '#6b5a3c'];

export function CategoryChart({ data }: CategoryChartProps) {
    const navigate = useNavigate();

    const handlePieClick = (entry: any) => {
        if (entry.name) {
            // Buscamos si tenemos el ID o navegamos por nombre si el sistema lo soporta
            // Por ahora, navegamos a productos con el nombre como parámetro de búsqueda 
            // o mejor aún, si pasamos el id en el data.
            navigate(`/productos?category=${encodeURIComponent(entry.name)}`);
        }
    };

    return (
        <Card className="luxe-card border-none overflow-hidden">
            <CardHeader className="p-6 border-b border-border/50 bg-muted/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Gem className="w-5 h-5 text-accent" />
                    </div>
                    <CardTitle className="text-lg font-bold">Ventas por Categoría</CardTitle>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                {data.length > 0 ? (
                    <>
                        <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    onClick={handlePieClick}
                                    className="cursor-pointer"
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            stroke="transparent"
                                            className="hover:opacity-80 transition-opacity"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Total Ventas']}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        padding: '12px'
                                    }}
                                    itemStyle={{
                                        color: '#1a1a1a',
                                        fontWeight: 'bold',
                                        fontSize: '12px'
                                    }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{
                                        paddingTop: '20px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                            {data.map((item, index) => (
                                <div
                                    key={`${item.name}-${index}`}
                                    onClick={() => handlePieClick(item)}
                                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 cursor-pointer transition-colors border border-transparent hover:border-accent/10 group"
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                                            {item.name}
                                        </span>
                                    </div>
                                    <span className="text-xs font-black text-accent">
                                        {item.quantity} ud.
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
                        <Gem className="w-12 h-12 opacity-10" />
                        <p className="text-sm font-medium">No hay registros de categorías aún</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
