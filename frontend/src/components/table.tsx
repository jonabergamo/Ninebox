"use client";
import { useModal } from "@/context/ModalContext";
import React from "react";
import toast from "react-hot-toast";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { MdDeleteForever } from "react-icons/md";
import { PiPasswordFill } from "react-icons/pi";
import { HiUserRemove } from "react-icons/hi";
import { Table, Column, Cell, HeaderCell } from "rsuite-table";
import "rsuite-table/dist/css/rsuite-table.css";

export default function TableComponent({ data }: any) {
  const { toggleModal } = useModal();
  return (
    <div className="text-primary-color-dark dark:text-primary-color-dark ">
      <Table
        data={data}
        height={420}
        cellBordered
        fillHeight={true}
        hover={true}>
        <Column align="center" width={50}>
          <HeaderCell>ID</HeaderCell>
          <Cell dataKey="user.id" />
        </Column>
        <Column align="center" flexGrow={1}>
          <HeaderCell>Name</HeaderCell>
          <Cell dataKey="user.name" />
        </Column>
        <Column align="center" flexGrow={1}>
          <HeaderCell>Email</HeaderCell>
          <Cell dataKey="user.email" />
        </Column>
        <Column align="center" width={300}>
          <HeaderCell> </HeaderCell>
          <Cell align="center">
            {(rowData) => {
              function handleAction() {
                alert(`id:${rowData.id}`);
              }
              return (
                <span className="flex gap-2 items-center justify-center">
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
