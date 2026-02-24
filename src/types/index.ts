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
  modeloId: string;
  ref?: string | null;
  modelo?: string | null;
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
  estado: string; // Changed from EstadoVenta to string for API compatibility
  notas?: string | null;
  costoBase?: number | null;
  categoriaId: string;
  invoiceUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  // Relations from API
  customer?: {
    customer_id: string;
    name: string;
    phone: string | null;
    documento: string | null;
    email: string | null;
    direccion: string | null;
  };
  product?: {
    id: string;
    ref: string;
    nombre: string;
    costoBase: number;
    precioSugerido: number;
  };
  category?: {
    id: string;
    nombre: string;
    descripcion: string | null;
    color: string;
  };
};

// SaleFromApi is now the same as Venta to avoid type conflicts
export type SaleFromApi = Venta;

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
  stock: number;
  stockMinimo: number;
};

export interface Payment {
  id: string;
  saleId: string;
  monto: number;
  fecha: string;
  metodo: 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Otro';
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

// Pagination types
export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
  };
}
