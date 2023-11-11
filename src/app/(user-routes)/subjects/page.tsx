"use client";
import React, { Suspense } from "react";
import { useUser } from "@/context/UserContext";
import { useSession } from "next-auth/react";
import LoadingScreen from "@/app/loadingScreen";

const TeacherSubjectsScreen = React.lazy(
  () => import("@/screens/subjects/teacherSubjectsScreen")
);
const StudentSubjectsScreen = React.lazy(
  () => import("@/screens/subjects/studentSubjectsScreen")
);

export default function SubjectsPage() {
  const { token, user, selectedClass } = useUser();
  const { data: session } = useSession();

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
