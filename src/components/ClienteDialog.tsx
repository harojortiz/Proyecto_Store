import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useVentasStore } from "@/store/useVentasStore";
import { clienteSchema, ClienteFormData } from "@/lib/validations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ClienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId?: string | null;
}

export default function ClienteDialog({ open, onOpenChange, clienteId }: ClienteDialogProps) {
  const { clientes, agregarCliente, actualizarCliente } = useVentasStore();
  const cliente = clienteId ? clientes.find((c) => c.customer_id === clienteId) : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
  });

  useEffect(() => {
    if (cliente && open) {
      reset({
        nombre: cliente.name,
        telefono: cliente.phone || "",
        documento: cliente.documento || "",
        email: cliente.email || "",
        direccion: cliente.direccion || "",
      });
    } else if (!cliente && open) {
      reset({
        nombre: "",
        telefono: "",
        documento: "",
        email: "",
        direccion: "",
      });
    }
  }, [cliente, open, reset]);

  const onSubmit = (data: ClienteFormData) => {
    const clienteData = {
      name: data.nombre,
      phone: data.telefono || undefined,
      documento: data.documento || undefined,
      email: data.email || undefined,
      direccion: data.direccion || undefined,
    };
    
    if (cliente) {
      actualizarCliente(cliente.customer_id, clienteData);
      toast.success("Cliente actualizado correctamente");
    } else {
      agregarCliente(clienteData);
      toast.success("Cliente creado correctamente");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {cliente ? "Editar Cliente" : "Nuevo Cliente"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              {...register("nombre")}
              placeholder="Juan Pérez"
            />
            {errors.nombre && (
              <p className="text-sm text-destructive mt-1">{errors.nombre.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              {...register("telefono")}
              placeholder="3001234567"
            />
            {errors.telefono && (
              <p className="text-sm text-destructive mt-1">{errors.telefono.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="documento">Documento</Label>
            <Input
              id="documento"
              {...register("documento")}
              placeholder="1020304050"
            />
            {errors.documento && (
              <p className="text-sm text-destructive mt-1">{errors.documento.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="juan@email.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              {...register("direccion")}
              placeholder="Calle 123 #45-67"
            />
            {errors.direccion && (
              <p className="text-sm text-destructive mt-1">{errors.direccion.message}</p>
            )}
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
              {cliente ? "Actualizar" : "Crear"} Cliente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
