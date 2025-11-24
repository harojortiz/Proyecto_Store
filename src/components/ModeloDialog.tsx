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
import { Upload, X } from "lucide-react";

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

  const onSubmit = (data: ModeloFormData) => {
    if (data.costoBase >= data.precioSugerido) {
      toast({
        title: "Error de validación",
        description: "El precio sugerido debe ser mayor al costo base",
        variant: "destructive",
      });
      return;
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "La imagen no debe superar 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      form.setValue("imagen", base64String);
      setPreviewImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    form.setValue("imagen", "");
    setPreviewImage("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{modelo ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          <DialogDescription>
            {modelo
              ? "Actualiza la información del producto"
              : "Agrega un nuevo producto al catálogo"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Imagen */}
            <div className="space-y-2">
              <FormLabel>Imagen del Producto</FormLabel>

              {previewImage ? (
                <div className="relative w-full h-48 rounded-lg border overflow-hidden bg-muted">
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
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition">
                  <Upload className="w-8 h-8 text-gray-500" />
                  <span className="text-sm text-gray-500">Subir imagen</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* REF */}
            <FormField
              control={form.control}
              name="ref"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referencia</FormLabel>
                  <FormControl>
                    <Input placeholder="REF123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* NOMBRE */}
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del producto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* COSTO */}
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

            {/* PRECIO */}
            <FormField
              control={form.control}
              name="precioSugerido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio Sugerido</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
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
                        <SelectValue placeholder="Selecciona una categoría" />
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

            <Button type="submit" className="w-full">
              {modelo ? "Actualizar" : "Agregar Producto"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
