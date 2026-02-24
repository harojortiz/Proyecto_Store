import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Venta, Cliente, Categoria, Modelo } from '@/types';
import { clientesService, CustomerFilterParams } from '@/services/clientesService';
import { productsService, ProductFilterParams } from '@/services/productsService';
import { crearSale, actualizarSale, eliminarSale, obtenerSales, SaleFilterParams } from '@/services/salesService';

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
  actualizarCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>;
  eliminarCliente: (id: string) => Promise<void>;
  obtenerCliente: (id: string) => Cliente | undefined;

  agregarModelo: (modelo: Omit<Modelo, 'id'>) => Promise<void>;
  actualizarModelo: (id: string, modelo: Partial<Modelo>) => Promise<void>;
  eliminarModelo: (id: string) => Promise<void>;
  obtenerModelos: (reset?: boolean) => Promise<void>;
  cargarMasModelos: () => Promise<void>;
  obtenerModelo: (id: string) => Modelo | undefined;

  obtenerClientes: (reset?: boolean) => Promise<void>;
  cargarMasClientes: () => Promise<void>;




  // Filters State (Sales)
  salesFilters: SaleFilterParams;
  setSalesFilters: (filters: Partial<SaleFilterParams>) => void;

  // Filters State (Customers)
  customerFilters: CustomerFilterParams;
  setCustomerFilters: (filters: Partial<CustomerFilterParams>) => void;

  // Filters State (Products)
  productsFilters: ProductFilterParams;
  setProductFilters: (filters: Partial<ProductFilterParams>) => void;
}

