"use client";
import React, { Suspense } from "react";
import { useUser } from "@/context/UserContext";
import LoadingScreen from "../loadingScreen";

const TeacherSubjectsScreen = React.lazy(
  () => import("@/screens/subjects/teacherSubjectsScreen")
);
const StudentSubjectsScreen = React.lazy(
  () => import("@/screens/subjects/studentSubjectsScreen")
);

export default function page() {
  const { token, user, selectedClass } = useUser();

  return user?.info.is_teacher ? (
    <Suspense fallback={<div>Carregando...</div>}>
      <TeacherSubjectsScreen />
    </Suspense>
  ) : user?.info.is_student ? (
    <StudentSubjectsScreen />
  ) : (
    <LoadingScreen />
  );
}
