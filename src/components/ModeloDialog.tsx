import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useVentasStore } from "@/store/useVentasStore";
import { Modelo } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, DollarSign, Tag, Package, Pencil, Sparkles, Watch, Gem, Loader2, Image as ImageIcon, ChevronRight } from "lucide-react";
import { formatCOP } from "@/lib/formatters";
import { validateImageFile } from "@/lib/imageOptimizer";
import { uploadService } from "@/services/uploadService";
import { cn } from "@/lib/utils";


const modeloSchema = z.object({
  ref: z.string().min(1, "La referencia es requerida").max(20, "Máximo 20 caracteres"),
  nombre: z.string().min(1, "El nombre es requerido").max(100, "Máximo 100 caracteres"),
  costoBase: z.coerce.number().min(0, "El costo debe ser mayor a 0"),
  precioSugerido: z.coerce.number().min(0, "El precio debe ser mayor a 0"),
  categoriaId: z.string().min(1, "Selecciona una categoría"),
  imagen: z.string().optional(),
  stock: z.coerce.number().int("Debe ser entero").min(0, "No puede ser negativo"),
  stockMinimo: z.coerce.number().int("Debe ser entero").min(0, "No puede ser negativo"),
});

type ModeloFormData = z.infer<typeof modeloSchema>;

interface ModeloDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelo?: Modelo | null;
}

