import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useVentasStore } from "@/store/useVentasStore";
import { ventaSchema, VentaFormData } from "@/lib/validations";
import { calcularVentaCompleta } from "@/lib/calculators";
import { Venta } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface VentaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ventaId?: string | null;
}

export default function VentaDialog({ open, onOpenChange, ventaId }: VentaDialogProps) {
  const { ventas, clientes, categorias, modelos, agregarVenta, actualizarVenta, obtenerModelo } = useVentasStore();
  const [neto, setNeto] = useState(0);

  const venta = ventaId ? ventas.find((v) => v.id === ventaId) : null;

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

  const clienteId = watch("clienteId");
  const categoriaId = watch("categoriaId");
  const modeloIdSeleccionado = watch("modeloId");

  // Get modelo seleccionado
  const modeloSeleccionado = modeloIdSeleccionado ? obtenerModelo(modeloIdSeleccionado) : null;

  useEffect(() => {
    if (venta && open) {
      setValue("modeloId", venta.modeloId || "");
      setValue("neto", venta.neto);
      setValue("clienteId", venta.clienteId);
      setValue("fecha", venta.fecha);
      setValue("notas", venta.notas || "");
      setValue("categoriaId", venta.categoriaId);
      setNeto(venta.neto);
    } else if (!venta && open) {
      reset({
        modeloId: "",
        neto: 0,
        clienteId: "",
        fecha: new Date().toISOString().split('T')[0],
        notas: "",
        categoriaId: "relojes",
      });
      setNeto(0);
    }
  }, [venta, open, setValue, reset]);

  const calculos = calcularVentaCompleta(neto, 0, 0);

  const onSubmit = (data: VentaFormData) => {
    const ventaData: Venta = {
      id: venta?.id || `${Date.now()}`,
      modeloId: data.modeloId,
      neto: data.neto,
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

    if (venta) {
      actualizarVenta(venta.id, ventaData);
      toast.success("Venta actualizada correctamente");
    } else {
      const { id, ...ventaSinId } = ventaData;
      agregarVenta(ventaSinId);
      toast.success("Venta creada correctamente");
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {venta ? "Editar Venta" : "Nueva Venta"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="modeloId">Producto</Label>
            <Select
              value={modeloIdSeleccionado}
              onValueChange={(value) => setValue("modeloId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {modelos.map((modelo) => (
                  <SelectItem key={modelo.id} value={modelo.id}>
                    {modelo.nombre} - {modelo.ref}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.modeloId && (
              <p className="text-sm text-destructive mt-1">{errors.modeloId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="neto">NETO (COP)</Label>
              <Input
                id="neto"
                type="number"
                {...register("neto", { valueAsNumber: true })}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setNeto(value);
                  setValue("neto", value);
                }}
                placeholder="25000000"
              />
              {errors.neto && (
                <p className="text-sm text-destructive mt-1">{errors.neto.message}</p>
              )}
            </div>

            <div>
              <Label>IVA 19% (Auto)</Label>
              <Input
                value={calculos.iva19.toLocaleString('es-CO')}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div>
            <Label>Total (Auto)</Label>
            <Input
              value={calculos.total.toLocaleString('es-CO')}
              disabled
              className="bg-muted font-semibold"
            />
          </div>

          <div>
            <Label>Deuda (Auto)</Label>
            <Input
              value={calculos.deuda.toLocaleString('es-CO')}
              disabled
              className="bg-muted text-warning font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoriaId">Categoría</Label>
              <Select
                value={categoriaId}
                onValueChange={(value) => setValue("categoriaId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoriaId && (
                <p className="text-sm text-destructive mt-1">{errors.categoriaId.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="clienteId">Cliente</Label>
              <Select
                value={clienteId}
                onValueChange={(value) => setValue("clienteId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.customer_id} value={cliente.customer_id}>
                      {cliente.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clienteId && (
                <p className="text-sm text-destructive mt-1">{errors.clienteId.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              type="date"
              {...register("fecha")}
            />
            {errors.fecha && (
              <p className="text-sm text-destructive mt-1">{errors.fecha.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="notas">Notas (Opcional)</Label>
            <Textarea
              id="notas"
              {...register("notas")}
              placeholder="Información adicional sobre la venta..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {venta ? "Actualizar" : "Crear"} Venta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
