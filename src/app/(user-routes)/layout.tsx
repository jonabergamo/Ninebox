import { getServerSession } from "next-auth";
import { ReactNode } from "react";
import { nextAuthOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { UserProvider } from "@/context/UserContext";
import { ModalProvider } from "@/context/ModalContext";
import Modal from "@/components/modals/modals";
import { Toaster } from "react-hot-toast";
import AsideBar from "@/components/asideBar";
import Header from "@/components/header";

interface PrivateLayoutProps {
  children: ReactNode;
}

export default async function PrivateLayout({ children }: PrivateLayoutProps) {
  const session = await getServerSession(nextAuthOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="h-screen w-screen flex text-dark-color-1 overflow-hidden">
      <Modal />
      <Toaster />
      <aside className="flex-none">
        <AsideBar />
      </aside>
      <div className="flex flex-col flex-grow">
        <header className="flex-none px-5">
          <Header />
        </header>
        <main className="flex-grow px-10 py-4">{children}</main>
      </div>
    </div>
  );
}
