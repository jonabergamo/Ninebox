"use client";
import React from "react";
import AsideBar from "@/components/asideBar";
import UserInfo from "@/components/userInfo";
import ClassSwitch from "@/components/classSwitch";
import { useUser } from "@/context/UserContext";

export default function Overlay() {
  const { token, user } = useUser();
  return (
    token &&
    user?.info && (
      <>
        <AsideBar />
        <UserInfo />
        <ClassSwitch />
      </>
    )
  );
}
