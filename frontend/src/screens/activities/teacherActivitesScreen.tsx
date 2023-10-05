import { useModal } from "@/context/ModalContext";
import React from "react";
import { AiOutlinePlus } from "react-icons/ai";

export default function TeacherActivitesScreen() {
  const { toggleModal } = useModal();
  return (
    <div>
      <div className="flex gap-2">
        <h1 className="text-4xl font-medium mb-5">Atividades</h1>
        <div
          className="flex text-md p-2 gap-2 w-10 h-10 rounded-md cursor-pointer bg-secondary-color-light transition-all hover:scale-105 items-center text-white justify-center align-middle"
          title="Criar uma atividade"
          onClick={() => {
            toggleModal("NewActvity");
          }}>
          <AiOutlinePlus />
        </div>
      </div>
    </div>
  );
}
