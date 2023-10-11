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
import { Activity, StudentActivity, StudentActivityModal } from "@/types";
import { useUser } from "@/context/UserContext";
import { FaSpellCheck } from "react-icons/fa6";
import { IoMdDoneAll } from "react-icons/io";
import { FaWindowClose } from "react-icons/fa";

type StudentActivityTableProps = {
  activity: Activity;
};

export default function StudentActivityTable({
  activity,
}: StudentActivityTableProps) {
  const { user, selectedClass } = useUser();
  const [data, setData] = useState<StudentActivity[]>([]);
  const [filteredStudentActivities, setFilteredStudentActivities] = useState<
    StudentActivity[]
  >([]);
  const [filter, setFilter] = useState<string>("");
  const { toggleModal } = useModal();

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Os meses vão de 0 a 11, então adicionamos 1
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  useEffect(() => {
    const fetchStudentsActivities = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/activities/${activity.id}/student_activities/`,
          {
            headers: { Authorization: `Token ${Cookies.get("token")}` },
          }
        );
        const formatedData = response.data.map(
          (item: StudentActivity, index: number) => ({
            ...item,
            index: index + 1,
            final_grade: item.final_grade ? item.final_grade : "Não gerada",
            correction_date: item.correction_date
              ? formatDate(item.correction_date)
              : "Não corrigida",
          })
        );
        setData(formatedData);
        setFilteredStudentActivities(formatedData);
      } catch {
        toast.remove();
        toast.error("Ocorreu um erro inesperado ao carregar as atividades");
      }
    };
    fetchStudentsActivities();
  }, [selectedClass, user, activity.id]);

  const filterStudentActivities = data.filter(
    (studentActivity) =>
      studentActivity.student.name
        .toLowerCase()
        .includes(filter.toLowerCase()) ||
      studentActivity.student.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="text-primary-color-dark dark:text-primary-color-dark text-lg">
      <input
        className="px-4 py-2 h-9 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
        placeholder="Filtrar estudantes..."
        onChange={(e) => {
          setFilter(e.target.value || "");
        }}
      />
      <Table
        data={filterStudentActivities}
        fillHeight={false}
        hover={true}
        bordered
        className="h-auto text-base">
        <Column align="center" width={60}>
          <HeaderCell>N°</HeaderCell>
          <Cell dataKey="index" />
        </Column>
        <Column align="center" width={50} flexGrow={1}>
          <HeaderCell>Name</HeaderCell>
          <Cell>
            {(rowData) => {
              return (
                <div title={rowData.student.name}>{rowData.student.name}</div>
              );
            }}
          </Cell>
        </Column>
        <Column align="center" width={50} flexGrow={2}>
          <HeaderCell>Email</HeaderCell>
          <Cell>
            {(rowData) => {
              return (
                <div title={rowData.student.email}>{rowData.student.email}</div>
              );
            }}
          </Cell>
        </Column>
        <Column align="center" width={50} flexGrow={1}>
          <HeaderCell>Data de correção</HeaderCell>
          <Cell dataKey="correction_date" />
        </Column>
        <Column align="center" width={50} flexGrow={1}>
          <HeaderCell>Nota atribuida</HeaderCell>
          <Cell dataKey="final_grade" />
        </Column>
        <Column align="center" width={180}>
          <HeaderCell> </HeaderCell>
          <Cell align="center">
            {(rowData) => {
              function handleAction() {
                alert(`id:${rowData.id}`);
              }
              return (
                <span className="flex gap-2">
                  {!rowData.activity_link ? (
                    <button
                      disabled
                      className="flex text-md p-2 gap-2  h-8 rounded-md bg-gray-500 transition-all items-center text-white justify-center align-middle"
                      title="Corrigida">
                      <FaWindowClose />
                      Não Entregue
                    </button>
                  ) : rowData.final_grade === "Não gerada" ? (
                    <button
                      className="flex text-md p-2 gap-2  h-8 rounded-md bg-secondary-color-light transition-all hover:scale-105 items-center text-white justify-center align-middle"
                      title="Enviar nova senha"
                      onClick={() => {
                        let activityInfo: StudentActivity = {
                          id: rowData.id,
                          activity: rowData.activity,
                          class_obj: rowData.class_obj,
                          evaluations: rowData.evaluations,
                          post_date: rowData.post_date,
                          correction_date: rowData.correction_date,
                          final_grade: rowData.final_grade,
                          student: rowData.student,
                          activity_link: rowData.activity_link,
                        };
                        let fullActivity: StudentActivityModal = {
                          activity: activity,
                          studentActivity: activityInfo,
                        };
                        toggleModal("Evaluate", 0, fullActivity);
                      }}>
                      <FaSpellCheck />
                      Corrigir
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex text-md p-2 gap-2  h-8 rounded-md bg-gray-500 transition-all items-center text-white justify-center align-middle"
                      title="Corrigida">
                      <IoMdDoneAll />
                      Corrigida
                    </button>
                  )}
                </span>
              );
            }}
          </Cell>
        </Column>
      </Table>
    </div>
  );
}
