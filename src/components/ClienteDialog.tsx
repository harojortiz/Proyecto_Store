import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useVentasStore } from "@/store/useVentasStore";
import { clienteSchema, ClienteFormData } from "@/lib/validations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Phone, FileText, Mail, MapPin, UserPlus, Pencil, Sparkles, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface ClienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId?: string | null;
}

export default function ClienteDialog({ open, onOpenChange, clienteId }: ClienteDialogProps) {
  const { clientes, agregarCliente, actualizarCliente } = useVentasStore();
  const cliente = clienteId ? clientes.find((c) => c.customer_id === clienteId) : null;
  const isEditing = !!cliente;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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
      <DialogContent className={cn(
        "max-w-xl p-0 overflow-hidden",
        "bg-background/60 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl"
      )}>
        {/* Header de Lujo Crystal Luxe */}
        <div className={cn(
          "relative px-8 pt-10 pb-8 overflow-hidden transition-all duration-500",
          isEditing
            ? "from-amber-500/15 via-orange-500/5 to-transparent shadow-[inset_0_20px_40px_-20px_rgba(212,165,116,0.2)]"
            : "from-accent/15 via-amber-500/5 to-transparent"
        )}>
          {/* Decoración de Fondo Refinada */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/20 rounded-full blur-3xl opacity-50" />

          <div className="relative z-10 flex items-center gap-6">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl",
              "transition-all duration-500 transform hover:scale-105",
              "bg-gradient-to-br from-[#d4a574] to-[#b8860b] group"
            )}>
              {isEditing ? (
                <Pencil className="w-8 h-8 text-white drop-shadow-md" />
              ) : (
                <UserPlus className="w-8 h-8 text-white drop-shadow-md" />
              )}
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 font-bold tracking-widest text-[10px] uppercase py-0.5 px-3">
                  {isEditing ? "Gestión de Perfil" : "Exclusividad Luxe"}
                </Badge>
                <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse opacity-60" />
              </div>
              <DialogHeader className="text-left p-0">
                <DialogTitle className="text-3xl font-black tracking-tighter text-foreground">
                  {isEditing ? "Editar Perfil" : "Nuevo Cliente"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground/80 font-medium text-sm">
                  {isEditing
                    ? "Perfecciona los detalles del distinguido cliente"
                    : "Comienza la experiencia V&H registrando una nueva identidad"}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <div className="absolute top-6 right-8">
            <Sparkles className="w-6 h-6 opacity-30 text-accent animate-pulse" />
          </div>
        </div>

        {/* Separador Luxe */}
        <div className="px-8 flex items-center gap-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="text-[9px] font-black text-accent/40 uppercase tracking-[0.3em] whitespace-nowrap">Datos Maestros</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/10 to-transparent" />
        </div>

        {/* Formulario Estilizado - Crystal Luxe */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-10 pt-6">
          <div className="space-y-6">
            <div className="grid gap-6">
              {/* NOMBRE */}
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2 ml-1">
                  <User className="w-3.5 h-3.5 text-accent" />
                  Identidad Completa
                </Label>
                <div className="relative group">
                  <Input
                    id="nombre"
                    {...register("nombre")}
                    placeholder="NOMBRE DEL DISTINGUIDO CLIENTE"
                    className={cn(
                      "h-14 px-5 text-base rounded-2xl border-white/10 bg-white/5 transition-all duration-300",
                      "focus:bg-background/80 focus:ring-4 focus:ring-accent/10 focus:border-accent/50",
                      "placeholder:text-muted-foreground/30 font-bold placeholder:font-medium",
                      errors.nombre && "border-destructive/40 ring-destructive/10"
                    )}
                  />
                  {errors.nombre && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-destructive">
                      <Info className="w-5 h-5 opacity-70" />
                    </div>
                  )}
                </div>
                {errors.nombre && (
                  <p className="text-[10px] text-destructive font-black uppercase tracking-wider ml-4 opacity-80">
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              {/* Grid: Contacto y Documentación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2 ml-1">
                    <Phone className="w-3.5 h-3.5 text-accent" />
                    Línea Privada
                  </Label>
                  <Input
                    id="telefono"
                    {...register("telefono")}
                    placeholder="+57 300 000 000"
                    className="h-14 px-5 rounded-2xl border-white/10 bg-white/5 focus:bg-background/80 focus:ring-4 focus:ring-accent/10 focus:border-accent/50 transition-all duration-300 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documento" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2 ml-1">
                    <FileText className="w-3.5 h-3.5 text-accent" />
                    Documentación
                  </Label>
                  <Input
                    id="documento"
                    {...register("documento")}
                    placeholder="CC / NIT"
                    className="h-14 px-5 rounded-2xl border-white/10 bg-white/5 focus:bg-background/80 focus:ring-4 focus:ring-accent/10 focus:border-accent/50 transition-all duration-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2 ml-1">
                    <Mail className="w-3.5 h-3.5 text-accent" />
                    Correspondencia
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="cliente@luxe.com"
                    className="h-14 px-5 rounded-2xl border-white/10 bg-white/5 focus:bg-background/80 focus:ring-4 focus:ring-accent/10 focus:border-accent/50 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion" className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2 ml-1">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    Ubicación
                  </Label>
                  <Input
                    id="direccion"
                    {...register("direccion")}
                    placeholder="Zona Residencial/Comercial"
                    className="h-14 px-5 rounded-2xl border-white/10 bg-white/5 focus:bg-background/80 focus:ring-4 focus:ring-accent/10 focus:border-accent/50 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Separador Luxe Inferior */}
          <div className="my-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Footer de Acciones - Crystal Luxe */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="px-8 font-bold text-muted-foreground tracking-widest text-[11px] uppercase hover:bg-white/5"
            >
              DESCARTAR
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "min-w-[200px] h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-500",
                "shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:shadow-accent/20 hover:scale-[1.02] active:scale-[0.98]",
                isEditing
                  ? "bg-gradient-to-r from-[#d4a574] to-[#b8860b] text-white"
                  : "bg-black text-white hover:bg-neutral-900 border border-white/10 hover:border-accent/30"
              )}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>PROCESANDO</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-accent">
                    {isEditing ? <Pencil className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </span>
                  <span>{isEditing ? "UNIFICAR PERFIL" : "REGISTRAR IDENTIDAD"}</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
