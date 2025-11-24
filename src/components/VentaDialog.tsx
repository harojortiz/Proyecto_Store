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
  const { ventas, clientes, categorias, agregarVenta, actualizarVenta } = useVentasStore();
  const [neto, setNeto] = useState(0);
  const [cuota1, setCuota1] = useState(0);
  const [cuota2, setCuota2] = useState(0);

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

  useEffect(() => {
    if (venta && open) {
      setValue("ref", venta.ref);
      setValue("modelo", venta.modelo);
      setValue("neto", venta.neto);
      setValue("cuota1", venta.cuota1);
      setValue("cuota2", venta.cuota2);
      setValue("clienteId", venta.clienteId);
      setValue("fecha", venta.fecha);
      setValue("notas", venta.notas || "");
      setValue("categoriaId", venta.categoriaId);
      setNeto(venta.neto);
      setCuota1(venta.cuota1);
      setCuota2(venta.cuota2);
    } else if (!venta && open) {
      reset({
        ref: "",
        modelo: "",
        neto: 0,
        cuota1: 0,
        cuota2: 0,
        clienteId: "",
        fecha: new Date().toISOString().split('T')[0],
        notas: "",
        categoriaId: "relojes",
      });
      setNeto(0);
      setCuota1(0);
      setCuota2(0);
    }
  }, [venta, open, setValue, reset]);

  const calculos = calcularVentaCompleta(neto, cuota1, cuota2);

  const onSubmit = (data: VentaFormData) => {
    const ventaData: Venta = {
      id: venta?.id || `${Date.now()}`,
      ref: data.ref,
      modelo: data.modelo,
      neto: data.neto,
      cuota1: data.cuota1,
      cuota2: data.cuota2,
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ref">REF</Label>
              <Input
                id="ref"
                {...register("ref")}
                placeholder="ROL-001"
              />
              {errors.ref && (
                <p className="text-sm text-destructive mt-1">{errors.ref.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                {...register("modelo")}
                placeholder="Rolex Submariner"
              />
              {errors.modelo && (
                <p className="text-sm text-destructive mt-1">{errors.modelo.message}</p>
              )}
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cuota1">Cuota 1 (COP)</Label>
              <Input
                id="cuota1"
                type="number"
                {...register("cuota1", { valueAsNumber: true })}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setCuota1(value);
                  setValue("cuota1", value);
                }}
                placeholder="10000000"
              />
              {errors.cuota1 && (
                <p className="text-sm text-destructive mt-1">{errors.cuota1.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cuota2">Cuota 2 (COP)</Label>
              <Input
                id="cuota2"
                type="number"
                {...register("cuota2", { valueAsNumber: true })}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setCuota2(value);
                  setValue("cuota2", value);
                }}
                placeholder="10000000"
              />
              {errors.cuota2 && (
                <p className="text-sm text-destructive mt-1">{errors.cuota2.message}</p>
              )}
            </div>
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
