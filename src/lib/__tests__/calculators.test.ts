import { describe, it, expect } from 'vitest';
import {
    calcularVentaCompleta,
    calcularVentaDesdeTotal,
    calcularDeuda,
    calcularGanancias,
    calcularEstado,
} from '../calculators';

describe('calculators', () => {
    describe('calcularVentaCompleta', () => {
        it('should calculate sale with IVA correctly', () => {
            const neto = 100000;
            const result = calcularVentaCompleta(neto, 0, 0);

            expect(result.iva19).toBe(19000);
            expect(result.total).toBe(119000);
            expect(result.deuda).toBe(119000);
            expect(result.venta).toBe(119000);
        });

        it('should calculate with cuotas correctly', () => {
            const result = calcularVentaCompleta(100000, 50000, 30000);

            expect(result.deuda).toBe(39000); // 119000 - 50000 - 30000
            expect(result.estado).toBe('Pendiente');
        });

        it('should mark as paid when cuotas cover total', () => {
            const result = calcularVentaCompleta(100000, 60000, 59000);

            expect(result.deuda).toBe(0);
            expect(result.estado).toBe('Pagado');
        });

        it('should calculate ganancias when costoBase is provided', () => {
            const result = calcularVentaCompleta(100000, 0, 0, undefined, 50000);

            // Ganancia = venta - costoBase - neto
            // 119000 - 50000 - 100000 = -31000 (pérdida)
            expect(result.ganancias).toBe(-31000);
        });

        it('should use custom venta value when provided', () => {
            const result = calcularVentaCompleta(100000, 0, 0, 150000);

            expect(result.venta).toBe(150000);
            expect(result.total).toBe(119000); // Total no cambia
        });
    });

    describe('calcularVentaDesdeTotal', () => {
        it('should calculate neto from total correctly', () => {
            const result = calcularVentaDesdeTotal(119000, 0, 0);

            expect(result.neto).toBe(100000); // 119000 / 1.19
            expect(result.iva19).toBe(19000);
            expect(result.total).toBe(119000);
        });

        it('should handle rounding correctly', () => {
            const result = calcularVentaDesdeTotal(100000, 0, 0);

            // 100000 / 1.19 = 84033.61... -> rounded to 84034
            expect(result.neto).toBe(84034);
            expect(result.iva19).toBe(15966); // 100000 - 84034
        });

        it('should calculate with cuotas', () => {
            const result = calcularVentaDesdeTotal(119000, 50000, 30000);

            expect(result.deuda).toBe(39000);
            expect(result.estado).toBe('Pendiente');
        });
    });

    describe('calcularDeuda', () => {
        it('should calculate debt correctly', () => {
            expect(calcularDeuda(100000, 30000, 20000)).toBe(50000);
        });

        it('should return 0 when cuotas exceed total', () => {
            expect(calcularDeuda(100000, 60000, 50000)).toBe(0);
        });

        it('should handle no cuotas', () => {
            expect(calcularDeuda(100000, 0, 0)).toBe(100000);
        });
    });

    describe('calcularGanancias', () => {
        it('should calculate profit correctly', () => {
            const ganancia = calcularGanancias(150000, 50000, 80000);

            // 150000 - 50000 - 80000 = 20000
            expect(ganancia).toBe(20000);
        });

        it('should return 0 when no costoBase', () => {
            const ganancia = calcularGanancias(150000, undefined, 80000);

            expect(ganancia).toBe(0);
        });

        it('should handle negative profit (loss)', () => {
            const ganancia = calcularGanancias(100000, 80000, 50000);

            // 100000 - 80000 - 50000 = -30000
            expect(ganancia).toBe(-30000);
        });
    });

    describe('calcularEstado', () => {
        it('should return "Pagado" when debt is 0', () => {
            expect(calcularEstado(0, 50000, 50000)).toBe('Pagado');
        });

        it('should return "Pendiente" when there is debt', () => {
            expect(calcularEstado(50000, 30000, 20000)).toBe('Pendiente');
        });

        it('should return "Sin Cuotas" when no payments made', () => {
            expect(calcularEstado(100000, 0, 0)).toBe('Sin Cuotas');
        });

        it('should handle edge case of very small debt', () => {
            expect(calcularEstado(0.01, 50000, 50000)).toBe('Pendiente');
        });
    });

    describe('edge cases', () => {
        it('should handle zero values', () => {
            const result = calcularVentaCompleta(0, 0, 0);

            expect(result.iva19).toBe(0);
            expect(result.total).toBe(0);
        });

        it('should handle very large numbers', () => {
            const result = calcularVentaCompleta(10000000, 0, 0);

            expect(result.iva19).toBe(1900000);
            expect(result.total).toBe(11900000);
        });

        it('should handle decimal values', () => {
            const result = calcularVentaCompleta(100000.50, 0, 0);

            expect(result.iva19).toBe(19000.095);
        });
    });
});
