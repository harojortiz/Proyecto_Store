import { useState, useEffect, useRef, useCallback } from "react";
import { useVentasStore } from "@/store/useVentasStore";
import { formatCOP, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, X, Filter, DollarSign, Loader2, FileDown, FileSpreadsheet, FileText, LayoutGrid, ChevronRight, Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import VentaDialog from "@/components/VentaDialog";
import PaymentsDialog from "@/components/PaymentsDialog";
import { SaleFilterBar } from "@/components/SaleFilterBar";
import { TableSkeleton } from "@/components/skeletons";
import { useSearchParams } from "react-router-dom";
import { exportVentasToPDF, exportVentasToExcel } from "@/services/exportService";
import { downloadInvoice } from "@/services/salesService";
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
import { cn } from "@/lib/utils";

export default function Ventas() {
  const {
    ventas,
    eliminarVenta,
    obtenerCliente,
    obtenerVentas,
    cargarMasVentas,
    hasMore,
    isLoading,
    categorias,
    salesFilters,
    setSalesFilters
  } = useVentasStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const [ventaDialogOpen, setVentaDialogOpen] = useState(false);
  const [ventaEditando, setVentaEditando] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ventaAEliminar, setVentaAEliminar] = useState<string | null>(null);
  const [paymentsDialogOpen, setPaymentsDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);

  // Observer for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLTableRowElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        cargarMasVentas();
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, cargarMasVentas]);

  useEffect(() => {
    obtenerVentas(true);
  }, []);

  useEffect(() => {
    const filtro = searchParams.get('filtro');
    const categoria = searchParams.get('categoria');

    if (filtro === 'deuda') {
      setSalesFilters({ estado: 'DEUDA' });
    } else if (filtro === 'mes') {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      setSalesFilters({ fechaDesde: firstDay, fechaHasta: lastDay });
    }

    if (categoria && categoria !== 'todas') {
      setSalesFilters({ categoriaId: categoria });
    }

    if (searchParams.get('action') === 'new') {
      handleNuevaVenta();
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('action');
      setSearchParams(newParams, { replace: true });
    }

    if (filtro || categoria) {
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalesFilters({ search: e.target.value });
  };

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

  const handleDownloadInvoice = async (ventaId: string) => {
    setDownloadingInvoice(ventaId);
    try {
      await downloadInvoice(ventaId);
    } catch {
      toast.error("No se pudo descargar la factura");
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'PAGADA':
        return <span className="badge-excellent">Pagada</span>;
      case 'PARCIAL':
        return <span className="badge-good">Parcial</span>;
      case 'DEUDA':
        return <span className="badge-warning">Deuda</span>;
      default:
        return <span className="badge-cancel">Cancelada</span>;
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Estilo Luxe - Gestión de Ventas */}
      <div className="luxe-header mb-8">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
              <DollarSign className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gestión de Ventas</h1>
              <p className="text-white/70 text-sm flex items-center gap-2 font-medium">
                <LayoutGrid className="w-4 h-4 text-accent" />
                Control de Ingresos y Seguimiento
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => exportVentasToPDF(ventas, (id) => obtenerCliente(id)?.name || '-')}
              className="h-11 px-4 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 font-bold backdrop-blur-sm"
            >
              <FileDown className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button
              variant="ghost"
              onClick={() => exportVentasToExcel(ventas, (id) => obtenerCliente(id)?.name || '-')}
              className="h-11 px-4 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 font-bold backdrop-blur-sm"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>

        {/* Decoración Luxe */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Sales Table Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="luxe-card border-none">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
              <h3 className="text-lg font-bold">Ventas Recientes</h3>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar ventas..."
                    value={salesFilters.search || ''}
                    onChange={handleSearchChange}
                    className="pl-10 h-10 bg-muted/50 border-none rounded-xl focus-visible:ring-accent/20 font-medium"
                  />
                </div>
              </div>
            </div>

            {isLoading && ventas.length === 0 ? (
              <TableSkeleton rows={8} />
            ) : (
              <div className="overflow-x-auto -mx-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">REF</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Modelo / Cliente</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Total</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {ventas.map((venta, index) => {
                      const isLastElement = index === ventas.length - 1;
                      return (
                        <tr
                          key={venta.id}
                          ref={isLastElement ? lastElementRef : null}
                          className="hover:bg-secondary/20 transition-colors group"
                        >
                          <td className="px-6 py-5">
                            <span className="text-sm font-bold text-primary dark:text-slate-100">{venta.ref || venta.product?.ref}</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-primary/80 dark:text-slate-200">{venta.modelo || venta.product?.nombre}</span>
                              <span className="text-[10px] text-muted-foreground font-medium uppercase">{venta.customer?.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right text-sm font-bold text-primary dark:text-white">
                            {formatCOP(venta.total)}
                          </td>
                          <td className="px-6 py-5 text-center">
                            {getEstadoBadge(venta.estado)}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownloadInvoice(venta.id)}
                                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-accent"
                                title="Descargar Factura PDF"
                                disabled={downloadingInvoice === venta.id}
                              >
                                {downloadingInvoice === venta.id
                                  ? <Loader2 className="w-4 h-4 animate-spin" />
                                  : <Receipt className="w-4 h-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditarVenta(venta.id)}
                                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEliminarClick(venta.id)}
                                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Summary Area (Similar to Recommended Items / New Order in image) */}
        <div className="space-y-6">
          <Card className="luxe-card luxe-gradient text-white overflow-hidden relative border-none">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-6">Vista Rápida</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest mb-1">Total en Ventas</p>
                  <p className="text-3xl font-black">{formatCOP(ventas.reduce((acc, v) => acc + v.total, 0))}</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest mb-1">Pendiente de Cobro</p>
                    <p className="text-xl font-bold text-accent">{formatCOP(ventas.reduce((acc, v) => acc + v.deuda, 0))}</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Abstract Background Element */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-3xl opacity-50" />
          </Card>

          <Card className="luxe-card border-none">
            <h3 className="text-lg font-bold mb-6">Categorías</h3>
            <div className="space-y-2">
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSalesFilters({ categoriaId: salesFilters.categoriaId === cat.id ? undefined : cat.id })}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-all font-bold text-xs uppercase tracking-wider",
                    salesFilters.categoriaId === cat.id
                      ? "bg-accent text-white"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  <span>{cat.nombre}</span>
                  <ChevronRight className={cn("w-4 h-4 opacity-50", salesFilters.categoriaId === cat.id && "opacity-100")} />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {ventaDialogOpen && (
        <VentaDialog
          open={ventaDialogOpen}
          onOpenChange={setVentaDialogOpen}
          ventaId={ventaEditando}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2rem] border-none p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium pt-2">
              Esta acción no se puede deshacer. La venta será eliminada permanentemente de los registros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel className="rounded-xl border-border h-11 px-6 font-semibold">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEliminarConfirm} className="rounded-xl bg-red-600 hover:bg-red-700 h-11 px-6 font-bold shadow-lg shadow-red-100">
              Eliminar Registro
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PaymentsDialog
        open={paymentsDialogOpen}
        onOpenChange={setPaymentsDialogOpen}
        saleId={selectedSale?.id || ''}
        saleTotal={selectedSale?.total || 0}
        saleDeuda={selectedSale?.deuda || 0}
        onPaymentCreated={() => {
          obtenerVentas(true);
        }}
      />
    </div>
  );
}
