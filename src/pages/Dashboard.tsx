import { useState } from "react";
import { useVentasStore } from "@/store/useVentasStore";
import { formatCOP } from "@/lib/formatters";
import KPICard from "@/components/KPICard";
import { DollarSign, TrendingUp, Package, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { ventas, clientes, categorias, modelos } = useVentasStore();
  const navigate = useNavigate();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);

  // Filtrar ventas del mes actual
  const now = new Date();
  const mesActual = now.getMonth();
  const añoActual = now.getFullYear();

  const ventasFiltradas = ventas.filter((v) => {
    if (categoriaSeleccionada && v.categoriaId !== categoriaSeleccionada) {
      return false;
    }
    return true;
  });

  const ventasMes = ventasFiltradas.filter((v) => {
    const fecha = new Date(v.fecha);
    return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
  });

  // Calcular KPIs
  const ventasDelMes = ventasMes.reduce((sum, v) => sum + v.venta, 0);
  const gananciasDelMes = ventasMes.reduce((sum, v) => sum + v.ganancias, 0);
  const unidadesVendidas = ventasMes.length;
  const deudaPendiente = ventasFiltradas.reduce((sum, v) => sum + v.deuda, 0);

  // Top 5 modelos más vendidos
  const modelosCount = ventasFiltradas.reduce((acc, v) => {
    const modelo = modelos.find(m => m.id === v.modeloId);
    const nombre = modelo ? modelo.nombre : 'Producto desconocido';
    acc[nombre] = (acc[nombre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topModelos = Object.entries(modelosCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Top 5 clientes
  const clientesVentas = ventasFiltradas.reduce((acc, v) => {
    acc[v.clienteId] = (acc[v.clienteId] || 0) + v.venta;
    return acc;
  }, {} as Record<string, number>);

  const topClientes = Object.entries(clientesVentas)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([clienteId, total]) => ({
      cliente: clientes.find((c) => c.customer_id === clienteId),
      total,
    }));

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen de ventas y estadísticas del mes
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-muted-foreground">Filtrar por categoría:</span>
          <Button
            variant={categoriaSeleccionada === null ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoriaSeleccionada(null)}
          >
            Todas
          </Button>
          {categorias.map((cat) => (
            <Button
              key={cat.id}
              variant={categoriaSeleccionada === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoriaSeleccionada(cat.id)}
            >
              {cat.nombre}
            </Button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Ventas del Mes"
          value={formatCOP(ventasDelMes)}
          subtitle={`${unidadesVendidas} unidades`}
          icon={DollarSign}
          variant="default"
          onClick={() => navigate(`/ventas?filtro=mes&categoria=${categoriaSeleccionada || 'todas'}`)}
        />
        <KPICard
          title="Ganancias del Mes"
          value={formatCOP(gananciasDelMes)}
          subtitle={`Margen: ${ventasDelMes > 0 ? ((gananciasDelMes / ventasDelMes) * 100).toFixed(1) : 0}%`}
          icon={TrendingUp}
          variant="success"
          onClick={() => navigate(`/ventas?filtro=mes&categoria=${categoriaSeleccionada || 'todas'}`)}
        />
        <KPICard
          title="Unidades Vendidas"
          value={unidadesVendidas.toString()}
          subtitle="Este mes"
          icon={Package}
          variant="default"
          onClick={() => navigate(`/ventas?filtro=mes&categoria=${categoriaSeleccionada || 'todas'}`)}
        />
        <KPICard
          title="Deuda Pendiente"
          value={formatCOP(deudaPendiente)}
          subtitle={`${ventasFiltradas.filter(v => v.deuda > 0).length} ventas`}
          icon={AlertCircle}
          variant="warning"
          onClick={() => navigate(`/ventas?filtro=deuda&categoria=${categoriaSeleccionada || 'todas'}`)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Top 5 Modelos Más Vendidos
          </h3>
          <div className="space-y-3">
            {topModelos.map(([modelo, cantidad], index) => (
              <div key={`modelo-${index}-${modelo}`} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent-foreground">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {modelo}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {cantidad} {cantidad === 1 ? 'venta' : 'ventas'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Top 5 Clientes
          </h3>
          <div className="space-y-3">
            {topClientes.map(({ cliente, total }, index) => (
              <div key={cliente?.customer_id || `cliente-${index}`} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {cliente?.name || 'Cliente desconocido'}
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {formatCOP(total)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
