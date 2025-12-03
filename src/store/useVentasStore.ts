import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Venta, Cliente, Categoria, Modelo } from '@/types';
import { clientesService } from '@/services/clientesService';
import { productsService } from '@/services/productsService';
import { crearSale, actualizarSale, eliminarSale, obtenerSales } from '@/services/salesService';

// Categorías disponibles
const categoriasIniciales: Categoria[] = [
  { id: 'relojes', nombre: 'Relojes', descripcion: 'Relojes de lujo y accesorios', color: 'hsl(var(--primary))' },
  { id: 'joyas', nombre: 'Joyas', descripcion: 'Anillos, collares, pulseras', color: 'hsl(var(--accent))' },
  { id: 'otros', nombre: 'Otros', descripcion: 'Otros productos', color: 'hsl(var(--secondary))' },
];

const modelosIniciales: Modelo[] = [];
const clientesIniciales: Cliente[] = [];
const ventasIniciales: Venta[] = [];

interface VentasState {
  ventas: Venta[];
  clientes: Cliente[];
  categorias: Categoria[];
  modelos: Modelo[];
  agregarVenta: (venta: Omit<Venta, 'id'>) => Promise<void>;
  actualizarVenta: (id: string, venta: Partial<Venta>) => Promise<void>;
  eliminarVenta: (id: string) => Promise<void>;
  obtenerVentas: () => Promise<void>;
  agregarCliente: (cliente: Omit<Cliente, 'id'>) => Promise<void>;
  actualizarCliente: (id: string, cliente: Partial<Cliente>) => void;
  eliminarCliente: (id: string) => void;
  obtenerCliente: (id: string) => Cliente | undefined;
  agregarModelo: (modelo: Omit<Modelo, 'id'>) => Promise<void>;
  actualizarModelo: (id: string, modelo: Partial<Modelo>) => Promise<void>;
  eliminarModelo: (id: string) => Promise<void>;
  obtenerClientes: () => Promise<void>;
  obtenerModelos: () => Promise<void>;
  obtenerModelo: (id: string) => Modelo | undefined;
}

export const useVentasStore = create<VentasState>()(
  persist(
    (set, get) => ({
      ventas: ventasIniciales,
      clientes: clientesIniciales,
      categorias: categoriasIniciales,
      modelos: modelosIniciales,

      agregarVenta: async (venta) => {
        try {
          const nuevaVenta = await crearSale({
            modeloId: venta.modeloId,
            ref: venta.ref,
            modelo: venta.modelo,
            neto: venta.neto,
            iva19: venta.iva19,
            total: venta.total,
            cuota1: venta.cuota1,
            cuota2: venta.cuota2,
            deuda: venta.deuda,
            venta: venta.venta,
            ganancias: venta.ganancias,
            clienteId: venta.clienteId,
            fecha: venta.fecha,
            estado: venta.estado,
            notas: venta.notas,
            costoBase: venta.costoBase,
            categoriaId: venta.categoriaId,
          });
          console.log('Venta creada:', nuevaVenta);
          set((state) => ({
            ventas: [...state.ventas, nuevaVenta],
          }));
        } catch (error) {
          console.error('Error al crear venta:', error);
          throw error;
        }
      },

      actualizarVenta: async (id, ventaActualizada) => {
        try {
          const ventaActualizadaResponse = await actualizarSale(id, ventaActualizada);
          set((state) => ({
            ventas: state.ventas.map((v) =>
              v.id === id ? ventaActualizadaResponse : v
            ),
          }));
        } catch (error) {
          console.error('Error al actualizar venta:', error);
          throw error;
        }
      },

      eliminarVenta: async (id) => {
        try {
          await eliminarSale(id);
          set((state) => ({
            ventas: state.ventas.filter((v) => v.id !== id),
          }));
        } catch (error) {
          console.error('Error al eliminar venta:', error);
          throw error;
        }
      },

      obtenerVentas: async () => {
        try {
          const ventas = await obtenerSales();
          console.log('Ventas obtenidas:', ventas);
          set({ ventas });
        } catch (error) {
          console.error('Error al obtener ventas:', error);
        }
      },

      agregarCliente: async (cliente) => {
        try {
          const nuevoCliente = await clientesService.crearCliente(cliente);
          console.log('Cliente creado:', nuevoCliente);

          set((state) => ({
            clientes: [
              ...state.clientes,
              nuevoCliente,
            ],
          }));
        } catch (error) {
          console.error('Error al crear cliente:', error);
        }
      },

      actualizarCliente: (id, clienteActualizado) =>
        set((state) => ({
          clientes: state.clientes.map((c) =>
            c.customer_id === id ? { ...c, ...clienteActualizado } : c
          ),
        })),

      eliminarCliente: (id) =>
        set((state) => ({
          clientes: state.clientes.filter((c) => c.customer_id !== id),
        })),

      obtenerCliente: (id) => get().clientes.find((c) => c.customer_id === id),

      agregarModelo: async (modelo) => {
        try {
          const nuevoProducto = await productsService.create({
            ref: modelo.ref,
            nombre: modelo.nombre,
            costoBase: modelo.costoBase,
            precioSugerido: modelo.precioSugerido,
            imagen: modelo.imagen,
            categoriaId: modelo.categoriaId,
          });
          console.log('Producto creado:', nuevoProducto);
          set((state) => ({
            modelos: [...state.modelos, nuevoProducto],
          }));
        } catch (error) {
          console.error('Error al crear producto:', error);
          throw error;
        }
      },

      actualizarModelo: async (id, modeloActualizado) => {
        try {
          const productoActualizado = await productsService.update(id, {
            ref: modeloActualizado.ref,
            nombre: modeloActualizado.nombre,
            costoBase: modeloActualizado.costoBase,
            precioSugerido: modeloActualizado.precioSugerido,
            imagen: modeloActualizado.imagen,
            categoriaId: modeloActualizado.categoriaId,
          });
          set((state) => ({
            modelos: state.modelos.map((m) =>
              m.id === id ? productoActualizado : m
            ),
          }));
        } catch (error) {
          console.error('Error al actualizar producto:', error);
          throw error;
        }
      },

      eliminarModelo: async (id) => {
        try {
          await productsService.delete(id);
          set((state) => ({
            modelos: state.modelos.filter((m) => m.id !== id),
          }));
        } catch (error) {
          console.error('Error al eliminar producto:', error);
          throw error;
        }
      },

      obtenerModelo: (id) => get().modelos.find((m) => m.id === id),

      obtenerModelos: async () => {
        try {
          const productos = await productsService.getAll();
          console.log('Productos obtenidos:', productos);
          set({ modelos: productos });
        } catch (error) {
          console.error('Error al obtener productos:', error);
        }
      },

      obtenerClientes: async () => {
        try {
          const resp = await clientesService.obtenerClientes()
          console.log('Clientes obtenidos:', resp);
          set({ clientes: resp });
        } catch (error) {
          console.error('Error al obtener clientes:', error);
        }
      },
    }),

    {
      name: 'ventas-storage',
    }
  )
);