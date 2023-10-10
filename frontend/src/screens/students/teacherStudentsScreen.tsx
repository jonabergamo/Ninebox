"use client";
import { useUser } from "@/context/UserContext";
import axios from "axios";
import React, { useEffect, useState, Suspense } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { AiOutlinePlus } from "react-icons/ai";
import { useModal } from "@/context/ModalContext";

const TableComponent = React.lazy(() => import("@/components/table"));

export default function TeacherStudentsScreen() {
  const { user, selectedClass, token } = useUser();
  const [studentsData, setStudentsData] = useState();
  const { toggleModal } = useModal();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/students/?classes=${selectedClass?.unique_id}`,
          {
            headers: { Authorization: `Token ${Cookies.get("token")}` },
          }
        );
        setStudentsData(response.data);
        console.log(response.data);
      } catch {
        toast.error("Ocorreu um erro inesperado ao carregar os estudantes");
      }
    };
    fetchStudents();
  }, [selectedClass, user]);

  return (
    <div className="flex flex-col gap-2">
      <button
        className="flex text-md p-2 gap-2 w-[200px] h-10 rounded-md cursor-pointer bg-secondary-color-light transition-all hover:scale-105 items-center text-white justify-center align-middle"
        title="Cadastrar Estudante"
        onClick={() => {
          toggleModal("NewStudent");
        }}>
        <AiOutlinePlus />
        <p>Cadastrar Estudante</p>
      </button>
      <Suspense fallback={<div>Carregando...</div>}>
        <TableComponent data={studentsData} />
      </Suspense>
    </div>
  );
}
