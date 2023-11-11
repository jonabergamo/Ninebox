"use client";
import Image from "next/image";
import LoginForm from "@/components/LoginForm";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Cookies from "js-cookie";
import Logo27Box from "@/assets/27box_logo.svg";
import Logo27BoxDark from "@/assets/27box_logo_dark.svg";
import useDarkMode from "@/lib/hooks/useDarkMode"; // Import do novo hook
import { useSession } from "next-auth/react";

function LoginPage() {
  const router = useRouter();
  const { user } = useUser();
  const { data: session } = useSession();
  const prefersDarkMode = useDarkMode(); // Usando o hook

  useEffect(() => {
    if (session?.user) {
      router.push("/");
    }
  }, [user]);

  return !user?.info ? (
    <section className="h-3/4 flex flex-col md:flex-row justify-center space-y-10 md:space-y-0 md:space-x-16 items-center my-2 mx-5 md:mx-0 md:my-0">
      <div className="md:w-1/3 max-w-sm flex flex-col items-center gap-5">
        <Image src={prefersDarkMode ? Logo27BoxDark : Logo27Box} alt="Logo" />
        <Image
          src="https://www.inova.unicamp.br/wp-content/uploads/2021/05/SENAI-SP.jpg"
          alt="Sample image"
          width={250}
          height={250}
        />
      </div>
      <LoginForm />
    </section>
  ) : null;
}

export default LoginPage;
