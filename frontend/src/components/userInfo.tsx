'use client'
import React from "react";
import { useUser } from "@/context/UserContext";

export default function UserInfo() {
  const { user } = useUser();
  const user_info = user?.info;
  return user?.info && (
    <header className="flex items-center justify-end px-5 space-x-10">
      <div className="flex flex-shrink-0 items-center space-x-4 text-black">
        <div className="flex flex-col items-end ">
          <div className="text-md font-medium ">{user_info?.name}</div>
          <div className="text-sm font-regular">
            {user_info?.is_teacher
              ? "Professor"
              : user_info?.is_student
              ? "Estudante"
              : ""}
          </div>
        </div>

        <div className="h-10 w-10 rounded-full cursor-pointer bg-gray-200 border-2 border-blue-400"></div>
      </div>
    </header>
  );
}
