"use client";

import axios from "axios";
import { signIn, signOut, useSession } from "next-auth/react";

export const useRefreshToken = () => {
  const { data: session } = useSession();

  const refreshToken = async () => {
    const res = await axios.post("/token/refresh", {
      refresh: session?.user.refreshToken,
    });

    if (session) session.user.accessToken = res.data.access;
    else signOut();
  };
  return refreshToken;
};
