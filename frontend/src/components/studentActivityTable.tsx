"use client";
import { useModal } from "@/context/ModalContext";
import React, { useEffect, useState } from "react";

import toast from "react-hot-toast";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { MdDeleteForever } from "react-icons/md";
import { PiPasswordFill } from "react-icons/pi";
import { HiUserRemove } from "react-icons/hi";
import { Table, Column, Cell, HeaderCell } from "rsuite-table";
import "rsuite-table/dist/css/rsuite-table.css";
import axios from "axios";
import Cookies from "js-cookie";
import { Activity } from "@/types";
import { useUser } from "@/context/UserContext";

type StudentActivityTableProps = {
  activityId: number;
  order?: string;
  filter?: string;
};

export default function StudentActivityTable({
  activityId,
  order = "-id",
  filter = "",
}: StudentActivityTableProps) {
  const { user, selectedClass } = useUser();
  const [data, setData] = useState<Activity[]>([]);
  const [filteredStudentActivities, setFilteredStudentActivities] = useState<
    Activity[]
  >([]);

  const fetchStudentsActivities = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/student_activities/?activity=${activityId}&ordering=${order}`,
        {
          headers: { Authorization: `Token ${Cookies.get("token")}` },
        }
      );
      setData(response.data);
      setFilteredStudentActivities(response.data);
      console.log(response.data);
    } catch {
      toast.remove();
      toast.error("Ocorreu um erro inesperado ao carregar as atividades");
    }
  };

  useEffect(() => {
    fetchStudentsActivities();
  }, [selectedClass, user]);

  const filterStudentActivities = () => {
    setFilteredStudentActivities(
      data.filter((studentActivity) =>
        studentActivity.name.toLowerCase().includes(filter.toLowerCase())
      )
    );
  };

  const { toggleModal } = useModal();
  return (
    <div className="text-primary-color-dark dark:text-primary-color-dark ">
      <Table data={data} height={400} fillHeight={true} hover={true}>
        <Column align="center" resizable width={200} flexGrow={1}>
          <HeaderCell>ID</HeaderCell>
          <Cell dataKey="user.id" />
        </Column>
        <Column align="center" resizable width={200} flexGrow={1}>
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="user.name" />
        </Column>
        <Column align="center" resizable width={200} flexGrow={1}>
          <HeaderCell>Email</HeaderCell>
          <Cell dataKey="user.email" />
        </Column>
        <Column align="center" width={200} flexGrow={1}>
          <HeaderCell>Action</HeaderCell>
          <Cell align="center">
            {(rowData) => {
              function handleAction() {
                alert(`id:${rowData.id}`);
              }
              return (
                <span className="flex gap-2">
                  <div
                    className="flex text-md p-2 gap-2  h-8 rounded-md cursor-pointer bg-secondary-color-light transition-all hover:scale-105 items-center text-white justify-center align-middle"
                    title="Enviar nova senha"
                    onClick={() => {
                      toggleModal("SendNewPassword", rowData.user.id);
                    }}>
                    <PiPasswordFill />
                    Nova senha
                  </div>
                  <div
                    className="flex text-md p-2 gap-2  h-8 rounded-md cursor-pointer bg-secondary-color-light transition-all hover:scale-105 items-center text-white justify-center align-middle"
                    title="Remover estudante"
                    onClick={() => {
                      if (rowData.user) {
                        toggleModal(
                          "RemoveStudentFromClass",
                          rowData.user.email
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
  );
}
