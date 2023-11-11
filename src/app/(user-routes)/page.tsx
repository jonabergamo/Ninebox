"use client";
import React from "react";
import TeacherHomeScreen from "@/screens/home/teacherHomeScreen";
import StudentHomeScreen from "@/screens/home/studentHomeScreen";
import LoadingScreen from "../loadingScreen";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  console.log(session?.user);
  return session && session?.user.is_teacher ? (
    <TeacherHomeScreen />
  ) : session && session?.user.is_student ? (
    <StudentHomeScreen />
  ) : (
    <LoadingScreen />
  );
}