export const useVentasStore = create<VentasState>()(
  persist(
    (set, get) => ({
      ventas: ventasIniciales,
      clientes: clientesIniciales,
      categorias: categoriasIniciales,
      modelos: modelosIniciales,

      salesFilters: {},
      customerFilters: {},

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
            ref: venta.ref || undefined,
            modelo: venta.modelo || undefined,
            neto: venta.neto,
            iva19: venta.iva19,
            total: venta.total,
            cuota1: venta.cuota1,
            cuota2: venta.cuota2,
            deuda: venta.deuda,
            venta: venta.venta,
            ganancias: venta.ganancias,
            clienteId: venta.clienteId,
            fecha: new Date(venta.fecha),
            estado: venta.estado,
            notas: venta.notas || undefined,
            costoBase: venta.costoBase || undefined,
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
          // Convertir fecha de string a Date si existe
          const dataToUpdate = {
            ...ventaActualizada,
            fecha: ventaActualizada.fecha ? new Date(ventaActualizada.fecha) : undefined
          };

          // Mapeamos Venta a CreateSaleData (que usa Date en lugar de string)
          // Usamos 'any' temporalmente para evitar el error de tipo estricto entre Partial<Venta> y Partial<CreateSaleData>
          // ya que hemos convertido la fecha manualmente
          const ventaActualizadaResponse = await actualizarSale(id, dataToUpdate as any);
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

      setSalesFilters: (filters) => {
        set((state) => ({
          salesFilters: { ...state.salesFilters, ...filters },
          // Reset pagination
          ventas: [],
          nextCursor: null,
          hasMore: true
        }));
        get().obtenerVentas(true);
      },

      obtenerVentas: async (reset = false) => {
        try {
          const { salesFilters } = get();
          set({ isLoading: true });
          if (reset) {
            set({ ventas: [], nextCursor: null, hasMore: true });
          }

          const response = await obtenerSales({
            limit: 20,
            ...salesFilters
          });

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
        const { nextCursor, hasMore, isLoading, salesFilters } = get();
        if (!hasMore || isLoading || !nextCursor) return;

        try {
          set({ isLoading: true });
          const response = await obtenerSales({
            cursor: nextCursor,
            limit: 20,
            ...salesFilters
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

      actualizarCliente: async (id, clienteActualizado) => {
        try {
          const clienteActualizadoResponse = await clientesService.actualizarCliente(id, clienteActualizado);
          set((state) => ({
            clientes: state.clientes.map((c) =>
              c.customer_id === id ? clienteActualizadoResponse : c
            ),
          }));
        } catch (error) {
          console.error('Error al actualizar cliente:', error);
          throw error;
        }
      },

      eliminarCliente: async (id) => {
        try {
          await clientesService.eliminarCliente(id);
          set((state) => ({
            clientes: state.clientes.filter((c) => c.customer_id !== id),
          }));
        } catch (error) {
          console.error('Error al eliminar cliente:', error);
          throw error;
        }
      },

      setCustomerFilters: (filters) => {
        set((state) => ({
          customerFilters: { ...state.customerFilters, ...filters },
          // Reset pagination
          clientes: [],
          customersNextCursor: null,
          customersHasMore: true
        }));
        get().obtenerClientes(true);
      },

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
            stock: modelo.stock,
            stockMinimo: modelo.stockMinimo,
          });
          console.log('Producto creado:', nuevoProducto);
          set((state) => ({
            modelos: [...state.modelos, nuevoProducto as unknown as Modelo],
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
            stock: modeloActualizado.stock,
            stockMinimo: modeloActualizado.stockMinimo,
          });
          set((state) => ({
            modelos: state.modelos.map((m) =>
              m.id === id ? (productoActualizado as unknown as Modelo) : m
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

      productsFilters: {},

      setProductFilters: (filters) => {
        set((state) => ({
          productsFilters: { ...state.productsFilters, ...filters },
          // Reset pagination when filters change
          modelos: [],
          productsNextCursor: null,
          productsHasMore: true
        }));
        // Trigger fetch directly after setting filters? Or let component do it?
        // Better let component trigger obtenerModelos(true)
        get().obtenerModelos(true);
      },

      obtenerModelos: async (reset = false) => {
        try {
          const { productsFilters } = get();
          set({ productsIsLoading: true });
          if (reset) {
            set({ modelos: [], productsNextCursor: null, productsHasMore: true });
          }

          const response = await productsService.getAll({
            limit: 20,
            ...productsFilters // Spread active filters
          });

          if ('pagination' in response) {
            set({
              modelos: response.data as unknown as Modelo[],
              productsNextCursor: response.pagination.nextCursor,
              productsHasMore: response.pagination.hasMore,
              productsIsLoading: false
            });
          } else {
            set({ modelos: response as unknown as Modelo[], productsIsLoading: false, productsHasMore: false });
          }
        } catch (error) {
          console.error('Error al obtener productos:', error);
          set({ productsIsLoading: false });
        }
      },

      cargarMasModelos: async () => {
        const { productsNextCursor, productsHasMore, productsIsLoading, productsFilters } = get();
        if (!productsHasMore || productsIsLoading || !productsNextCursor) return;

        try {
          set({ productsIsLoading: true });
          const response = await productsService.getAll({
            cursor: productsNextCursor,
            limit: 20,
            ...productsFilters
          });

          if ('pagination' in response) {
            set((state) => ({
              modelos: [...state.modelos, ...response.data as unknown as Modelo[]],
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

      obtenerClientes: async (reset = false) => {
        try {
          const { customerFilters } = get();
          set({ customersIsLoading: true });
          if (reset) {
            set({ clientes: [], customersNextCursor: null, customersHasMore: true });
          }

          const resp = await clientesService.obtenerClientes({
            limit: 20,
            ...customerFilters
          });
          console.log('Clientes obtenidos:', resp);

          // Handle both paginated and non-paginated responses
          if (resp && typeof resp === 'object' && 'data' in resp && 'pagination' in resp) {
            set({
              clientes: resp.data,
              customersNextCursor: resp.pagination.nextCursor,
              customersHasMore: resp.pagination.hasMore,
              customersIsLoading: false
            });
          } else if (resp && typeof resp === 'object' && 'data' in resp && Array.isArray(resp.data)) {
            set({ clientes: resp.data, customersIsLoading: false });
          } else if (Array.isArray(resp)) {
            set({ clientes: resp, customersIsLoading: false });
          } else {
            console.error('Respuesta inesperada de obtenerClientes:', resp);
            set({ clientes: [], customersIsLoading: false });
          }
        } catch (error) {
          console.error('Error al obtener clientes:', error);
          set({ clientes: [], customersIsLoading: false });
        }
      },

      cargarMasClientes: async () => {
        const { customersNextCursor, customersHasMore, customersIsLoading, customerFilters } = get();
        if (!customersHasMore || customersIsLoading || !customersNextCursor) return;

        try {
          set({ customersIsLoading: true });
          const response = await clientesService.obtenerClientes({
            cursor: customersNextCursor,
            limit: 20,
            ...customerFilters
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