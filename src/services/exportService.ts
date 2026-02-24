import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Venta } from '@/types';
import { formatCOP, formatDate } from '@/lib/formatters';

/**
 * Servicio de exportación de datos a PDF y Excel
 */

interface ExportVenta {
    ref: string;
    modelo: string;
    cliente: string;
    neto: number;
    iva19: number;
    total: number;
    cuota1: number;
    cuota2: number;
    deuda: number;
    fecha: string;
    estado: string;
}

/**
 * Preparar datos de ventas para exportación
 */
function prepareVentasData(ventas: Venta[], getClienteName: (id: string) => string): ExportVenta[] {
    return ventas.map(venta => ({
        ref: venta.ref || venta.product?.ref || '-',
        modelo: venta.modelo || venta.product?.nombre || '-',
        cliente: venta.customer?.name || getClienteName(venta.clienteId) || '-',
        neto: venta.neto,
        iva19: venta.iva19,
        total: venta.total,
        cuota1: venta.cuota1,
        cuota2: venta.cuota2,
        deuda: venta.deuda,
        fecha: formatDate(venta.fecha),
        estado: venta.estado,
    }));
}

/**
 * Exportar ventas a PDF
 */
export function exportVentasToPDF(
    ventas: Venta[],
    getClienteName: (id: string) => string,
    titulo: string = 'Reporte de Ventas'
): void {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
    });

    // Título
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text(titulo, 14, 20);

    // Subtítulo con fecha
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}`, 14, 28);

    // Resumen
    const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);
    const totalDeuda = ventas.reduce((sum, v) => sum + v.deuda, 0);
    const totalPagado = totalVentas - totalDeuda;

    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text(`Total Ventas: ${formatCOP(totalVentas)}  |  Pagado: ${formatCOP(totalPagado)}  |  Pendiente: ${formatCOP(totalDeuda)}`, 14, 36);

    // Preparar datos
    const data = prepareVentasData(ventas, getClienteName);

    // Tabla
    autoTable(doc, {
        startY: 42,
        head: [['REF', 'Modelo', 'Cliente', 'Neto', 'IVA', 'Total', 'Cuota 1', 'Cuota 2', 'Deuda', 'Fecha', 'Estado']],
        body: data.map(v => [
            v.ref,
            v.modelo,
            v.cliente,
            formatCOP(v.neto),
            formatCOP(v.iva19),
            formatCOP(v.total),
            formatCOP(v.cuota1),
            formatCOP(v.cuota2),
            formatCOP(v.deuda),
            v.fecha,
            v.estado,
        ]),
        styles: {
            fontSize: 8,
            cellPadding: 2,
        },
        headStyles: {
            fillColor: [45, 45, 45],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245],
        },
        columnStyles: {
            0: { cellWidth: 20 }, // REF
            1: { cellWidth: 35 }, // Modelo
            2: { cellWidth: 30 }, // Cliente
            3: { cellWidth: 22, halign: 'right' }, // Neto
            4: { cellWidth: 20, halign: 'right' }, // IVA
            5: { cellWidth: 22, halign: 'right' }, // Total
            6: { cellWidth: 20, halign: 'right' }, // Cuota 1
            7: { cellWidth: 20, halign: 'right' }, // Cuota 2
            8: { cellWidth: 22, halign: 'right' }, // Deuda
            9: { cellWidth: 22 }, // Fecha
            10: { cellWidth: 18 }, // Estado
        },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `V&H Store - Página ${i} de ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    // Descargar
    const fileName = `ventas_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
}

/**
 * Exportar ventas a Excel
 */
export function exportVentasToExcel(
    ventas: Venta[],
    getClienteName: (id: string) => string,
    nombreArchivo: string = 'ventas'
): void {
    // Preparar datos
    const data = prepareVentasData(ventas, getClienteName);

    // Crear hoja de cálculo
    const wsData = [
        // Header
        ['REF', 'Modelo', 'Cliente', 'Neto', 'IVA 19%', 'Total', 'Cuota 1', 'Cuota 2', 'Deuda', 'Fecha', 'Estado'],
        // Data
        ...data.map(v => [
            v.ref,
            v.modelo,
            v.cliente,
            v.neto,
            v.iva19,
            v.total,
            v.cuota1,
            v.cuota2,
            v.deuda,
            v.fecha,
            v.estado,
        ]),
        // Resumen
        [],
        ['', '', 'TOTALES:',
            ventas.reduce((s, v) => s + v.neto, 0),
            ventas.reduce((s, v) => s + v.iva19, 0),
            ventas.reduce((s, v) => s + v.total, 0),
            ventas.reduce((s, v) => s + v.cuota1, 0),
            ventas.reduce((s, v) => s + v.cuota2, 0),
            ventas.reduce((s, v) => s + v.deuda, 0),
            '', ''
        ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Ajustar anchos de columna
    ws['!cols'] = [
        { wch: 12 }, // REF
        { wch: 25 }, // Modelo
        { wch: 20 }, // Cliente
        { wch: 15 }, // Neto
        { wch: 12 }, // IVA
        { wch: 15 }, // Total
        { wch: 12 }, // Cuota 1
        { wch: 12 }, // Cuota 2
        { wch: 15 }, // Deuda
        { wch: 12 }, // Fecha
        { wch: 10 }, // Estado
    ];

    // Crear libro
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');

    // Descargar
    const fileName = `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

/**
 * Exportar productos a Excel
 */
export function exportProductosToExcel(productos: any[], nombreArchivo: string = 'productos'): void {
    const wsData = [
        ['REF', 'Nombre', 'Categoría', 'Costo Base', 'Precio Sugerido', 'Margen'],
        ...productos.map(p => [
            p.ref,
            p.nombre,
            p.categoriaId,
            p.costoBase,
            p.precioSugerido,
            p.precioSugerido - p.costoBase,
        ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [
        { wch: 15 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');

    const fileName = `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

/**
 * Exportar clientes a Excel
 */
export function exportClientesToExcel(clientes: any[], nombreArchivo: string = 'clientes'): void {
    const wsData = [
        ['Nombre', 'Teléfono', 'Documento', 'Email', 'Dirección'],
        ...clientes.map(c => [
            c.name,
            c.phone || '-',
            c.documento || '-',
            c.email || '-',
            c.direccion || '-',
        ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 25 },
        { wch: 30 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

    const fileName = `${nombreArchivo}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
}
