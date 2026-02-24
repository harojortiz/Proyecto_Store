import { useState, useEffect } from "react";
import { useVentasStore } from "@/store/useVentasStore";
import { formatCOP } from "@/lib/formatters";
import { DashboardCard } from "@/components/DashboardCard";
import { SalesChart } from "@/components/SalesChart";
import { CategoryChart } from "@/components/CategoryChart";
import { TopProducts } from "@/components/TopProducts";
import { DollarSign, TrendingUp, Package, AlertCircle, Watch, Users, Gem, ArrowUpRight, TrendingDown, Loader2, ShoppingCart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCardSkeleton, ChartSkeleton } from "@/components/skeletons";
import { CardHeader, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { analyticsService, AnalyticsSummary, SalesByMonth, SalesByCategory, TopProduct, TopCustomer } from "@/services/analyticsService";

// Colores para el gráfico de pie
const COLORS = ['#d4a574', '#8b7355', '#c9b896', '#a08d6c', '#e0c9a6', '#6b5a3c'];

export default function Dashboard() {
  const { categorias } = useVentasStore();
  const navigate = useNavigate();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);

  // Estados para datos de analytics
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [salesByMonth, setSalesByMonth] = useState<SalesByMonth[]>([]);
  const [salesByCategory, setSalesByCategory] = useState<SalesByCategory[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos de analytics
  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        const [summaryData, monthData, categoryData, productsData, customersData, lowStockData] = await Promise.all([
          analyticsService.getSummary(),
          analyticsService.getSalesByMonth(12),
          analyticsService.getSalesByCategory(),
          analyticsService.getTopProducts(5),
          analyticsService.getTopCustomers(5),
          analyticsService.getLowStockProducts(),
        ]);

        setSummary(summaryData);
        setSalesByMonth(monthData);
        setSalesByCategory(categoryData);
        setTopProducts(productsData);
        setTopCustomers(customersData);
        setLowStockProducts(lowStockData);

        // Notificación Proactiva de Stock Crítico
        if (lowStockData.length > 0) {
          toast.error("Alerta de Inventario Luxe", {
            description: `Existen ${lowStockData.length} artículos con stock bajo. Se recomienda revisión inmediata.`,
            action: {
              label: "Ver Inventario",
              onClick: () => navigate('/productos')
            },
            duration: 10000,
          });
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const now = new Date();
  const añoActual = now.getFullYear();
  const mesNombre = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(now);

  if (isLoading) {
    return (
      <div className="space-y-8 pb-20 md:pb-8 animate-in fade-in duration-500">
        {/* Header Skeleton */}
        <div className="relative overflow-hidden rounded-2xl bg-muted p-8 h-[160px] flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div>
              <Skeleton className="h-8 w-[200px] mb-2" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        </div>

        {/* Filter Skeleton */}
        <div className="flex gap-2 mt-8">
          <Skeleton className="h-9 w-[80px]" />
          <Skeleton className="h-9 w-[100px]" />
          <Skeleton className="h-9 w-[100px]" />
        </div>

        {/* Metrics Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>

        {/* Charts Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mt-8">
          <div className="lg:col-span-4">
            <ChartSkeleton />
          </div>
          <div className="lg:col-span-3">
            <ChartSkeleton />
          </div>
        </div>

        {/* Top Products Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
          <Card className="h-[400px]">
            <CardHeader><Skeleton className="h-6 w-[200px]" /></CardHeader>
            <CardContent>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between py-4 border-b">
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[140px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-[80px]" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="h-[400px]">
            <CardHeader><Skeleton className="h-6 w-[200px]" /></CardHeader>
            <CardContent>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between py-4 border-b">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[140px]" />
                    <Skeleton className="h-3 w-[100px]" />
                  </div>
                  <Skeleton className="h-4 w-[80px]" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Header Estilo Luxe - Dashboard */}
      <div className="luxe-header px-10 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">Vista General</h1>
            <p className="text-white/70 text-sm font-bold uppercase tracking-[0.2em]">
              {mesNombre} {añoActual} • V&H LUXE
            </p>
          </div>

          {summary && (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 shadow-xl">
              {summary.comparativa.variacionPorcentual >= 0 ? (
                <TrendingUp className="w-5 h-5 text-accent" />
              ) : (
                <TrendingDown className="w-5 h-5 text-destructive" />
              )}
              <span className={cn(
                "text-sm font-black",
                summary.comparativa.variacionPorcentual >= 0 ? "text-accent" : "text-destructive"
              )}>
                {summary.comparativa.variacionPorcentual >= 0 ? '+' : ''}{summary.comparativa.variacionPorcentual}%
                <span className="text-white/60 font-medium ml-2 font-mono">vs mes anterior</span>
              </span>
            </div>
          )}
        </div>

        {/* Decoración Luxe */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-x-1/4 translate-y-1/4" />
      </div>

      {/* Alerta de Inventario - Más compacta */}
      {lowStockProducts.length > 0 && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-destructive">Artículos con stock bajo</h3>
              <p className="text-xs text-destructive/70 font-medium">Hay {lowStockProducts.length} productos que requieren atención inmediata.</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 font-bold text-[10px] uppercase tracking-widest"
            onClick={() => navigate('/productos')}
          >
            Gestionar Inventario <ArrowUpRight className="w-3 h-3 ml-2" />
          </Button>
        </div>
      )}

      {/* Filtro de categorías - Minimalista */}
      <div className="flex items-center gap-4 py-2 overflow-x-auto no-scrollbar">
        <Button
          variant={categoriaSeleccionada === null ? "default" : "ghost"}
          size="sm"
          onClick={() => setCategoriaSeleccionada(null)}
          className={cn(
            "rounded-full px-5 text-[10px] font-bold uppercase tracking-widest h-8",
            categoriaSeleccionada === null ? "bg-primary shadow-lg" : "text-muted-foreground"
          )}
        >
          Todos
        </Button>
        {categorias.map((cat) => (
          <Button
            key={cat.id}
            variant={categoriaSeleccionada === cat.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setCategoriaSeleccionada(cat.id)}
            className={cn(
              "rounded-full px-5 text-[10px] font-bold uppercase tracking-widest h-8",
              categoriaSeleccionada === cat.id ? "bg-accent shadow-lg shadow-accent/20" : "text-muted-foreground hover:bg-secondary"
            )}
          >
            {cat.nombre}
          </Button>
        ))}
      </div>

      {/* Cards de Métricas Principales */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Ventas de Hoy"
            value={formatCOP(summary.ventas?.hoy?.total ?? 0)}
            subtitle={`${summary.ventas?.hoy?.cantidad ?? 0} ventas cerradas`}
            icon={ShoppingCart}
            color="gold"
          />
          <DashboardCard
            title="Meta Mensual"
            value={summary.mesActual?.ventas ?? 0}
            subtitle="Operaciones este mes"
            icon={TrendingUp}
            color="white"
            trend={{
              value: Math.abs(summary.comparativa?.variacionPorcentual ?? 0),
              isPositive: (summary.comparativa?.variacionPorcentual ?? 0) >= 0
            }}
          />
          <DashboardCard
            title="Clientes"
            value={summary.clientes?.total ?? 0}
            subtitle="Portafolio activo"
            icon={Users}
            color="gold"
          />
          <DashboardCard
            title="Stock Crítico"
            value={summary.productos?.stockBajo ?? 0}
            subtitle="Requiere atención"
            icon={Package}
            color="destructive"
          />
        </div>
      )}

      {/* Gráficos Modernos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Tendencia de Ventas */}
        {summary?.tendenciaVentas && summary.tendenciaVentas.length > 0 && (
          <SalesChart
            data={summary.tendenciaVentas.map(item => ({
              date: item.mes,
              total: item.total,
              count: item.cantidad
            }))}
          />
        )}

        {/* Gráfico de Categorías */}
        {salesByCategory.length > 0 && (
          <CategoryChart data={salesByCategory.map(cat => ({
            name: cat.nombre,
            value: cat.total,
            quantity: cat.cantidad
          }))} />
        )}
      </div>

      {/* Nueva Sección: Top Productos */}
      {/* Nueva Sección: Top Productos */}
      {topProducts.length > 0 && (
        <TopProducts products={topProducts.map(p => ({
          id: p.productoId,
          name: p.nombre,
          price: 0,
          category: { name: p.categoria },
          totalSold: p.unidadesVendidas,
          revenue: p.ventasTotales || p.ganancias || 0
        }))} />
      )}

      {/* Top Clientes */}
      <Card className="luxe-card border-none overflow-hidden p-0">
        <div className="p-6 border-b border-border/50 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg font-bold">Clientes Exclusivos</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/clientes')} className="text-accent hover:text-accent/80 font-bold text-xs uppercase tracking-widest">
              Ver Catálogo <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {topCustomers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No se registran operaciones aún</p>
          ) : (
            topCustomers.map((customer, index) => (
              <div key={`${customer.clienteId}-${index}`} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all",
                    index === 0 ? "bg-accent text-white shadow-lg shadow-accent/20" :
                      "bg-muted text-muted-foreground"
                  )}>
                    0{index + 1}
                  </div>
                  <div>
                    <span className="text-sm font-bold group-hover:text-accent transition-colors block leading-tight">
                      {customer.nombre}
                    </span>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                      {customer.cantidadCompras} adquisiciones
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-accent bg-accent/5 px-4 py-2 rounded-xl border border-accent/10">
                    {formatCOP(customer.totalCompras)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
