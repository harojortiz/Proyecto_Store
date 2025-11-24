import axios from "axios";

const API_URL = "http://localhost:3000/customers";

export const clientesService = {
  obtenerClientes: async () => {
    const { data } = await axios.get(`${API_URL}/findAll`);
    return data;
  },

  crearCliente: async (cliente: any) => {
    const { data } = await axios.post(API_URL, cliente);
    return data;
  },

  actualizarCliente: async (id: string, cliente: any) => {
    const { data } = await axios.put(`${API_URL}/${id}`, cliente);
    return data;
  },

  eliminarCliente: async (id: string) => {
    const { data } = await axios.delete(`${API_URL}/${id}`);
    return data;
  },
};