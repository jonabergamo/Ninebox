"use client";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function useRefreshToken() {
  const { data: session } = useSession();

  const refreshToken = async () => {
    const res = await axios.post("/token/refresh", {
      refresh: session?.user.refresh,
    });

    if (session) session.user.access = res.data.access;
  };

  return refreshToken;
}
