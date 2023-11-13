import NextAuth from "next-auth/next";
import { type } from "os";
import { User } from ".";

declare module "next-auth" {
  export interface Session {
    user: {
      classes: Class[];
      id: number;
      name: string;
      email: string;
      is_active: boolean;
      is_student: boolean;
      is_teacher: boolean;
      first_access: boolean;
      nine_boxes?: Nine_box[];
      subjects?: number[];
      refresh: string;
      access: string;
    };
  }
}
