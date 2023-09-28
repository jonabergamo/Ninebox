"use client";
import React, { ReactNode } from "react";
import { useUser } from "@/context/UserContext";
import { AiFillHome, AiFillAlipayCircle } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AsideBar() {
  const [role, setRole] = useState<string>("");
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

  useEffect(() => {
    if (user?.info) {
      setRole(
        user?.info.is_teacher
          ? "teacher"
          : user?.info.is_student
          ? "student"
          : "error"
      );
    }
  }, []);

  return (
    <div className="fixed h-screen w-full bg-white flex overflow-hidden">
      <aside className="h-full w-14 flex flex-col space-y-10 items-center justify-center relative text-white">
        {asideIconsMap[role]?.map((icon, index) => (
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
      <div className="w-full h-full flex flex-col justify-between"></div>
    </div>
  );
}
