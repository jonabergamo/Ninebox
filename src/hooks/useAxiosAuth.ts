"use client";
import { axiosAuth } from "@/services/api";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import useRefreshToken from "./useRefreshToken";

export default function useAxiosAuth() {
  const { data: session } = useSession();
  const refreshToken = useRefreshToken();

  useEffect(() => {
    const requestIntercept = axiosAuth.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          const token = session?.user.access;
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    const responseIntercept = axiosAuth.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error.config;
        if (error.response.status == 401 && prevRequest.sent) {
          prevRequest.sent = true;
          refreshToken();
          const token = session?.user.access;
          prevRequest.headers["Authorization"] = `Bearer ${token}`;
          return axiosAuth(prevRequest);
        }

        return Promise.reject(error);
      }
    );
    return () => {
      axiosAuth.interceptors.request.eject(requestIntercept);
      axiosAuth.interceptors.request.eject(responseIntercept);
    };
  }, [session]);

  return axiosAuth;
}
