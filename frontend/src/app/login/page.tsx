"use client";
import Image from "next/image";
import LoginForm from "@/components/LoginForm";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Cookies from "js-cookie";
import Logo27Box from "@/assets/27box_logo.svg";

export default function page() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (user?.info || Cookies.get("user")) {
      router.push("/"); // Redireciona para a página inicial se o token existir
    }
  }, [user]);

  return (
    <section className="h-3/4 flex flex-col md:flex-row justify-center space-y-10 md:space-y-0 md:space-x-16 items-center my-2 mx-5 md:mx-0 md:my-0">
      <div className="md:w-1/3 max-w-sm flex flex-col items-center gap-5 ">
        <Image src={Logo27Box} alt="Sample image" />
        <img
          src="https://www.inova.unicamp.br/wp-content/uploads/2021/05/SENAI-SP.jpg"
          alt="Sample image"
          className="w-72"
        />
      </div>
      <LoginForm />
    </section>
  );
}
