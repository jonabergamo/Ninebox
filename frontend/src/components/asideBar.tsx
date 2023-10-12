"use client";
import React, { ReactNode } from "react";
import { useUser } from "@/context/UserContext";
import { PiStudentFill } from "react-icons/pi";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MdSpaceDashboard, MdSubject } from "react-icons/md";
import { FaBookOpen } from "react-icons/fa";
import Image from "next/image";
import { CgMenuGridR } from "react-icons/cg";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AsideBar() {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

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
        iconName: "nineboxes",
        iconImage: <CgMenuGridR />,
        to: "/nineboxes",
        title: "NineBoxes",
      },
      {
        iconName: "activities",
        iconImage: <FaBookOpen />,
        to: "/activities",
        title: "Atividades",
      },
      {
        iconName: "students",
        iconImage: <PiStudentFill />,
        to: "/students",
        title: "Estudantes",
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
        iconName: "nineboxes",
        iconImage: <CgMenuGridR />,
        to: "/nineboxes",
        title: "NineBoxes",
      },
      {
        iconName: "activities",
        iconImage: <FaBookOpen />,
        to: "/activities",
        title: "Atividades",
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
            <Link href={icon.to} key={index}>
              <div
                className={`text-3xl cursor-pointer p-2 rounded-full transition-all hover:scale-105 
                  ${
                    pathname === icon.to
                      ? "bg-secondary-color-light hover:bg-secondary-color-dark ring-2 ring-offset-2 ring-secondary-color-light  ring-offset-primary-color-light dark:ring-offset-primary-color-dark"
                      : "bg-secondary-color-light hover:bg-secondary-color-dark"
                  }`}
                title={icon.title}>
                {icon.iconImage || icon.iconName}
              </div>
            </Link>
          ))}
        </aside>
      </div>
    )
  );
}
