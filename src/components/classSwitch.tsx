"use client";
import React, { useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { useEffect } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { RxEnter, RxHalf1 } from "react-icons/rx";
import { useModal } from "@/context/ModalContext";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { Class, FullUser } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { fetchClasses } from "@/lib/hooks/classes/fetchClasses";

export default function ClassSwitch() {
  const { data: session } = useSession();
  const { user, setSelectedClass, selectedClass, setUser } = useUser();
  const { toggleModal } = useModal();

  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["classes", session?.user.email, session?.user.accessToken],
    queryFn: () => fetchClasses(session?.user.accessToken, session?.user.email),
  });

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUniqueId = event.target.value;
    const selected =
      data &&
      data.find((classItem) => classItem.unique_id === selectedUniqueId);
    if (session) {
      session.user.selectedClass = selected?.unique_id;
    }
    console.log(session?.user.selectedClass.uni);
    setSelectedClass(selected || null);
    toast.success("Você mudou para a turma " + selected?.name);
  };

  return (
    <div className="flex items-center px-5 gap-4 flex-wrap mt-5">
      <h1>{session?.user.selectedClass}</h1>
      {data && data.length > 0 ? (
        <select
          onChange={handleSelectChange}
          value={session?.user.selectedClass || ""}
          id="classes"
          className="bg-gray-50  border w-[200px] h-10 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
          {data.map((classItem, index) => (
            <option key={index} value={classItem.unique_id}>
              {classItem.name}
            </option>
          ))}
        </select>
      ) : (
        <select
          id="classes"
          placeholder="no"
          className="bg-gray-50 h-10 border w-[200px] border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-secondary-color-light focus:border-secondary-color-light block  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-secondary-color-dark dark:focus:border-secondary-color-dark">
          <option>
            <h1>Sem turmas</h1>
          </option>
        </select>
      )}
      {user?.info.is_teacher && (
        <div
          className="flex text-sm  p-2 gap-2 w-[200px] h-10 rounded-md cursor-pointer bg-secondary-color-light dark:bg-secondary-color-dark transition-all hover:scale-105 items-center text-white justify-center align-middle"
          title="Nova Turma"
          onClick={() => {
            toggleModal("NewClass");
          }}>
          <AiOutlinePlus />
          <p>Nova turma</p>
        </div>
      )}
      <div
        className="flex text-sm p-2 gap-2 w-[200px] h-10 rounded-md cursor-pointer bg-secondary-color-light transition-all hover:scale-105 items-center text-white justify-center align-middle"
        title="Entrar em uma turma"
        onClick={() => {
          toggleModal("JoinClass");
        }}>
        <RxEnter /> Entrar em uma turma
      </div>
    </div>
  );
}
