"use client";
import React from "react";
import { useUser } from "@/context/UserContext";
import LoadingScreen from "@/app/loadingScreen";
import TeacherSubjectDetailScreen from "@/screens/subjects/detail/teacherSubjectDetailScreen";
import StudentSubjectDetailScreen from "@/screens/subjects/detail/studentSubjectDetailScreen";

interface Params {
  subject: string;
  // outras propriedades aqui...
}

export default function page({ params }: { params: Params }) {
  const { user } = useUser();
  const subject = params.subject;

  return user?.info.is_teacher ? (
    <TeacherSubjectDetailScreen subject={subject} />
  ) : user?.info.is_student ? (
    <StudentSubjectDetailScreen subject={subject} />
  ) : (
    <LoadingScreen />
  );
}
