import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Venta, Cliente, Categoria, Modelo } from '@/types';
import { clientesService } from '@/services/clientesService';

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
  agregarVenta: (venta: Omit<Venta, 'id'>) => void;
  actualizarVenta: (id: string, venta: Partial<Venta>) => void;
  eliminarVenta: (id: string) => void;
  agregarCliente: (cliente: Omit<Cliente, 'id'>) => Promise<void>;
  actualizarCliente: (id: string, cliente: Partial<Cliente>) => void;
  eliminarCliente: (id: string) => void;
  obtenerCliente: (id: string) => Cliente | undefined;
  agregarModelo: (modelo: Omit<Modelo, 'id'>) => void;
  actualizarModelo: (id: string, modelo: Partial<Modelo>) => void;
  eliminarModelo: (id: string) => void;
  obtenerClientes: () => Promise<void>;
  obtenerModelo: (id: string) => Modelo | undefined;
}

export const useVentasStore = create<VentasState>()(
  persist(
    (set, get) => ({
      ventas: ventasIniciales,
      clientes: clientesIniciales,
      categorias: categoriasIniciales,
      modelos: modelosIniciales,

      agregarVenta: (venta) =>
        set((state) => ({
          ventas: [
            ...state.ventas,
            { ...venta, id: `${Date.now()}` },
          ],
        })),

      actualizarVenta: (id, ventaActualizada) =>
        set((state) => ({
          ventas: state.ventas.map((v) =>
            v.id === id ? { ...v, ...ventaActualizada } : v
          ),
        })),

      eliminarVenta: (id) =>
        set((state) => ({
          ventas: state.ventas.filter((v) => v.id !== id),
        })),

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

      agregarModelo: (modelo) =>
        set((state) => ({
          modelos: [
            ...state.modelos,
            { ...modelo, id: `${Date.now()}` },
          ],
        })),

      actualizarModelo: (id, modeloActualizado) =>
        set((state) => ({
          modelos: state.modelos.map((m) =>
            m.id === id ? { ...m, ...modeloActualizado } : m
          ),
        })),

      eliminarModelo: (id) =>
        set((state) => ({
          modelos: state.modelos.filter((m) => m.id !== id),
        })),

      obtenerModelo: (id) => get().modelos.find((m) => m.id === id),
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