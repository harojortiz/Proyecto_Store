import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useVentasStore } from "@/store/useVentasStore";
import { formatCOP } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Pencil, Trash2, Phone, Mail, FileText, Loader2, ChevronRight, User, Users, LayoutGrid } from "lucide-react";
import ClienteDialog from "@/components/ClienteDialog";
import { CustomerFilterBar } from "@/components/CustomerFilterBar";
import { CustomerCardSkeleton } from "@/components/skeletons";
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

export default function Clientes() {
  const {
    ventas,
    eliminarCliente,
    clientes,
    obtenerClientes,
    cargarMasClientes,
    customersHasMore,
    customersIsLoading,
    customerFilters,
    setCustomerFilters
  } = useVentasStore();

  const [clienteDialogOpen, setClienteDialogOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState<string | null>(null);

  // Observer for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (customersIsLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && customersHasMore) {
        cargarMasClientes();
      }
    });

    if (node) observer.current.observe(node);
  }, [customersIsLoading, customersHasMore, cargarMasClientes]);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    obtenerClientes(true);

    // Abrir diálogo de nuevo cliente si viene por parámetro
    if (searchParams.get('action') === 'new') {
      handleNuevoCliente();
      // Limpiar el parámetro para evitar que se abra de nuevo al recargar
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('action');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerFilters({ search: e.target.value });
  };

  const getClienteStats = (clienteId: string) => {
    const ventasCliente = ventas.filter((v) => v.clienteId === clienteId);
    const totalCompras = ventasCliente.reduce((sum, v) => sum + v.total, 0); // Usar total en lugar de venta
    const deudaTotal = ventasCliente.reduce((sum, v) => sum + v.deuda, 0);
    return {
      compras: ventasCliente.length,
      totalCompras,
      deudaTotal,
    };
  };

  const handleEditarCliente = (id: string) => {
    setClienteEditando(id);
    setClienteDialogOpen(true);
  };

  const handleNuevoCliente = () => {
    setClienteEditando(null);
    setClienteDialogOpen(true);
  };

  const handleEliminarClick = (id: string) => {
    const ventasCliente = ventas.filter((v) => v.clienteId === id);
    if (ventasCliente.length > 0) {
      toast.error("No se puede eliminar un cliente con ventas asociadas");
      return;
    }
    setClienteAEliminar(id);
    setDeleteDialogOpen(true);
  };

  const handleEliminarConfirm = () => {
    if (clienteAEliminar) {
      eliminarCliente(clienteAEliminar);
      toast.success("Cliente eliminado correctamente");
      setClienteAEliminar(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Estilo Luxe - Clientes */}
      <div className="luxe-header">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Directorio de Clientes</h1>
              <p className="text-white/70 text-sm flex items-center gap-2 font-medium">
                <User className="w-4 h-4 text-accent" />
                Gestión y Seguimiento de Cartera
              </p>
            </div>
          </div>
        </div>

        {/* Decoración Luxe */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
      </div>

      <Card className="luxe-card border-none p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, teléfono, documento o correo..."
              value={customerFilters.search || ''}
              onChange={handleSearchChange}
              className="pl-11 h-12 bg-muted/50 border-none rounded-xl focus-visible:ring-accent/20 font-medium"
            />
          </div>
          <CustomerFilterBar />
        </div>
      </Card>

      {customersIsLoading && clientes.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <CustomerCardSkeleton key={i} />
          ))}
        </div>
      ) : clientes.length === 0 ? (
        <Card className="luxe-card border-none p-12 text-center text-muted-foreground font-medium bg-muted/30">
          No se encontraron clientes que coincidan con la búsqueda
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {clientes.map((cliente, index) => {
            if (!cliente) return null;
            const stats = getClienteStats(cliente?.customer_id);
            const isLastElement = index === clientes.length - 1;

            return (
              <Card
                key={cliente?.customer_id || index}
                className="luxe-card border-none hover:translate-y-[-4px] group"
                ref={isLastElement ? lastElementRef : null}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-primary dark:text-white leading-tight">
                        {cliente?.name}
                      </h3>
                      {cliente?.documento && (
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                          DOC: {cliente?.documento}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditarCliente(cliente?.customer_id)}
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEliminarClick(cliente?.customer_id)}
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {cliente?.phone && (
                    <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                      <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      {cliente?.phone}
                    </div>
                  )}
                  {cliente?.email && (
                    <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                      <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="truncate">{cliente?.email}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/40">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Total Compras</p>
                    <p className="text-sm font-bold text-primary flex items-center gap-1.5">
                      <LayoutGrid className="w-3.5 h-3.5 text-muted-foreground/40" />
                      {stats.compras} pedidos
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Ingresos</p>
                    <p className="text-base font-black text-accent">
                      {formatCOP(stats.totalCompras)}
                    </p>
                  </div>
                </div>

                {stats.deudaTotal > 0 && (
                  <div className="mt-4 p-3 rounded-xl bg-destructive/5 border border-destructive/10 flex justify-between items-center text-destructive">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Saldo Pendiente</span>
                    <span className="text-sm font-black">{formatCOP(stats.deudaTotal)}</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {customersIsLoading && (
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
        </div>
      )}

      <ClienteDialog
        open={clienteDialogOpen}
        onOpenChange={setClienteDialogOpen}
        clienteId={clienteEditando}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2rem] border-none p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Delete Customer?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium pt-2">
              This will permanently remove the customer profile. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel className="rounded-xl border-border h-11 px-6 font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEliminarConfirm} className="rounded-xl bg-red-600 hover:bg-red-700 h-11 px-6 font-bold shadow-lg shadow-red-100">
              Delete Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
