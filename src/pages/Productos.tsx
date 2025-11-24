import { useState } from "react";
import { useVentasStore } from "@/store/useVentasStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Search, Package, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCOP } from "@/lib/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import ModeloDialog from "@/components/ModeloDialog";
import { Modelo } from "@/types";

export default function Productos() {
  const { modelos, categorias, eliminarModelo } = useVentasStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("todas");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModelo, setEditingModelo] = useState<Modelo | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modeloToDelete, setModeloToDelete] = useState<string | null>(null);

  const filteredModelos = modelos.filter((modelo) => {
    const matchesSearch =
      modelo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      modelo.ref.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria =
      categoriaFilter === "todas" || modelo.categoriaId === categoriaFilter;
    return matchesSearch && matchesCategoria;
  });

  const handleEdit = (modelo: Modelo) => {
    setEditingModelo(modelo);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setModeloToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (modeloToDelete) {
      eliminarModelo(modeloToDelete);
      setDeleteDialogOpen(false);
      setModeloToDelete(null);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingModelo(null);
  };

  const getCategoriaColor = (categoriaId: string) => {
    const categoria = categorias.find((c) => c.id === categoriaId);
    return categoria?.color || "hsl(var(--muted))";
  };

  const getCategoriaName = (categoriaId: string) => {
    const categoria = categorias.find((c) => c.id === categoriaId);
    return categoria?.nombre || "Sin categoría";
  };

  const calcularMargen = (modelo: Modelo) => {
    const margen = modelo.precioSugerido - modelo.costoBase;
    const porcentaje = (margen / modelo.costoBase) * 100;
    return { margen, porcentaje };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Package className="w-8 h-8 text-primary" />
            Catálogo de Productos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu catálogo de relojes y productos
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="lg" className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nombre o REF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Productos ({filteredModelos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Imagen</TableHead>
                  <TableHead>REF</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Costo Base</TableHead>
                  <TableHead className="text-right">Precio Sugerido</TableHead>
                  <TableHead className="text-right">Margen</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModelos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredModelos.map((modelo) => {
                    const { margen, porcentaje } = calcularMargen(modelo);
                    return (
                      <TableRow key={modelo.id}>
                        <TableCell>
                          <div className="w-16 h-16 rounded-md border border-border overflow-hidden bg-muted flex items-center justify-center">
                            {modelo.imagen ? (
                              <img
                                src={modelo.imagen}
                                alt={modelo.nombre}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-medium">
                          {modelo.ref}
                        </TableCell>
                        <TableCell className="font-medium">
                          {modelo.nombre}
                        </TableCell>
                        <TableCell>
                          <Badge
                            style={{
                              backgroundColor: getCategoriaColor(modelo.categoriaId),
                              color: "hsl(var(--accent-foreground))",
                            }}
                          >
                            {getCategoriaName(modelo.categoriaId)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCOP(modelo.costoBase)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {formatCOP(modelo.precioSugerido)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-mono font-medium text-success">
                              {formatCOP(margen)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {porcentaje.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(modelo)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(modelo.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ModeloDialog
        open={dialogOpen}
        onOpenChange={handleCloseDialog}
        modelo={editingModelo}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado
              permanentemente del catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
