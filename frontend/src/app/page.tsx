"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Cookies from "js-cookie";
import Image from "next/image";
import StudentScreen from "@/screens/studentScreen";
import TeacherScreen from "@/screens/teacherScreen";
import AsideBar from "@/components/asideBar";
import UserInfo from "@/components/userInfo";
import ClassSwitch from "@/components/classSwitch";
import LoadingScreen from "./loadingScreen";

export default function Home() {
  const router = useRouter();
  const { token, user, selectedClass } = useUser();

  useEffect(() => {
    if (!token && !Cookies.get("token")) {
      router.push("/login"); // Redireciona para a página de login se o token não existir
    }
  }, [token]);

  return user?.info ? (
    <div className="text-xl text-gray-700">
      <p>Classe Atual</p>
      <h1 className="text-5xl text-black">{selectedClass?.name}<span className="text-3xl ml-2 text-gray-700">#{selectedClass?.unique_id}</span></h1>
    </div>
  ) : <LoadingScreen />;
}
