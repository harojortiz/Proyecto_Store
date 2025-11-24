export type EstadoVenta = 'PAGADA' | 'PARCIAL' | 'DEUDA';

export type Categoria = {
  id: string;
  nombre: string;
  descripcion?: string;
  color: string;
};

export type Venta = {
  id: string;
  ref: string;
  modelo: string;
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
