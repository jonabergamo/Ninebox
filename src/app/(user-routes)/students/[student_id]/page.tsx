"use client";
import LoadingScreen from "@/app/loadingScreen";
import { useUser } from "@/context/UserContext";
import TeacherStudentsDetailsScreen from "@/screens/students/teacherStudentsDetailsScreen";
import React, { useEffect, useState } from "react";

export default function StudentDetailsPage({
  params,
}: {
  params: { student_id: string };
}) {
  const { user } = useUser();
  const student_id = params.student_id;

  return user?.info.is_teacher ? (
    <TeacherStudentsDetailsScreen student_id={student_id} />
  ) : user?.info.is_student ? (
    <h1>Você não tem permissão para acessar essa pagina</h1>
  ) : (
    <LoadingScreen />
  );
}
