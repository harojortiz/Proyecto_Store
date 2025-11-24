import { useState, useEffect } from "react";
import { useVentasStore } from "@/store/useVentasStore";
import { formatCOP, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, X, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import VentaDialog from "@/components/VentaDialog";
import { useSearchParams } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { obtenerSales } from "@/services/salesService";

export default function Ventas() {
  const { ventas, clientes, categorias, eliminarVenta, obtenerCliente } = useVentasStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroDeuda, setFiltroDeuda] = useState(false);
  const [filtroMes, setFiltroMes] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [ventaDialogOpen, setVentaDialogOpen] = useState(false);
  const [ventaEditando, setVentaEditando] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ventaAEliminar, setVentaAEliminar] = useState<string | null>(null);
  const [sales, setSales] = useState<any[]>([]);

  // Activar filtros al llegar desde Dashboard
  useEffect(() => {
    const filtro = searchParams.get('filtro');
    const categoria = searchParams.get('categoria');

    if (filtro === 'deuda') {
      setFiltroDeuda(true);
    } else if (filtro === 'mes') {
      setFiltroMes(true);
    }

    if (categoria && categoria !== 'todas') {
      setCategoriaSeleccionada(categoria);
    }

    // Limpiar parámetros de la URL
    setSearchParams({});
  }, [searchParams, setSearchParams]);

  const ventasFiltradas = ventas.filter((v) => {
    const cliente = obtenerCliente(v.clienteId);
    const searchLower = searchTerm.toLowerCase();

    const cumpleBusqueda = (
      v.ref.toLowerCase().includes(searchLower) ||
      v.modelo.toLowerCase().includes(searchLower) ||
      cliente?.name.toLowerCase().includes(searchLower) ||
      ''
    );

    const cumpleDeuda = !filtroDeuda || v.deuda > 0;

    const cumpleMes = !filtroMes || (() => {
      const fecha = new Date(v.fecha);
      const now = new Date();
      return fecha.getMonth() === now.getMonth() && fecha.getFullYear() === now.getFullYear();
    })();

    const cumpleCategoria = !categoriaSeleccionada || v.categoriaId === categoriaSeleccionada;

    return cumpleBusqueda && cumpleDeuda && cumpleMes && cumpleCategoria;
  });

  const handleEditarVenta = (id: string) => {
    setVentaEditando(id);
    setVentaDialogOpen(true);
  };

  const handleNuevaVenta = () => {
    setVentaEditando(null);
    setVentaDialogOpen(true);
  };

  const handleEliminarClick = (id: string) => {
    setVentaAEliminar(id);
    setDeleteDialogOpen(true);
  };

  const handleEliminarConfirm = () => {
    if (ventaAEliminar) {
      eliminarVenta(ventaAEliminar);
      toast.success("Venta eliminada correctamente");
      setVentaAEliminar(null);
      setDeleteDialogOpen(false);
    }
  };

  const totales = ventasFiltradas.reduce(
    (acc, v) => ({
      neto: acc.neto + v.neto,
      iva: acc.iva + v.iva19,
      total: acc.total + v.total,
      cuota1: acc.cuota1 + v.cuota1,
      cuota2: acc.cuota2 + v.cuota2,
      deuda: acc.deuda + v.deuda,
      venta: acc.venta + v.venta,
      ganancias: acc.ganancias + v.ganancias,
    }),
    { neto: 0, iva: 0, total: 0, cuota1: 0, cuota2: 0, deuda: 0, venta: 0, ganancias: 0 }
  );

  const getEstadoBadge = (estado: string) => {
    const variants = {
      PAGADA: 'default',
      PARCIAL: 'secondary',
      DEUDA: 'destructive',
    };
    return (
      <Badge variant={variants[estado as keyof typeof variants] as any}>
        {estado}
      </Badge>
    );
  };

  const getSales = async () => {
    const response = await obtenerSales();
    setSales(response);
  }

  useEffect(() => {
    getSales()
  }, []);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Ventas</h1>
          <p className="text-muted-foreground">
            Gestión completa de ventas de relojes
          </p>
        </div>
        <Button onClick={handleNuevaVenta} className="gap-2">
          <Plus className="w-4 h-4" />
          Nueva Venta
        </Button>
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por REF, modelo o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtros:</span>

          <Button
            variant={filtroMes ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltroMes(!filtroMes)}
            className="gap-2"
          >
            {filtroMes && <X className="w-3 h-3" />}
            Este mes
          </Button>

          <Button
            variant={filtroDeuda ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltroDeuda(!filtroDeuda)}
            className="gap-2"
          >
            {filtroDeuda && <X className="w-3 h-3" />}
            Con deuda ({ventas.filter(v => v.deuda > 0).length})
          </Button>

          <div className="h-4 w-px bg-border mx-2" />

          <span className="text-sm text-muted-foreground">Categoría:</span>
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

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">#</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">REF</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Modelo</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">NETO</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">IVA 19%</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Total</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Cuota 1</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Cuota 2</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Cantidad</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Cliente</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Estado</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((venta, index) => {
                
                return (
                  <tr key={venta.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm text-foreground">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{venta.ref}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{venta.modelo}</td>
                    <td className="px-4 py-3 text-sm text-right text-foreground">{formatCOP(venta.price)}</td>
                    <td className="px-4 py-3 text-sm text-right text-muted-foreground">{formatCOP(0)}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-foreground">{formatCOP(venta.total)}</td>
                    <td className="px-4 py-3 text-sm text-right text-foreground">{formatCOP(100)}</td>
                    <td className="px-4 py-3 text-sm text-right text-foreground">{formatCOP(100)}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-warning">{venta.quantity}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{venta?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(venta.created_at)}</td>
                    <td className="px-4 py-3">{"A"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditarVenta(venta.id)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEliminarClick(venta.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-accent/10 border-t-2 border-accent">
              {/* <tr>
                <td colSpan={3} className="px-4 py-3 text-sm font-bold text-foreground">TOTALES</td>
                <td className="px-4 py-3 text-sm text-right font-bold text-foreground">{formatCOP(totales.neto)}</td>
                <td className="px-4 py-3 text-sm text-right font-bold text-foreground">{formatCOP(totales.iva)}</td>
                <td className="px-4 py-3 text-sm text-right font-bold text-foreground">{formatCOP(totales.total)}</td>
                <td className="px-4 py-3 text-sm text-right font-bold text-foreground">{formatCOP(totales.cuota1)}</td>
                <td className="px-4 py-3 text-sm text-right font-bold text-foreground">{formatCOP(totales.cuota2)}</td>
                <td className="px-4 py-3 text-sm text-right font-bold text-foreground">{formatCOP(totales.deuda)}</td>
                <td colSpan={4}></td>
              </tr> */}
            </tfoot>
          </table>
        </div>
      </Card>

      <VentaDialog
        open={ventaDialogOpen}
        onOpenChange={setVentaDialogOpen}
        ventaId={ventaEditando}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente esta venta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEliminarConfirm}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
