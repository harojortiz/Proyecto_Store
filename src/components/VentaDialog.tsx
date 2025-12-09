import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useVentasStore } from "@/store/useVentasStore";
import { ventaSchema, VentaFormData } from "@/lib/validations";
import { calcularVentaCompleta, calcularVentaDesdeTotal } from "@/lib/calculators";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Venta } from "@/types";

export default function VentaDialog({ open, onOpenChange, ventaId }: VentaDialogProps) {
  const { ventas, clientes, categorias, modelos, agregarVenta, actualizarVenta, obtenerModelo } = useVentasStore();
  const [totalInput, setTotalInput] = useState(0);

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
      setTotalInput(venta.total);
    } else if (!venta && open) {
      reset({
        modeloId: "",
        neto: 0,
        clienteId: "",
        fecha: new Date().toISOString().split('T')[0],
        notas: "",
        categoriaId: "relojes",
      });
      setTotalInput(0);
    }
  }, [venta, open, setValue, reset]);

  const calculos = calcularVentaDesdeTotal(totalInput, 0, 0);

  // Actualizar neto en el formulario cuando cambia el total
  useEffect(() => {
    setValue("neto", calculos.neto);
  }, [totalInput, setValue, calculos.neto]);

  const onSubmit = (data: VentaFormData) => {
    const ventaData: Venta = {
      id: venta?.id || `${Date.now()}`,
      modeloId: data.modeloId,
      neto: calculos.neto, // Usar neto calculado
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
                {Array.isArray(modelos) && modelos.map((modelo) => (
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
              <Label htmlFor="totalInput">TOTAL VENTA (COP)</Label>
              <Input
                id="totalInput"
                type="number"
                value={totalInput || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setTotalInput(value);
                }}
                placeholder="Ej: 100000"
                className="font-bold text-lg"
              />
            </div>

            <div>
              <Label>IVA 19% (Incluido)</Label>
              <Input
                value={calculos.iva19.toLocaleString('es-CO')}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Neto (Calculado)</Label>
              <Input
                value={calculos.neto.toLocaleString('es-CO')}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label>Deuda Inicial</Label>
              <Input
                value={calculos.deuda.toLocaleString('es-CO')}
                disabled
                className="bg-muted text-warning font-semibold"
              />
            </div>
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
                  {Array.isArray(clientes) && clientes.map((cliente) => (
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
