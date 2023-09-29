"use client";
import React from "react";
import UserInfo from "./userInfo";
import ClassSwitch from "./classSwitch";
import { useUser } from "@/context/UserContext";

export default function Header() {
  const { user } = useUser();

  return (
    user?.info && (
      <header className="flex justify-between items-start py-5 flex-wrap-reverse md:justify-around md:gap-10">
        <ClassSwitch />
        <UserInfo />
      </header>
    )
  );
}
