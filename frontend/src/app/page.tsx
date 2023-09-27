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

export default function Home({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, user } = useUser();

  useEffect(() => {
    if (!token && !Cookies.get("token")) {
      router.push("/login"); // Redireciona para a página de login se o token não existir
    }
  }, [token]);

  return (
    <div>
      <AsideBar />
      <UserInfo />
      {children}
    </div>
  );
}
