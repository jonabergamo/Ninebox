"use client";
import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import { useUser } from "@/context/UserContext";
import LoadingScreen from "../loadingScreen";

const TeacherActivitesScreen = dynamic(
  () => import("@/screens/activities/teacherActivitesScreen"),
  { loading: () => <LoadingScreen /> }
);
const StudentActivitiesScreen = dynamic(
  () => import("@/screens/activities/studentActivitiesScreen"),
  { loading: () => <LoadingScreen /> }
);

export default function ActivityPage() {
  const { token, user, selectedClass } = useUser();

  return user?.info.is_teacher ? (
    <TeacherActivitesScreen />
  ) : user?.info.is_student ? (
    <StudentActivitiesScreen />
  ) : (
    <LoadingScreen />
  );
}
