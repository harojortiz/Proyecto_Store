export type EstadoVenta = 'PAGADA' | 'PARCIAL' | 'DEUDA';
export type Sale = Venta;

export type Categoria = {
  id: string;
  nombre: string;
  descripcion?: string;
  color: string;
};

export type Venta = {
  id: string;
  modeloId: string; // Referencia directa al ID del producto
  ref?: string; // Mantener para compatibilidad, pero opcional
  modelo?: string; // Mantener para compatibilidad, pero opcional
  neto: number;
  iva19: number;
  total: number;
  cuota1: number;
  cuota2: number;
  deuda: number;
  venta: number;
  ganancias: number;
  clienteId: string;
  fecha: string;
  estado: EstadoVenta;
  notas?: string;
  costoBase?: number;
  categoriaId: string;
};

export type Cliente = {
  customer_id?: string;
  name: string;
  phone?: string;
  documento?: string;
  email?: string;
  direccion?: string;
};

export type Modelo = {
  id: string;
  ref: string;
  nombre: string;
  costoBase: number;
  precioSugerido: number;
  categoriaId: string;
  imagen?: string;
};


export type SaleFromApi = {
  id: string;
  modeloId: string;
  ref: string | null;
  modelo: string | null;
  neto: number;
  iva19: number;
  total: number;
  cuota1: number;
  cuota2: number;
  deuda: number;
  venta: number;
  ganancias: number;
  clienteId: string;
  fecha: string;
  estado: string;
  notas: string | null;
  costoBase: number | null;
  categoriaId: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    customer_id: string;
    name: string;
    phone: string | null;
    documento: string | null;
    email: string | null;
    direccion: string | null;
  };
  product: {
    id: string;
    ref: string;
    nombre: string;
    costoBase: number;
    precioSugerido: number;
  };
  category: {
    id: string;
    nombre: string;
    descripcion: string | null;
    color: string;
  };
};
