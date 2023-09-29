"use client";
import React, { ReactNode } from "react";
import { useUser } from "@/context/UserContext";
import { AiFillHome, AiFillAlipayCircle } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MdSpaceDashboard, MdSubject } from "react-icons/md";
import { FaBookOpen } from "react-icons/fa";
import Ninebox_Icon from "@/assets/ninebox_icon.svg";
import Image from "next/image";

export default function AsideBar() {
  const { user } = useUser();
  const router = useRouter();

  interface IconProps {
    iconName: string | null;
    iconImage: React.ReactNode | null;
    to: string;
    title: string;
  }

  const asideIconsMap: Record<string, IconProps[]> = {
    teacher: [
      {
        iconName: "dashboard",
        iconImage: <MdSpaceDashboard />,
        to: "/",
        title: "Dashboard",
      },
      {
        iconName: "subjects",
        iconImage: <MdSubject />,
        to: "/subjects",
        title: "Disciplinas",
      },
      {
        iconName: "activities",
        iconImage: <FaBookOpen />,
        to: "/activities",
        title: "Atividades",
      },
      {
        iconName: "nineboxes",
        iconImage: <Image src={Ninebox_Icon} alt="" width={30} />,
        to: "/nineboxes",
        title: "NineBoxes",
      },
    ],
    student: [
      {
        iconName: "home",
        iconImage: <MdSpaceDashboard />,
        to: "/",
        title: "Dashboard",
      },
      {
        iconName: "subjects",
        iconImage: <MdSubject />,
        to: "/subjects",
        title: "Disciplinas",
      },
      {
        iconName: "activities",
        iconImage: <FaBookOpen />,
        to: "/activities",
        title: "Atividades",
      },
      {
        iconName: "nineboxes",
        iconImage: <Image src={Ninebox_Icon} alt="" width={30} />,
        to: "/nineboxes",
        title: "NineBoxes",
      },
    ],
  };

  return (
    user?.info && (
      <div className="h-screen flex overflow-hidden px-2">
        <aside className="h-full flex flex-col gap-5 items-center justify-center text-white">
          {asideIconsMap[
            user.info?.is_teacher
              ? "teacher"
              : user.info?.is_student
              ? "student"
              : ""
          ]?.map((icon, index) => (
            <div
              key={index}
              className="text-3xl cursor-pointer bg-blue-500 hover:bg-blue-900 p-2 rounded-full transition-all hover:scale-105"
              onClick={() => {
                router.push(icon.to);
              }}
              title={icon.title}>
              {icon.iconImage || icon.iconName}
            </div>
          ))}
        </aside>
      </div>
    )
  );
}
