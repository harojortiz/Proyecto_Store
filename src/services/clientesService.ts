import apiClient from "@/lib/api";
import { Cliente } from "@/types";

export const clientesService = {
  obtenerClientes: async (): Promise<Cliente[]> => {
    const { data } = await apiClient.get(`/customers/findAll`);
    return data;
  },

  crearCliente: async (cliente: Omit<Cliente, 'id'>): Promise<Cliente> => {
    const { data } = await apiClient.post(`/customers`, cliente);
    return data;
  },

  actualizarCliente: async (id: string, cliente: Partial<Cliente>): Promise<Cliente> => {
    const { data } = await apiClient.put(`/customers/${id}`, cliente);
    return data;
  },

  eliminarCliente: async (id: string): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },
};