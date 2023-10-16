import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { UserProvider } from "../context/UserContext";
import AsideBar from "@/components/asideBar";
import UserInfo from "@/components/userInfo";
import ClassSwitch from "@/components/classSwitch";
import Header from "@/components/header";
import { ModalProvider } from "@/context/ModalContext"; // Importando o ModalProvider
import Modal from "@/components/modals/modals";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "27Box",
  description: "Plataforma de gerenciamento de notas inovadora.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <ErrorBoundary>
        <UserProvider>
          <ModalProvider>
            <body
              className={`${inter.className} flex flex-row h-screen bg-primary-color-light dark:bg-primary-color-dark text-primary-color-dark dark:text-primary-color-light`}>
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
            </body>
          </ModalProvider>
        </UserProvider>
      </ErrorBoundary>
    </html>
  );
}