export default function ModeloDialog({
  open,
  onOpenChange,
  modelo,
}: ModeloDialogProps) {
  const { agregarModelo, actualizarModelo, categorias } = useVentasStore();
  const { toast } = useToast();
  const [previewImage, setPreviewImage] = useState<string>("");
  const [costoCalculado, setCostoCalculado] = useState({ iva: 0, total: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const isEditing = !!modelo;

  const form = useForm<ModeloFormData>({
    resolver: zodResolver(modeloSchema),
    defaultValues: {
      ref: "",
      nombre: "",
      costoBase: 0,
      precioSugerido: 0,
      categoriaId: "relojes",
      imagen: "",
      stock: 0,
      stockMinimo: 5,
    },
  });

  const costoBase = form.watch("costoBase");

  useEffect(() => {
    if (modelo) {
      setIsSubmitting(false);
      form.reset({
        ref: modelo.ref,
        nombre: modelo.nombre,
        costoBase: modelo.costoBase,
        precioSugerido: modelo.precioSugerido,
        categoriaId: modelo.categoriaId,
        imagen: modelo.imagen || "",
        stock: modelo.stock || 0,
        stockMinimo: modelo.stockMinimo || 5,
      });
      setPreviewImage(modelo.imagen || "");
    } else {
      setIsSubmitting(false);
      form.reset({
        ref: "",
        nombre: "",
        costoBase: 0,
        precioSugerido: 0,
        categoriaId: "relojes",
        imagen: "",
        stock: 0,
        stockMinimo: 5,
      });
      setPreviewImage("");
    }
  }, [modelo, form]);

  useEffect(() => {
    const base = Number(costoBase) || 0;
    const iva = Math.round(base * 0.19);
    const total = base + iva;
    setCostoCalculado({ iva, total });
  }, [costoBase]);

  const onSubmit = async (data: ModeloFormData) => {
    setIsSubmitting(true);
    try {
      if (data.costoBase >= data.precioSugerido) {
        toast({
          title: "Advertencia de Margen",
          description: "El precio de venta es menor o igual al costo base.",
          variant: "destructive",
        });
      }

      const modeloData = {
        ref: data.ref,
        nombre: data.nombre,
        costoBase: data.costoBase,
        precioSugerido: data.precioSugerido,
        categoriaId: data.categoriaId,
        imagen: data.imagen,
        stock: data.stock,
        stockMinimo: data.stockMinimo,
      };

      // ESTRATEGIA "CLOSE-THEN-SAVE" (Igual que en Ventas):
      // 1. Cerrar UI para liberar el DOM.
      onOpenChange(false);
      form.reset();
      setPreviewImage("");

      // 2. Guardar datos tras el unmount seguro.
      setTimeout(async () => {
        try {
          if (modelo) {
            await actualizarModelo(modelo.id, modeloData);
            toast({
              title: "Producto actualizado",
              description: `${data.nombre} ha sido actualizado correctamente`,
            });
          } else {
            await agregarModelo(modeloData);
            toast({
              title: "Producto creado",
              description: `${data.nombre} ha sido agregado al catálogo`,
            });
          }
        } catch (error) {
          console.error("Error asíncrono guardando modelo:", error);
          toast({ title: "Error", description: "Fallo al guardar.", variant: "destructive" });
        }
      }, 300);

    } catch (error) {
      console.error("Error saving modelo:", error);
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "Error de validación",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Subir imagen al servidor
      const response = await uploadService.uploadImage(file);

      // Guardar URL de la imagen
      form.setValue("imagen", response.url);
      setPreviewImage(response.url);

      toast({
        title: "Imagen subida",
        description: "La imagen se ha guardado correctamente.",
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error al subir imagen",
        description: error.response?.data?.error || "No se pudo subir la imagen. Intente de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    form.setValue("imagen", "");
    setPreviewImage("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "sm:max-w-[800px] max-h-[90vh] overflow-hidden p-0",
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
              "bg-gradient-to-br from-[#d4a574] to-[#b8860b] group"
            )}>
              {isEditing ? (
                <Pencil className="w-8 h-8 text-white drop-shadow-md" />
              ) : (
                <Watch className="w-8 h-8 text-white drop-shadow-md" />
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 font-bold tracking-widest text-[10px] uppercase py-0.5 px-3">
                  Colección Exclusiva
                </Badge>
                {isEditing && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold text-[10px] uppercase py-0.5 px-3">
                    Modificación
                  </Badge>
                )}
              </div>
              <DialogHeader className="space-y-0 text-left p-0">
                <DialogTitle className="text-2xl font-black tracking-tight text-foreground">
                  {isEditing ? "Editar Producto" : "Nuevo Producto"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground/80 font-medium">
                  {isEditing
                    ? "Eleva y refina los detalles de este artículo"
                    : "Comienza el registro de una nueva pieza en tu catálogo"}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <div className="absolute top-6 right-8">
            <Sparkles className="w-6 h-6 opacity-30 text-accent animate-pulse" />
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-8 pb-8 pt-4 overflow-y-auto max-h-[calc(90vh-160px)] custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Columna Izquierda: Imagen */}
              <div className="md:col-span-1 space-y-4">
                <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5 text-accent" />
                  Archivo Visual
                </FormLabel>
                <div className={cn(
                  "relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all duration-300",
                  "bg-muted/10 border-muted-foreground/10 hover:border-accent/40 group overflow-hidden"
                )}>
                  {previewImage ? (
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white shadow-inner">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          onClick={removeImage}
                          variant="destructive"
                          size="icon"
                          className="h-10 w-10 rounded-full shadow-xl transform scale-75 group-hover:scale-100 transition-transform"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full aspect-square cursor-pointer">
                      <div className="bg-accent/5 p-5 rounded-full mb-4 border border-accent/20 group-hover:bg-accent/10 transition-colors">
                        <Upload className="w-10 h-10 text-accent" />
                      </div>
                      <span className="text-xs font-bold text-foreground tracking-wide uppercase">Cargar Imagen</span>
                      <span className="text-[10px] text-muted-foreground mt-2 font-medium opacity-60">PNG, JPG de alta calidad</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center backdrop-blur-sm">
                      <Loader2 className="w-8 h-8 animate-spin text-accent" />
                      <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Procesando</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Columna Derecha: Campos */}
              <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  {/* REF */}
                  <FormField
                    control={form.control}
                    name="ref"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-accent" />
                          Referencia
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="REF-001"
                            className="h-12 bg-white/5 border-white/10 focus:border-accent/50 focus:ring-accent/20 transition-all font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* CATEGORIA */}
                  <FormField
                    control={form.control}
                    name="categoriaId"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
                          <Gem className="w-3.5 h-3.5 text-accent" />
                          Categoría
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <select
                              className={cn(
                                "flex h-12 w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm transition-all focus:border-accent/50 focus:ring-accent/20 appearance-none font-medium",
                                !field.value && "text-muted-foreground"
                              )}
                              value={field.value}
                              onChange={field.onChange}
                            >
                              {categorias.map((cat) => (
                                <option key={cat.id} value={cat.id} className="bg-background text-foreground">
                                  {cat.nombre.toUpperCase()}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-3.5 pointer-events-none opacity-40">
                              <ChevronRight className="w-5 h-5 rotate-90" />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* NOMBRE */}
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
                        <Watch className="w-3.5 h-3.5 text-accent" />
                        Identidad de la Pieza
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="NOMBRE DEL ARTICULO"
                          className="h-12 bg-white/5 border-white/10 focus:border-accent/50 focus:ring-accent/20 font-bold placeholder:font-normal"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-6">
                  {/* Sección de Inventario */}
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-4 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 rounded-bl-full transform translate-x-4 -translate-y-4 transition-transform group-hover:scale-110" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2 text-accent">
                      <Package className="w-3 h-3" /> Logística
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {/* STOCK ACTUAL */}
                      <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-bold text-muted-foreground">ACTUAL</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" className="h-10 bg-background/50 border-white/10 font-bold" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* STOCK MÍNIMO */}
                      <FormField
                        control={form.control}
                        name="stockMinimo"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-bold text-muted-foreground">ALERTAR EN</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" className="h-10 bg-background/50 border-white/10 text-amber-500 font-black" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Sección de costos */}
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-4 shadow-sm relative group">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2 text-accent">
                      <DollarSign className="w-3 h-3" /> Valoración
                    </h3>

                    <div className="grid grid-cols-1 gap-3">
                      {/* COSTO BASE */}
                      <FormField
                        control={form.control}
                        name="costoBase"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-[10px] font-bold text-muted-foreground">COSTO BASE (ADQUISICIÓN)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">$</span>
                                <Input type="number" step="0.01" className="h-10 pl-7 bg-background/50 border-white/10 font-mono" {...field} />
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight text-muted-foreground/60 px-1">
                        <span>Gravamen (IVA 19%)</span>
                        <span className="font-mono">{formatCOP(costoCalculado.iva)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-white/10">
                      <span className="text-[11px] font-black uppercase tracking-wider opacity-60">Total Neto:</span>
                      <span className="text-sm font-black text-accent drop-shadow-sm">{formatCOP(costoCalculado.total)}</span>
                    </div>
                  </div>
                </div>

                {/* PRECIO VENTA */}
                <FormField
                  control={form.control}
                  name="precioSugerido"
                  render={({ field }) => (
                    <FormItem className="space-y-2 relative">
                      <div className="flex justify-between items-end mb-1">
                        <FormLabel className="text-[11px] font-black uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5" />
                          Precio Boutique
                        </FormLabel>
                        <span className="text-[10px] font-bold text-muted-foreground/40 italic">Valor percibido sugerido</span>
                      </div>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-amber-600/20 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
                          <div className="relative">
                            <span className="absolute left-4 top-3.5 text-xl font-black text-accent/50">$</span>
                            <Input
                              type="number"
                              step="0.01"
                              className="h-14 pl-10 bg-background/80 border-accent/20 text-2xl font-black text-accent focus:border-accent ring-offset-background"
                              {...field}
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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
                      {isEditing ? <Pencil className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    </span>
                    {isEditing ? "UNIFICAR CAMBIOS" : "INGRESAR AL CATÁLOGO"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog >
  );
}
