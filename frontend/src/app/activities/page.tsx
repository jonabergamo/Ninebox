"use client";
import React from "react";
import { useUser } from "@/context/UserContext";
import LoadingScreen from "../loadingScreen";
import TeacherNineboxesScreen from "@/screens/nineboxes/teacherNineboxesScreen";
import StudentNineboxesScreen from "@/screens/nineboxes/studentNineboxesScreen";
import TeacherActivitesScreen from "@/screens/activities/teacherActivitesScreen";
import StudentActivitiesScreen from "@/screens/activities/studentActivitiesScreen";

export default function page() {
  const { token, user, selectedClass } = useUser();

  return user?.info.is_teacher ? (
    <TeacherActivitesScreen />
  ) : user?.info.is_student ? (
    <StudentActivitiesScreen />
  ) : (
    <LoadingScreen />
  );
}
