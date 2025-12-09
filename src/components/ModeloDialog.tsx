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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVentasStore } from "@/store/useVentasStore";
import { Modelo } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, DollarSign, Tag, Package, Image as ImageIcon } from "lucide-react";
import { formatCOP } from "@/lib/formatters";
import { optimizeImage, validateImageFile } from "@/lib/imageOptimizer";


const modeloSchema = z.object({
  ref: z.string().min(1, "La referencia es requerida").max(20, "Máximo 20 caracteres"),
  nombre: z.string().min(1, "El nombre es requerido").max(100, "Máximo 100 caracteres"),
  costoBase: z.coerce.number().min(0, "El costo debe ser mayor a 0"),
  precioSugerido: z.coerce.number().min(0, "El precio debe ser mayor a 0"),
  categoriaId: z.string().min(1, "Selecciona una categoría"),
  imagen: z.string().optional(),
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

  const form = useForm<ModeloFormData>({
    resolver: zodResolver(modeloSchema),
    defaultValues: {
      ref: "",
      nombre: "",
      costoBase: 0,
      precioSugerido: 0,
      categoriaId: "relojes",
      imagen: "",
    },
  });

  const costoBase = form.watch("costoBase");

  useEffect(() => {
    if (modelo) {
      form.reset({
        ref: modelo.ref,
        nombre: modelo.nombre,
        costoBase: modelo.costoBase,
        precioSugerido: modelo.precioSugerido,
        categoriaId: modelo.categoriaId,
        imagen: modelo.imagen || "",
      });
      setPreviewImage(modelo.imagen || "");
    } else {
      form.reset({
        ref: "",
        nombre: "",
        costoBase: 0,
        precioSugerido: 0,
        categoriaId: "relojes",
        imagen: "",
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

  const onSubmit = (data: ModeloFormData) => {
    if (data.costoBase >= data.precioSugerido) {
      toast({
        title: "Advertencia de Margen",
        description: "El precio de venta es menor o igual al costo base.",
        variant: "destructive",
      });
      // No retornamos, permitimos guardar pero avisamos
    }

    const modeloData = {
      ref: data.ref,
      nombre: data.nombre,
      costoBase: data.costoBase,
      precioSugerido: data.precioSugerido,
      categoriaId: data.categoriaId,
      imagen: data.imagen,
    };

    if (modelo) {
      actualizarModelo(modelo.id, modeloData);
      toast({
        title: "Producto actualizado",
        description: `${data.nombre} ha sido actualizado correctamente`,
      });
    } else {
      agregarModelo(modeloData);
      toast({
        title: "Producto creado",
        description: `${data.nombre} ha sido agregado al catálogo`,
      });
    }

    form.reset();
    setPreviewImage("");
    onOpenChange(false);
  };



  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validar imagen
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "Error de validación",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    try {
      const processedImage = await optimizeImage(file);
      form.setValue("imagen", processedImage);
      setPreviewImage(processedImage);

      toast({
        title: "Imagen procesada",
        description: "La imagen se ha optimizado correctamente.",
      });
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar la imagen. Intente con otra.",
        variant: "destructive",
      });
    }
  };

  const removeImage = () => {
    form.setValue("imagen", "");
    setPreviewImage("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {modelo ? <Package className="w-6 h-6" /> : <Package className="w-6 h-6" />}
            {modelo ? "Editar Producto" : "Nuevo Producto"}
          </DialogTitle>
          <DialogDescription>
            Complete la información detallada del producto.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Columna Izquierda: Imagen */}
              <div className="md:col-span-1 space-y-4">
                <FormLabel className="text-base font-semibold">Imagen del Producto</FormLabel>
                <div className="border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors">
                  {previewImage ? (
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-white shadow-sm">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                      <Button
                        type="button"
                        onClick={removeImage}
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full aspect-square cursor-pointer">
                      <div className="bg-primary/10 p-4 rounded-full mb-3">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Subir imagen</span>
                      <span className="text-xs text-muted-foreground mt-1">PNG, JPG hasta 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Columna Derecha: Campos */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* REF */}
                  <FormField
                    control={form.control}
                    name="ref"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referencia</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Ej: REF-001" className="pl-9" {...field} />
                          </div>
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
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categorias.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                    <FormItem>
                      <FormLabel>Nombre del Producto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Reloj Casio Vintage" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4" /> Costos e Impuestos
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {/* COSTO BASE */}
                    <FormField
                      control={form.control}
                      name="costoBase"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Costo Base</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* IVA CALCULADO */}
                    <div className="space-y-2">
                      <FormLabel className="text-muted-foreground">IVA (19%)</FormLabel>
                      <div className="h-10 px-3 py-2 rounded-md border bg-muted text-sm flex items-center">
                        {formatCOP(costoCalculado.iva)}
                      </div>
                    </div>
                  </div>

                  {/* COSTO TOTAL */}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium">Costo Total (Base + IVA):</span>
                    <span className="text-lg font-bold text-primary">{formatCOP(costoCalculado.total)}</span>
                  </div>
                </div>

                {/* PRECIO VENTA */}
                <FormField
                  control={form.control}
                  name="precioSugerido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base text-green-600 dark:text-green-400 font-bold">Precio de Venta</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-green-600 dark:text-green-400" />
                          <Input
                            type="number"
                            step="0.01"
                            className="pl-9 text-lg font-bold border-green-200 focus-visible:ring-green-500"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="min-w-[150px]">
                {modelo ? "Actualizar Producto" : "Guardar Producto"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
