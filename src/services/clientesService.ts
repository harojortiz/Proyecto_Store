import axios from "axios";
import { Cliente } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const clientesService = {
  obtenerClientes: async (): Promise<Cliente[]> => {
    const { data } = await axios.get(`${API_URL}/customers/findAll`);
    return data;
  },

  crearCliente: async (cliente: Omit<Cliente, 'id'>): Promise<Cliente> => {
    const { data } = await axios.post(`${API_URL}/customers`, cliente);
    return data;
  },

  actualizarCliente: async (id: string, cliente: Partial<Cliente>): Promise<Cliente> => {
    const { data } = await axios.put(`${API_URL}/customers/${id}`, cliente);
    return data;
  },

  eliminarCliente: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/customers/${id}`);
  },
};