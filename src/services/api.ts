import axios from "axios";

// Criando uma instância do Axios
export default axios.create({
  baseURL: "http://127.0.0.1:8000", // fallback para um valor default
  headers: { "Content-Type:": "application/json" },
});

export const axiosAuth = axios.create({
  baseURL: "http://127.0.0.1:8000", // fallback para um valor default
  headers: { "Content-Type:": "application/json" },
});
