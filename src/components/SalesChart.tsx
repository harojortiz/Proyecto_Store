import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCOP } from '@/lib/formatters';

interface SalesChartProps {
    data: Array<{
        date: string;
        total: number;
        count: number;
    }>;
}

export function SalesChart({ data }: SalesChartProps) {
    const navigate = useNavigate();

    // Formatear datos para el gráfico
    const chartData = data.map(item => ({
        ...item,
        fecha: new Date(item.date).toLocaleDateString('es-ES', {
            month: 'short',
            day: 'numeric'
        }),
        originalDate: item.date
    }));

    const handlePointClick = (data: any) => {
        if (data && data.originalDate) {
            // Navegar a ventas filtradas por fecha (si el sistema lo soporta)
            // Por ahora, navegamos a la lista general de ventas.
            navigate('/ventas');
        }
    };

    const totalVentas = data.reduce((sum, item) => sum + item.total, 0);

    return (
        <Card className="luxe-card border-none overflow-hidden h-full">
            <CardHeader className="p-6 border-b border-border/50 bg-muted/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-accent" />
                        </div>
                        <CardTitle className="text-lg font-bold">Historial de Ventas</CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/ventas')}
                        className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-accent/80"
                    >
                        Detalle <ArrowUpRight className="w-3 h-3 ml-1" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <div className="mb-6 flex items-end gap-2">
                    <span className="text-2xl font-black text-primary">{formatCOP(totalVentas)}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Total Periodo</span>
                </div>

                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} onClick={(e: any) => e && e.activePayload && handlePointClick(e.activePayload[0].payload)}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis
                                dataKey="fecha"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                                width={45}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    padding: '12px'
                                }}
                                itemStyle={{
                                    color: '#d4a574',
                                    fontWeight: 'bold',
                                    fontSize: '12px'
                                }}
                                labelStyle={{
                                    color: '#64748b',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    marginBottom: '4px'
                                }}
                                formatter={(value: number) => [formatCOP(value), 'Ingresos']}
                            />
                            <Line
                                type="monotone"
                                dataKey="total"
                                stroke="#d4a574"
                                strokeWidth={4}
                                dot={{ fill: '#d4a574', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#000' }}
                                animationDuration={1500}
                                className="cursor-pointer"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
