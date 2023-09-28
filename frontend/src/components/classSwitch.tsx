"use client";
import React from "react";
import { useUser } from "@/context/UserContext";
import { useEffect } from "react";
import axios from "axios";
import { AiOutlinePlus } from "react-icons/ai";
import { RxEnter } from "react-icons/rx";

export default function ClassSwitch() {
  const { user, token, setSelectedClass, selectedClass } = useUser();

  useEffect(() => {
    console.log(user?.classes);
  }, [user]);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUniqueId = event.target.value;
    const selected = user?.classes.find(
      (classItem) => classItem.unique_id === selectedUniqueId
    );
    setSelectedClass(selected || null);
  };

  return user?.info && (
    <div className="flex items-center justify-end px-5 gap-2 max-w-4xl">
      <select
        onChange={handleSelectChange}
        id="countries"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        {user?.classes?.map((classItem, index) => (
          <option key={index} value={classItem.unique_id}>
            {classItem.name}
          </option>
        ))}
      </select>
      <div
        className="flex text-2xl w-8 h-8 aspect-square cursor-pointer bg-blue-500  p-2 rounded-full transition-all hover:scale-105 items-center text-white justify-center align-middle"
        title="Nova Turma">
        <AiOutlinePlus />
      </div>
      <div
        className="flex text-2xl w-8 h-8 aspect-square cursor-pointer bg-blue-500  p-2 rounded-full transition-all hover:scale-105 items-center text-white justify-center align-middle"
        title="Entrar em uma turma">
        <RxEnter />
      </div>
    </div>
  );
}
