import axios from "axios";
import { SaleFromApi } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const obtenerSales = async (): Promise<SaleFromApi[]> => {
    const { data } = await axios.get(`${API_URL}/sales`);
    return data;
}
