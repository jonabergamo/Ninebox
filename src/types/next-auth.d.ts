import NextAuth from "next-auth/next";
import { type } from "os";

declare module "next-auth" {
  export interface Session {
    user: {
      id: number;
      name: string;
      email: string;
      is_active: boolean;
      is_student: boolean;
      is_teacher: boolean;
      refresh: string;
      access: string;
    };
  }
}
