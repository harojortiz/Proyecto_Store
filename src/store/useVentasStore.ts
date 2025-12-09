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

  // Sales Pagination state
  nextCursor: string | null;
  hasMore: boolean;
  isLoading: boolean;

  // Products Pagination state
  productsNextCursor: string | null;
  productsHasMore: boolean;
  productsIsLoading: boolean;

  // Customers Pagination state
  customersNextCursor: string | null;
  customersHasMore: boolean;
  customersIsLoading: boolean;

  agregarVenta: (venta: Omit<Venta, 'id'>) => Promise<void>;
  actualizarVenta: (id: string, venta: Partial<Venta>) => Promise<void>;
  eliminarVenta: (id: string) => Promise<void>;
  obtenerVentas: (reset?: boolean) => Promise<void>;
  cargarMasVentas: () => Promise<void>;

  agregarCliente: (cliente: Omit<Cliente, 'id'>) => Promise<void>;
  actualizarCliente: (id: string, cliente: Partial<Cliente>) => void;
  eliminarCliente: (id: string) => void;
  obtenerCliente: (id: string) => Cliente | undefined;

  agregarModelo: (modelo: Omit<Modelo, 'id'>) => Promise<void>;
  actualizarModelo: (id: string, modelo: Partial<Modelo>) => Promise<void>;
  eliminarModelo: (id: string) => Promise<void>;
  obtenerModelos: (reset?: boolean) => Promise<void>;
  cargarMasModelos: () => Promise<void>;
  obtenerModelo: (id: string) => Modelo | undefined;

  obtenerClientes: () => Promise<void>;
  cargarMasClientes: () => Promise<void>;
}

export const useVentasStore = create<VentasState>()(
  persist(
    (set, get) => ({
      ventas: ventasIniciales,
      clientes: clientesIniciales,
      categorias: categoriasIniciales,
      modelos: modelosIniciales,

      nextCursor: null,
      hasMore: true,
      isLoading: false,

      productsNextCursor: null,
      productsHasMore: true,
      productsIsLoading: false,

      customersNextCursor: null,
      customersHasMore: true,
      customersIsLoading: false,

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
            ventas: [nuevaVenta, ...state.ventas],
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

      obtenerVentas: async (reset = false) => {
        try {
          set({ isLoading: true });
          if (reset) {
            set({ ventas: [], nextCursor: null, hasMore: true });
          }

          const response = await obtenerSales({ limit: 20 });

          if ('pagination' in response) {
            set({
              ventas: response.data,
              nextCursor: response.pagination.nextCursor,
              hasMore: response.pagination.hasMore,
              isLoading: false
            });
          } else {
            set({ ventas: response, isLoading: false, hasMore: false });
          }
        } catch (error) {
          console.error('Error al obtener ventas:', error);
          set({ isLoading: false });
        }
      },

      cargarMasVentas: async () => {
        const { nextCursor, hasMore, isLoading } = get();
        if (!hasMore || isLoading || !nextCursor) return;

        try {
          set({ isLoading: true });
          const response = await obtenerSales({
            cursor: nextCursor,
            limit: 20
          });

          if ('pagination' in response) {
            set((state) => ({
              ventas: [...state.ventas, ...response.data],
              nextCursor: response.pagination.nextCursor,
              hasMore: response.pagination.hasMore,
              isLoading: false
            }));
          }
        } catch (error) {
          console.error('Error al cargar más ventas:', error);
          set({ isLoading: false });
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

      obtenerModelos: async (reset = false) => {
        try {
          set({ productsIsLoading: true });
          if (reset) {
            set({ modelos: [], productsNextCursor: null, productsHasMore: true });
          }

          const response = await productsService.getAll({ limit: 20 });

          if ('pagination' in response) {
            set({
              modelos: response.data,
              productsNextCursor: response.pagination.nextCursor,
              productsHasMore: response.pagination.hasMore,
              productsIsLoading: false
            });
          } else {
            set({ modelos: response, productsIsLoading: false, productsHasMore: false });
          }
        } catch (error) {
          console.error('Error al obtener productos:', error);
          set({ productsIsLoading: false });
        }
      },

      cargarMasModelos: async () => {
        const { productsNextCursor, productsHasMore, productsIsLoading } = get();
        if (!productsHasMore || productsIsLoading || !productsNextCursor) return;

        try {
          set({ productsIsLoading: true });
          const response = await productsService.getAll({
            cursor: productsNextCursor,
            limit: 20
          });

          if ('pagination' in response) {
            set((state) => ({
              modelos: [...state.modelos, ...response.data],
              productsNextCursor: response.pagination.nextCursor,
              productsHasMore: response.pagination.hasMore,
              productsIsLoading: false
            }));
          }
        } catch (error) {
          console.error('Error al cargar más productos:', error);
          set({ productsIsLoading: false });
        }
      },

      obtenerClientes: async () => {
        try {
          const resp = await clientesService.obtenerClientes();
          console.log('Clientes obtenidos:', resp);

          // Handle both paginated and non-paginated responses
          if (resp && typeof resp === 'object' && 'data' in resp && Array.isArray(resp.data)) {
            set({ clientes: resp.data });
          } else if (Array.isArray(resp)) {
            set({ clientes: resp });
          } else {
            console.error('Respuesta inesperada de obtenerClientes:', resp);
            set({ clientes: [] });
          }
        } catch (error) {
          console.error('Error al obtener clientes:', error);
          set({ clientes: [] });
        }
      },

      cargarMasClientes: async () => {
        const { customersNextCursor, customersHasMore, customersIsLoading } = get();
        if (!customersHasMore || customersIsLoading || !customersNextCursor) return;

        try {
          set({ customersIsLoading: true });
          const response = await clientesService.obtenerClientes({
            cursor: customersNextCursor,
            limit: 20
          });

          if (response && typeof response === 'object' && 'data' in response && 'pagination' in response) {
            set((state) => ({
              clientes: [...state.clientes, ...response.data],
              customersNextCursor: response.pagination.nextCursor,
              customersHasMore: response.pagination.hasMore,
              customersIsLoading: false
            }));
          }
        } catch (error) {
          console.error('Error al cargar más clientes:', error);
          set({ customersIsLoading: false });
        }
      },
    }),

    {
      name: 'ventas-storage',
      partialize: (state) => ({
        categorias: state.categorias,
      }),
    }
  )
);