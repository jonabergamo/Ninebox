"use client";
import React, { ReactNode } from "react";
import { useUser } from "@/context/UserContext";
import { AiFillHome, AiFillAlipayCircle } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AsideBar() {
  const { user } = useUser();
  const router = useRouter();

  interface IconProps {
    iconName: string | null;
    iconImage: React.ReactNode | null;
    to: string;
  }

  const asideIconsMap: Record<string, IconProps[]> = {
    teacher: [
      {
        iconName: "home",
        iconImage: <AiFillHome />,
        to: "/",
      },
    ],
    student: [
      {
        iconName: "home",
        iconImage: <AiFillHome />,
        to: "/",
      },
    ],
  };


  return user?.info&&(
    <div className="h-screen flex overflow-hidden px-2">
      <aside className="h-full flex flex-col gap-5 items-center justify-center text-white">
        {asideIconsMap[user.info?.is_teacher
              ? "teacher"
              : user.info?.is_student
              ? "student"
              : ""]?.map((icon, index) => (
          <div
            key={index}
            className="text-3xl cursor-pointer bg-blue-500 hover:bg-blue-900 p-2 rounded-full transition-all hover:scale-105"
            onClick={() => {
              router.push(icon.to);
            }}>
            {icon.iconImage || icon.iconName}
          </div>
        ))}
      </aside>
    </div>
  );
}
