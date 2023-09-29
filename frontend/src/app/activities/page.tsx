"use client";
import React from "react";
import { useUser } from "@/context/UserContext";
import LoadingScreen from "../loadingScreen";

export default function page() {
  const { token, user, selectedClass } = useUser();

  return user?.info ? <div>page</div> : <LoadingScreen />;
}
