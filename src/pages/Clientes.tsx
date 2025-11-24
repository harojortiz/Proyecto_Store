import { useState, useEffect } from "react";
import { useVentasStore } from "@/store/useVentasStore";
import { formatCOP } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Pencil, Trash2, Phone, Mail, FileText } from "lucide-react";
import ClienteDialog from "@/components/ClienteDialog";
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

export default function Clientes() {
  const { ventas, eliminarCliente, clientes, obtenerClientes } = useVentasStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [clienteDialogOpen, setClienteDialogOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState<string | null>(null);


//TODO: applementar api de clientes  Server listening on http://localhost:3000 para obtener la data de clientes
//   [Nest] 9796  - 28/10/2025, 3:51:49 p. m.     LOG [RouterExplorer] Mapped {/customers, POST} route +1ms
// [Nest] 9796  - 28/10/2025, 3:51:49 p. m.     LOG [RouterExplorer] Mapped {/customers, POST} route +1ms
// [Nest] 9796  - 28/10/2025, 3:51:49 p. m.     LOG [RouterExplorer] Mapped {/customers, GET} route +2ms
// [Nest] 9796  - 28/10/2025, 3:51:49 p. m.     LOG [RouterExplorer] Mapped {/customers/:id, GET} route +1ms
// [Nest] 9796  - 28/10/2025, 3:51:49 p. m.     LOG [RouterExplorer] Mapped {/customers/:id, PUT} route +0ms
// [Nest] 9796  - 28/10/2025, 3:51:49 p. m.     LOG [RouterExplorer] Mapped {/customers/:id, DELETE} route +1ms
const clientesFiltrados = clientes.filter((c) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      c?.name?.toLowerCase().includes(searchLower) ||
      c?.phone?.toLowerCase().includes(searchLower) ||
      c?.documento?.toLowerCase().includes(searchLower) ||
      c?.email?.toLowerCase().includes(searchLower) ||
      ''
    );
  });

  const getClienteStats = (clienteId: string) => {
    const ventasCliente = ventas.filter((v) => v.clienteId === clienteId);
    const totalCompras = ventasCliente.reduce((sum, v) => sum + v.venta, 0);
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

  useEffect(() => {
    obtenerClientes();
  }, []);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Clientes</h1>
          <p className="text-muted-foreground">
            Gestión de clientes y su historial de compras
          </p>
        </div>
        <Button onClick={handleNuevoCliente} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, teléfono, documento o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientesFiltrados.map((cliente) => {
          const stats = getClienteStats(cliente?.customer_id);
          return (
            <Card key={cliente?.customer_id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {cliente?.name}
                  </h3>
                  {cliente?.documento && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {cliente?.documento}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditarCliente(cliente?.customer_id)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEliminarClick(cliente?.customer_id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {cliente?.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {cliente?.phone}
                  </p>
                )}
                {cliente?.email && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {cliente?.email}
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Compras:</span>
                  <span className="font-semibold text-foreground">{stats.compras}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold text-foreground">
                    {formatCOP(stats.totalCompras)}
                  </span>
                </div>
                {stats.deudaTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deuda:</span>
                    <span className="font-semibold text-warning">
                      {formatCOP(stats.deudaTotal)}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {clientesFiltrados.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            No se encontraron clientes que coincidan con tu búsqueda
          </p>
        </Card>
      )}

      <ClienteDialog
        open={clienteDialogOpen}
        onOpenChange={setClienteDialogOpen}
        clienteId={clienteEditando}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este cliente.
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
