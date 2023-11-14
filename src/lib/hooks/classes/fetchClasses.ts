"use client";
import { Class } from "@/types";
import axios, { Axios, AxiosInstance } from "axios";
import toast from "react-hot-toast";

export const fetchClasses = (
  token: string | undefined,
  user_email: string | undefined
): Promise<Class[]> => {
  console.log(token);
  return axios
    .get(`http://127.0.0.1:8000/classes?user_email=${user_email}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => {
      console.log(res);
      return res.data; // Supondo que res.data seja um array de objetos Class
    })
    .catch((error) => {
      console.error(error);
      toast("Ocorreu um erro");
    });
};
