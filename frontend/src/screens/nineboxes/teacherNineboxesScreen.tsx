import NineboxAccordion from "@/components/nineboxAccordion";
import { useModal } from "@/context/ModalContext";
import { useUser } from "@/context/UserContext";
import React from "react";
import { AiOutlinePlus } from "react-icons/ai";

export default function TeacherNineboxesScreen() {
  const { toggleModal } = useModal();
  const { user, selectedClass } = useUser();
  return (
    <div>
      <div className="flex gap-2">
        <h1 className="text-4xl font-medium mb-5">Nineboxes</h1>
        <div
          className="flex text-md p-2 gap-2 w-10 h-10 rounded-md cursor-pointer bg-secondary-color-light transition-all hover:scale-105 items-center text-white justify-center align-middle"
          title="Criar uma disciplina"
          onClick={() => {
            toggleModal("NewNinebox");
          }}>
          <AiOutlinePlus />
        </div>
      </div>
      <div className="flex flex-wrap mt-2 text-2xl gap-4">
        {selectedClass?.nineboxes?.map((ninebox, index) => (
          <div key={index}>
            <NineboxAccordion title={ninebox.description} id={ninebox.id}/>
          </div>
        ))}
      </div>
    </div>
  );
}
