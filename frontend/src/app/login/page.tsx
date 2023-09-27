"use client";
import Image from "next/image";
import LoginForm from "@/components/LoginForm";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Cookies from "js-cookie";

export default function page() {
  const router = useRouter();
  const { token } = useUser();

  useEffect(() => {
    if (token || Cookies.get("token")) {
      router.push("/"); // Redireciona para a página inicial se o token existir
    }
  }, [token]);

  return (
    <section className="h-screen flex flex-col md:flex-row justify-center space-y-10 md:space-y-0 md:space-x-16 items-center my-2 mx-5 md:mx-0 md:my-0">
      <div className="md:w-1/3 max-w-sm flex flex-col items-center gap-5">
        <img
          src="https://github-production-user-asset-6210df.s3.amazonaws.com/123379941/270513715-dc697e43-65a8-45e6-bada-c0d77b19a33f.svg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIWNJYAX4CSVEH53A%2F20230926%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20230926T015603Z&X-Amz-Expires=300&X-Amz-Signature=330e50406755a4b874425ebc859c182614d4367e763177beec04e70a8a41ee16&X-Amz-SignedHeaders=host&actor_id=123379941&key_id=0&repo_id=691825641"
          alt="Sample image"
        />
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
