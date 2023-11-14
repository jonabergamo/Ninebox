import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ErrorBoundary from "@/components/ErrorBoundary";
import NextAuthSessionProvider from "@/providers/sessionProviders";
import { UserProvider } from "@/context/UserContext";
import { ModalProvider } from "@/context/ModalContext";
import QueryProvider from "@/providers/queryProvider";


// import { ReactQueryDevtools } from "react-query/devtools";
// import QueryProvider from "@/providers/queryProvider";

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
      {/* <ErrorBoundary> */}
      <NextAuthSessionProvider>
        <QueryProvider>
          <UserProvider>
            <ModalProvider>
              <body
                className={`${inter.className} flex flex-row h-screen bg-primary-color-light dark:bg-primary-color-dark text-primary-color-dark dark:text-primary-color-light`}>
                {children}
              </body>
            </ModalProvider>
          </UserProvider>
        </QueryProvider>
      </NextAuthSessionProvider>
      {/* </ErrorBoundary> */}
    </html>
  );
}
