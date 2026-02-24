import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useVentasStore } from "@/store/useVentasStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Search, Package, Image as ImageIcon, Loader2, Watch, Gem, Sparkles, ChevronRight } from "lucide-react";
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
import { ProductFilterBar } from "@/components/ProductFilterBar";
import { TableSkeleton } from "@/components/skeletons";
import { Modelo } from "@/types";
import { cn } from "@/lib/utils";

export default function Productos() {
  const {
    modelos,
    categorias,
    eliminarModelo,
    obtenerModelos,
    cargarMasModelos,
    productsHasMore,
    productsIsLoading,
    setProductFilters,
    productsFilters
  } = useVentasStore();

  // Eliminar estados locales duplicados y lógica de filtrado cliente
  // const [searchTerm, setSearchTerm] = useState(""); <-- Ya no se usa local
  // const [categoriaFilter, setCategoriaFilter] = useState<string>("todas"); <-- Ya no se usa local

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModelo, setEditingModelo] = useState<Modelo | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modeloToDelete, setModeloToDelete] = useState<string | null>(null);

  // Observer for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLTableRowElement | null) => {
    if (productsIsLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && productsHasMore) {
        cargarMasModelos();
      }
    });

    if (node) observer.current.observe(node);
  }, [productsIsLoading, productsHasMore, cargarMasModelos]);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    obtenerModelos(true);

    // Manejo de parámetros de URL
    const action = searchParams.get('action');
    const categoryParam = searchParams.get('category');

    if (action === 'new') {
      handleNuevoProducto();
    }

    if (categoryParam) {
      // Intentamos encontrar la categoría por nombre para filtrar por ID
      // Si no, lo ponemos en el campo de búsqueda general
      const categoryMatch = categorias.find(c => c.nombre.toLowerCase() === categoryParam.toLowerCase());
      if (categoryMatch) {
        setProductFilters({ categoriaId: categoryMatch.id, search: '' });
      } else {
        setProductFilters({ search: categoryParam });
      }
    }

    // Limpiar parámetros después de procesarlos (opcional para mantener URL limpia)
    if (action || categoryParam) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('action');
      newParams.delete('category');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, categorias]); // Añadimos categorias como dependencia para asegurar el match

  // filteredModelos ya no es necesario, usamos 'modelos' directamente ya filtrados del server
  const filteredModelos = modelos;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductFilters({ search: e.target.value });
  };

  const handleCategoriaChange = (val: string) => {
    setProductFilters({ categoriaId: val === "todas" ? undefined : val });
  };

  const handleNuevoProducto = () => {
    setEditingModelo(null);
    setDialogOpen(true);
  };

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
    // No limpiar el modelo inmediatamente para permitir animación de cierre
    // setEditingModelo(null); 
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
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Estilo Luxe */}
      <div className="luxe-header">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
              <Package className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Inventario de Productos</h1>
              <p className="text-white/70 text-sm flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4 text-accent" />
                Exclusividad y Alta Relojería
              </p>
            </div>
          </div>
        </div>

        {/* Decoración Luxe */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
      </div>

      {/* Filtros Luxe */}
      <Card className="luxe-card border-none">
        <CardContent className="p-0 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nombre, referencia o marca..."
                value={productsFilters.search || ''}
                onChange={handleSearchChange}
                className="pl-10 h-12 rounded-xl border-border/50 focus:ring-accent/20 transition-all"
              />
            </div>
            <div className="relative w-full md:w-[240px]">
              <select
                className={cn(
                  "flex h-12 w-full items-center justify-between rounded-xl border border-border/50 bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 appearance-none font-medium",
                  !productsFilters.categoriaId && "text-muted-foreground"
                )}
                value={productsFilters.categoriaId || "todas"}
                onChange={(e) => handleCategoriaChange(e.target.value)}
              >
                <option value="todas">Todas las Categorías</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-3.5 pointer-events-none opacity-50">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </div>
            </div>
          </div>

          <ProductFilterBar />
        </CardContent>
      </Card>

      {/* Tabla de Productos Luxe */}
      {productsIsLoading && modelos.length === 0 ? (
        <TableSkeleton rows={10} />
      ) : (
        <Card className="luxe-card border-none overflow-hidden p-0">
          <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/30">
            <h3 className="font-bold flex items-center gap-2 text-lg">
              <Watch className="w-5 h-5 text-accent" />
              Lista de Existencias
              <Badge variant="secondary" className="ml-2 bg-accent/10 text-accent border-none rounded-lg px-2 py-0.5">
                {modelos.length} Artículos
              </Badge>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 border-b border-border/50">
                  <TableHead className="w-[80px] font-bold text-xs uppercase tracking-wider">Imagen</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">REF</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Nombre</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Categoría</TableHead>
                  <TableHead className="text-center font-bold text-xs uppercase tracking-wider">Stock</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Costo</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Precio</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Margen</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase tracking-wider">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modelos.length === 0 && !productsIsLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Package className="w-12 h-12 opacity-50" />
                        <p>No se encontraron productos</p>
                        <Button variant="outline" onClick={() => setProductFilters({})} className="mt-2">
                          Limpiar filtros
                        </Button>
                        <Button variant="ghost" onClick={() => setDialogOpen(true)} className="mt-2 text-xs">
                          <Plus className="w-3 h-3 mr-2" />
                          Agregar nuevo
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  modelos.map((modelo, index) => {
                    const { margen, porcentaje } = calcularMargen(modelo);
                    const isLastElement = index === modelos.length - 1;
                    const isLowStock = (modelo.stock || 0) <= (modelo.stockMinimo || 5);
                    const noStock = (modelo.stock || 0) === 0;

                    return (
                      <TableRow
                        key={modelo.id}
                        ref={isLastElement ? lastElementRef : null}
                        className="group hover:bg-accent/5 transition-colors"
                      >
                        <TableCell>
                          <div className="w-14 h-14 rounded-xl border border-border/50 overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center group-hover:border-accent/30 transition-colors">
                            {modelo.imagen ? (
                              <img
                                src={modelo.imagen}
                                alt={modelo.nombre}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Watch className="w-5 h-5 text-muted-foreground/50" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                            {modelo.ref}
                          </code>
                        </TableCell>
                        <TableCell className="font-medium">
                          {modelo.nombre}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-accent/10 text-accent border-0">
                            {getCategoriaName(modelo.categoriaId)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span className={cn(
                              "font-bold px-2 py-0.5 rounded-md text-sm",
                              noStock
                                ? "bg-destructive/10 text-destructive"
                                : isLowStock
                                  ? "bg-amber-500/10 text-amber-600"
                                  : "bg-green-500/10 text-green-600"
                            )}>
                              {modelo.stock || 0}
                            </span>
                            {isLowStock && (
                              <span className="text-[10px] uppercase font-bold text-destructive/80 flex items-center gap-0.5">
                                Alerta
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {formatCOP(modelo.costoBase)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {formatCOP(modelo.precioSugerido)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-mono font-medium text-success">
                              +{formatCOP(margen)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {porcentaje.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(modelo)}
                              className="hover:bg-accent/10 hover:text-accent"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(modelo.id)}
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {productsIsLoading && (
              <div className="flex justify-center p-6">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin text-accent" />
                  <span className="text-sm">Cargando productos...</span>
                </div>
              </div>
            )}

            {!productsHasMore && filteredModelos.length > 0 && (
              <div className="text-center p-4 text-sm text-muted-foreground border-t border-border/50">
                ✨ Has visto todos los productos
              </div>
            )}
          </div>
        </Card>
      )}

      {
        dialogOpen && (
          <ModeloDialog
            open={dialogOpen}
            onOpenChange={handleCloseDialog}
            modelo={editingModelo}
          />
        )
      }

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
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
