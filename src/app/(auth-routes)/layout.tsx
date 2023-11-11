import { getServerSession } from "next-auth";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { nextAuthOptions } from "../api/auth/[...nextauth]/route";

interface PrivateLayoutProps {
  children: ReactNode;
}

export default async function PrivateLayout({ children }: PrivateLayoutProps) {
  const session = await getServerSession(nextAuthOptions);

  if (session) {
    redirect("/");
  }

  return (
    <div className="h-screen w-screen flex text-dark-color-1 overflow-hidden">
      {children}
    </div>
  );
}
