"use client";
import React from "react";
import { useUser } from "@/context/UserContext";
import LoadingScreen from "../loadingScreen";
import TeacherNineboxesScreen from "@/screens/nineboxes/teacherNineboxesScreen";
import StudentNineboxesScreen from "@/screens/nineboxes/studentNineboxesScreen";

export default function NineboxesPage() {
  const { token, user, selectedClass } = useUser();

  return user?.info.is_teacher ? (
    <TeacherNineboxesScreen />
  ) : user?.info.is_student ? (
    <StudentNineboxesScreen />
  ) : (
    <LoadingScreen />
  );
}
