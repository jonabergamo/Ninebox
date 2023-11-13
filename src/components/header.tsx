"use client";
import React from "react";
import UserInfo from "./userInfo";
import ClassSwitch from "./classSwitch";
import { useUser } from "@/context/UserContext";
import { useSession } from "next-auth/react";

export default function Header() {
  const { user } = useUser();
  const { data: session } = useSession();

  return (
    session?.user && (
      <header className="flex justify-between mb-5 items-start flex-wrap-reverse md:justify-around md:gap-10">
        <ClassSwitch />
        <UserInfo />
      </header>
    )
  );
}
