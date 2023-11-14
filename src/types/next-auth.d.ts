import NextAuth from "next-auth/next";
import { type } from "os";
import { User } from ".";

declare module "next-auth" {
  export interface Session {
    user: {
      id: number;
      name: string;
      email: string;
      is_active: boolean;
      is_student: boolean;
      is_teacher: boolean;
      role: string;
      refreshToken: string;
      accessToken: string;
      selectedClass: Class;
    };
  }
}
