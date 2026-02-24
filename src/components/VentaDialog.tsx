import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useVentasStore } from "@/store/useVentasStore";
import { ventaSchema, VentaFormData } from "@/lib/validations";
import { calcularVentaDesdeTotal } from "@/lib/calculators";
import { formatCOP } from "@/lib/formatters";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import { toast } from "sonner";
import { Venta } from "@/types";
import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  Pencil,
  Sparkles,
  Package,
  DollarSign,
  Receipt,
  User,
  Calendar,
  FileText,
  Gem,
  ChevronRight,
  Loader2
} from "lucide-react";

interface VentaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ventaId?: string | null;
}

export default function VentaDialog({ open, onOpenChange, ventaId }: VentaDialogProps) {
  const { ventas, clientes, categorias, modelos, agregarVenta, actualizarVenta } = useVentasStore();
  const [totalInput, setTotalInput] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const venta = ventaId ? ventas.find((v) => v.id === ventaId) : null;
  const isEditing = !!venta;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,

  } = useForm<VentaFormData>({
    resolver: zodResolver(ventaSchema),
  });

  const clienteId = watch("clienteId") || "";
  const categoriaId = watch("categoriaId") || "relojes";

  useEffect(() => {
    if (open) {
      setIsSubmitting(false);
      if (venta) {
        // Modo Edición: Cargar datos con reset (atómico)
        reset({
          modeloId: venta.modeloId || "",
          neto: venta.neto,
          clienteId: venta.clienteId,
          fecha: venta.fecha,
          notas: venta.notas || "",
          categoriaId: venta.categoriaId,
          venta: venta.venta,
          costoBase: venta.costoBase,
          // Mantener valores calculados iniciales
        });
        setTotalInput(venta.total);
      } else {
        // Modo Creación: Resetear a valores por defecto
        reset({
          modeloId: "",
          neto: 0,
          clienteId: "",
          fecha: new Date().toISOString().split('T')[0],
          notas: "",
          categoriaId: "relojes",
          venta: 0,
          costoBase: 0,
        });
        setTotalInput(0);
      }
    }
  }, [open, ventaId, reset]); // Dependencias estables: open y ventaId (no el objeto venta completo)

  // Efecto separado para cálculos dinámicos al cambiar el Total
  const calculos = calcularVentaDesdeTotal(totalInput, 0, 0);

  useEffect(() => {
    if (open) {
      setValue("neto", calculos.neto);
      setValue("venta", calculos.venta);
    }
  }, [totalInput, open, setValue, calculos.neto, calculos.venta]);

  const onSubmit = async (data: VentaFormData) => {
    setIsSubmitting(true);
    try {
      const ventaData: Venta = {
        id: venta?.id || `${Date.now()}`,
        modeloId: data.modeloId,
        neto: calculos.neto,
        cuota1: 0,
        cuota2: 0,
        clienteId: data.clienteId,
        fecha: data.fecha,
        notas: data.notas,
        venta: data.venta || calculos.venta,
        costoBase: data.costoBase,
        categoriaId: data.categoriaId,
        ...calculos,
      };

      // ESTRATEGIA "CLOSE-THEN-SAVE":
      // Cerra la ventana INMEDIATAMENTE para destruir el Portal y liberar el DOM.
      onOpenChange(false);

      // Esperar a que el DOM se estabilice (el componente se desmonta).
      // Esto evita que React intente actualizar la lista mientras el Portal muere (causa del insertBefore).
      setTimeout(async () => {
        try {
          if (venta) {
            await actualizarVenta(venta.id, ventaData);
            toast.success("Venta actualizada correctamente");
          } else {
            const { id, ...ventaSinId } = ventaData;
            await agregarVenta(ventaSinId);
            toast.success("Venta creada correctamente");
          }
        } catch (error) {
          console.error("Error asíncrono guardando venta:", error);
          // Opcional: Reabrir el diálogo o mostrar alerta global si falla
          toast.error("Error guardando la venta. Revise conexión.");
        }
      }, 300); // 300ms es seguro para que el unmount termine
    } catch (error) {
      console.error("Error al preparar venta:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-w-2xl max-h-[90vh] overflow-hidden p-0",
        "bg-background/60 backdrop-blur-xl border-white/20 shadow-2xl"
      )}>
        {/* Header con gradiente Luxe */}
        <div className={cn(
          "relative px-8 pt-8 pb-6",
          "bg-gradient-to-br transition-all duration-500",
          isEditing
            ? "from-amber-500/15 via-orange-500/5 to-transparent"
            : "from-accent/15 via-amber-500/5 to-transparent"
        )}>
          <div className="flex items-center gap-5">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl",
              "transition-all duration-500 transform hover:scale-105",
              "bg-gradient-to-br from-[#d4a574] to-[#b8860b]"
            )}>
              {isEditing ? (
                <Pencil className="w-8 h-8 text-white drop-shadow-md" />
              ) : (
                <ShoppingCart className="w-8 h-8 text-white drop-shadow-md" />
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 font-bold tracking-widest text-[10px] uppercase py-0.5 px-3">
                  Sistema de Ventas Luxe
                </Badge>
                {isEditing && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold text-[10px] uppercase py-0.5 px-3">
                    Ajuste Transaccional
                  </Badge>
                )}
              </div>
              <DialogHeader className="space-y-0 text-left p-0">
                <DialogTitle className="text-2xl font-black tracking-tight text-foreground">
                  {isEditing ? "Editar Registro" : "Nueva Transacción"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground/80 font-medium">
                  {isEditing
                    ? "Modifica los valores de la transacción actual"
                    : "Formaliza una nueva adquisición para tu distinguida clientela"}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <div className="absolute top-6 right-8">
            <Sparkles className="w-6 h-6 opacity-30 text-accent animate-pulse" />
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 pt-4 overflow-y-auto max-h-[calc(90vh-160px)] custom-scrollbar">
          <div className="space-y-6">
            {/* Producto y Categoría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-accent" />
                  Pieza de Relojería/Joya <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <select
                    className={cn(
                      "flex h-12 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm transition-all focus:border-accent/50 focus:ring-accent/20 appearance-none font-medium",
                      !watch("modeloId") && "text-muted-foreground"
                    )}
                    value={watch("modeloId") || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setValue("modeloId", val);
                      const modelo = modelos.find((m) => m.id === val);
                      if (modelo) {
                        setValue("costoBase", modelo.costoBase);
                      }
                    }}
                  >
                    <option value="" disabled>SELECCIONAR PIEZA...</option>
                    {modelos && modelos.length > 0 ? (
                      modelos
                        .filter(m => !watch("categoriaId") || m.categoriaId === watch("categoriaId"))
                        .map((modelo) => (
                          <option key={modelo.id} value={modelo.id} className="bg-background text-foreground">
                            {modelo.nombre.toUpperCase()} - {modelo.ref}
                          </option>
                        ))
                    ) : (
                      <option value="" disabled>SIN EXISTENCIAS</option>
                    )}
                  </select>
                  <div className="absolute right-4 top-3.5 pointer-events-none opacity-40">
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </div>
                </div>
                {errors.modeloId && (
                  <p className="text-[10px] font-bold text-destructive uppercase tracking-wider">{errors.modeloId.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
                  <Gem className="w-3.5 h-3.5 text-accent" />
                  Categoría
                </Label>
                <div className="relative">
                  <select
                    className={cn(
                      "flex h-12 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm transition-all focus:border-accent/50 focus:ring-accent/20 appearance-none font-medium text-muted-foreground/80 cursor-not-allowed"
                    )}
                    value={watch("categoriaId") || "relojes"}
                    disabled
                  >
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Datos del Producto Seleccionado - Refined UI */}
            {watch("modeloId") && (() => {
              const selectedModel = modelos.find(m => m.id === watch("modeloId"));
              if (!selectedModel) return null;

              const costo = watch("costoBase") || 0;
              const utilidad = totalInput - costo;
              const margen = costo > 0 ? ((utilidad / costo) * 100) : 0;

              return (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full transform translate-x-8 -translate-y-8 transition-transform group-hover:scale-110" />

                  <div className="flex justify-between items-center relative z-10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2 text-accent">
                      <Sparkles className="w-3 h-3" /> Análisis de Rentabilidad
                    </h3>
                    <div className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                      Costo Ref: <span className="font-mono">{formatCOP(selectedModel.costoBase)}</span>
                    </div>
                  </div>

                  {/* Barra de Rentabilidad Luxe */}
                  <div className="space-y-2 relative z-10">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter opacity-50">
                      <span>Inversión</span>
                      <span>Potencial de Ganancia</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--accent),0.3)]",
                          margen >= 30 ? "bg-gradient-to-r from-green-500 to-emerald-600" :
                            margen > 0 ? "bg-gradient-to-r from-amber-400 to-orange-500" :
                              "bg-gradient-to-r from-red-500 to-rose-700"
                        )}
                        style={{ width: `${Math.min(Math.max(margen, 0), 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1 relative z-10">
                    <div className="bg-black/20 rounded-xl p-3 border border-white/5 text-center transition-transform hover:scale-[1.02]">
                      <span className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Utilidad Neta</span>
                      <span className={cn("text-lg font-black font-mono tracking-tight", utilidad >= 0 ? "text-green-500" : "text-red-500")}>
                        {formatCOP(utilidad)}
                      </span>
                    </div>
                    <div className="bg-black/20 rounded-xl p-3 border border-white/5 text-center transition-transform hover:scale-[1.02]">
                      <span className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Retorno (ROI)</span>
                      <span className={cn("text-lg font-black font-mono tracking-tight", margen >= 30 ? "text-green-500" : margen > 0 ? "text-amber-500" : "text-red-500")}>
                        {margen.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Bloque Financiero Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-accent/5 rounded-2xl border border-accent/10 shadow-inner">
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5" />
                  Valor Final de Venta
                </Label>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-accent/20 rounded-xl blur opacity-10 group-hover:opacity-30 transition" />
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-xl font-black text-accent/50">$</span>
                    <Input
                      type="number"
                      value={totalInput || ''}
                      onChange={(e) => setTotalInput(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="h-14 pl-10 bg-background/80 border-accent/20 text-2xl font-black text-foreground focus:border-accent font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center px-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">Impuesto (IVA 19%)</Label>
                  <span className="font-mono text-sm font-bold text-muted-foreground">{calculos.iva19.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">Base Imponible (Neto)</Label>
                  <span className="font-mono text-sm font-bold text-muted-foreground">{calculos.neto.toLocaleString('es-CO')}</span>
                </div>
                <div className="pt-2 border-t border-accent/10 flex justify-between items-center px-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-amber-600/70">Saldo Pendiente</Label>
                  <span className="font-mono text-lg font-black text-amber-600">{calculos.deuda.toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>

            {/* Cliente y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-accent" />
                  Cliente Distinguido
                </Label>
                <div className="relative">
                  <select
                    className={cn(
                      "flex h-12 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm transition-all focus:border-accent/50 focus:ring-accent/20 appearance-none font-medium",
                      !watch("clienteId") && "text-muted-foreground"
                    )}
                    value={watch("clienteId") || ""}
                    onChange={(e) => setValue("clienteId", e.target.value)}
                  >
                    <option value="" disabled>SELECCIONAR CLIENTE...</option>
                    {Array.isArray(clientes) && clientes.map((cliente) => (
                      <option key={cliente.customer_id} value={cliente.customer_id} className="bg-background text-foreground">
                        {cliente.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-3.5 pointer-events-none opacity-40">
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-accent" />
                  Cronología
                </Label>
                <Input
                  type="date"
                  {...register("fecha")}
                  className="h-12 bg-white/5 border-white/10 focus:border-accent/50 font-bold uppercase text-xs"
                />
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-accent" />
                Anotaciones de la Sesión
              </Label>
              <Textarea
                {...register("notas")}
                placeholder="Detalles específicos sobre la preferencia del cliente o condiciones de la venta..."
                rows={3}
                className="resize-none bg-white/5 border-white/10 focus:border-accent/50 min-h-[100px] text-sm"
              />
            </div>
          </div>

          {/* Separador Luxe */}
          <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Botones */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="px-8 font-bold text-muted-foreground tracking-widest text-[11px] uppercase"
            >
              DESCARTAR
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "px-8 h-12 gap-3 transition-all duration-500 min-w-[200px]",
                "rounded-xl shadow-2xl font-black tracking-widest text-[11px] uppercase",
                "bg-black hover:bg-neutral-900 text-white border border-white/10",
                "hover:shadow-accent/20 hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="text-accent">
                    {isEditing ? <Pencil className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                  </span>
                  {isEditing ? "UNIFICAR REGISTRO" : "CONFIRMAR ADQUISICIÓN"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
