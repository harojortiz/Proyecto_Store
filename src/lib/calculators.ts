import { EstadoVenta } from "@/types";

export const calcularIva = (neto: number): number => {
  return Math.round(neto * 0.19);
};

export const calcularTotal = (neto: number, iva: number): number => {
  return neto + iva;
};

export const calcularDeuda = (total: number, cuota1: number, cuota2: number): number => {
  return Math.max(0, total - (cuota1 + cuota2));
};

export const calcularEstado = (deuda: number, cuota1: number, cuota2: number): EstadoVenta => {
  if (deuda === 0) return 'PAGADA';
  if (cuota1 + cuota2 > 0) return 'PARCIAL';
  return 'DEUDA';
};

export const calcularGanancias = (
  venta: number,
  costoBase: number | undefined,
  neto: number
): number => {
  return venta - (costoBase ?? neto);
};

export const calcularVentaCompleta = (
  neto: number,
  cuota1: number = 0,
  cuota2: number = 0,
  ventaCustom?: number,
  costoBase?: number
) => {
  const iva19 = calcularIva(neto);
  const total = calcularTotal(neto, iva19);
  const deuda = calcularDeuda(total, cuota1, cuota2);
  const venta = ventaCustom ?? total;
  const ganancias = calcularGanancias(venta, costoBase, neto);
  const estado = calcularEstado(deuda, cuota1, cuota2);

  return {
    iva19,
    total,
    deuda,
    venta,
    ganancias,
    estado,
  };
};

export const calcularVentaDesdeTotal = (
  total: number,
  cuota1: number = 0,
  cuota2: number = 0,
  ventaCustom?: number,
  costoBase?: number
) => {
  const neto = Math.round(total / 1.19);
  const iva19 = total - neto;
  const deuda = calcularDeuda(total, cuota1, cuota2);
  const venta = ventaCustom ?? total;
  const ganancias = calcularGanancias(venta, costoBase, neto);
  const estado = calcularEstado(deuda, cuota1, cuota2);

  return {
    neto,
    iva19,
    total,
    deuda,
    venta,
    ganancias,
    estado,
  };
};
