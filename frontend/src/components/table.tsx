import React from "react";
import toast from "react-hot-toast";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { Table, Column, Cell, HeaderCell } from "rsuite-table";
import "rsuite-table/dist/css/rsuite-table.css";

export default function TableComponent({ data }: any) {
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
                    className="flex text-md p-2 gap-2 w-8 h-8 rounded-md cursor-pointer bg-secondary-color-light transition-all hover:scale-105 items-center text-white justify-center align-middle"
                    title="Criar uma disciplina"
                    onClick={() => {
                      toast(rowData.id);
                    }}>
                    <AiOutlinePlusCircle />
                  </div>
                  <div
                    className="flex text-md p-2 gap-2 w-8 h-8 rounded-md cursor-pointer bg-secondary-color-light transition-all hover:scale-105 items-center text-white justify-center align-middle"
                    title="Criar uma disciplina">
                    <AiOutlinePlusCircle />
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
