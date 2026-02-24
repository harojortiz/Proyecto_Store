import { z } from "zod";

// Schema para validación de ventas
export const ventaSchema = z.object({
  modeloId: z.string().min(1, "El producto es requerido"),
  neto: z.coerce.number().min(0, "El neto debe ser mayor a 0"),
  clienteId: z.string().min(1, "Selecciona un cliente"),
  fecha: z.string().min(1, "La fecha es requerida"),
  notas: z.string().optional(),
  categoriaId: z.string().min(1, "Selecciona una categoría"),
  venta: z.coerce.number().optional(),
  costoBase: z.coerce.number().optional(),
});

export type VentaFormData = z.infer<typeof ventaSchema>;

// Schema para validación de clientes
export const clienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  telefono: z.string().optional(),
  documento: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  direccion: z.string().optional(),
});

export type ClienteFormData = z.infer<typeof clienteSchema>;

// Schema para validación de modelos/productos
export const modeloSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  referencia: z.string().min(1, "La referencia es requerida"),
  costoBase: z.coerce.number().min(0, "El costo debe ser mayor o igual a 0"),
  precioVenta: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
  categoriaId: z.string().min(1, "Selecciona una categoría"),
  descripcion: z.string().optional(),
});

export type ModeloFormData = z.infer<typeof modeloSchema>;
