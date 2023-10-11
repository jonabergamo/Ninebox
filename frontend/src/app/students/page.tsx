"use client";
import React from "react";
import { useUser } from "@/context/UserContext";
import LoadingScreen from "../loadingScreen";
import TeacherStudentsScreen from "@/screens/students/teacherStudentsScreen";

export default function StudentsPage() {
  const { token, user, selectedClass } = useUser();

  return user?.info.is_teacher ? (
    <TeacherStudentsScreen />
  ) : user?.info.is_student ? (
    <h1>Você não tem permissão para acessar essa pagina</h1>
  ) : (
    <LoadingScreen />
  );
}
