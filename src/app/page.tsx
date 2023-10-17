"use client";
import React from "react";
import TeacherHomeScreen from "@/screens/home/teacherHomeScreen";
import StudentHomeScreen from "@/screens/home/studentHomeScreen";
import { useUser } from "@/context/UserContext";
import LoadingScreen from "./loadingScreen";

export default function Home() {
  const { user } = useUser();

  return user?.info && user?.info.is_teacher ? (
    <TeacherHomeScreen />
  ) : user?.info && user?.info.is_student ? (
    <StudentHomeScreen />
  ) : (
    <LoadingScreen />
  );
}
