"use client";
import { useModal } from "@/context/ModalContext";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { MdDeleteForever } from "react-icons/md";
import { BsInfo } from "react-icons/bs";
import { PiPasswordFill } from "react-icons/pi";
import { HiUserRemove } from "react-icons/hi";
import { Table, Column, Cell, HeaderCell } from "rsuite-table";
import "rsuite-table/dist/css/rsuite-table.css";
import { IoMdSad } from "react-icons/io";
import { FullUser } from "@/types";
import Link from "next/link";
import LoadingScreen from "@/app/loadingScreen";

type TableProps = {
  data?: FullUser[];
};

export default function TableComponent({ data }: TableProps) {
  const { toggleModal } = useModal();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [studentData, setStudentData] = useState<FullUser[]>([]);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    setIsLoading(true);
    if (data) {
      setStudentData(data);
      setIsLoading(false);
    }
  }, [data]);

  const NoStudents = (
    <span className=" w-full flex flex-col gap-2 items-center justify-center text-xl text-gray-500">
      <div className="text-4xl">
        <IoMdSad />
      </div>
      Sem estudantes nessa turma
    </span>
  );

  useEffect(() => {
    if (data) {
      setStudentData(data);
    }
  }, [data]);

  const filteredStudent = studentData.filter(
    (student) =>
      student.info &&
      student.info.name &&
      student.info.email &&
      (student.info.name.toLowerCase().includes(filter.toLowerCase()) ||
        student.info.email.toLowerCase().includes(filter.toLowerCase()))
  );

  return isLoading ? (
    <LoadingScreen />
  ) : data?.length !== 0 ? (
    <div className="flex flex-col text-primary-color-dark dark:text-primary-color-dark gap-5">
      <div className="w-60">
        <input
          className="px-4 py-2 h-9 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
          placeholder="Filtrar estudantes..."
          onChange={(e) => {
            setFilter(e.target.value || "");
          }}
        />
      </div>
      <Table data={filteredStudent} height={420} cellBordered hover={true}>
        <Column align="center" width={50}>
          <HeaderCell>N°</HeaderCell>
          <Cell dataKey="callOrder" />
        </Column>
        <Column align="center" flexGrow={1}>
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="info.name" />
        </Column>
        <Column align="center" flexGrow={1}>
          <HeaderCell>Email</HeaderCell>
          <Cell dataKey="info.email" />
        </Column>
        <Column align="center" width={400}>
          <HeaderCell> </HeaderCell>
          <Cell align="center">
            {(rowData) => {
              function handleAction() {
                alert(`id:${rowData.id}`);
              }
              return (
                <span className="flex gap-2 items-center justify-center">
                  <Link
                    href={`students/${rowData.info.id}`}
                    className="flex text-md p-2 gap-2  h-8 rounded-md cursor-pointer bg-secondary-color-light transition-all hover:scale-105 items-center text-white justify-center align-middle"
                    title="Enviar nova senha">
                    <BsInfo />
                    Detalhes
                  </Link>
                  <div
                    className="flex text-md p-2 gap-2  h-8 rounded-md cursor-pointer bg-secondary-color-light transition-all hover:scale-105 items-center text-white justify-center align-middle"
                    title="Enviar nova senha"
                    onClick={() => {
                      toggleModal("SendNewPassword", rowData.info.id);
                    }}>
                    <PiPasswordFill />
                    Nova senha
                  </div>
                  <div
                    className="flex text-md p-2 gap-2  h-8 rounded-md cursor-pointer bg-secondary-color-light transition-all hover:scale-105 items-center text-white justify-center align-middle"
                    title="Remover estudante"
                    onClick={() => {
                      if (rowData.info) {
                        toggleModal(
                          "RemoveStudentFromClass",
                          rowData.info.email
                        );
                      }
                    }}>
                    <HiUserRemove />
                    Remover
                  </div>
                </span>
              );
            }}
          </Cell>
        </Column>
      </Table>
    </div>
  ) : (
    NoStudents
  );
}
