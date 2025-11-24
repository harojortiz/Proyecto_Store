import axios from "axios";

const API_URL = "http://localhost:3000/sales";

export const obtenerSales = async () => {
    const { data } = await axios.get(API_URL);
    return data;
}
