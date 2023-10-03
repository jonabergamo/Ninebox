import React from "react";
import { useUser } from "@/context/UserContext";
import { AiOutlinePlus } from "react-icons/ai";
import { useModal } from "@/context/ModalContext";
import { MdDelete } from "react-icons/md";
import { useRouter } from "next/navigation";

export default function TeacherSubjectsScreen() {
  const { user, selectedClass } = useUser();
  const { toggleModal } = useModal();
  const router = useRouter();

  return (
    <div>
      <div className="flex gap-2">
        <h1 className="text-4xl font-medium mb-5">Disciplinas</h1>
        <div
          className="flex text-md p-2 gap-2 w-10 h-10 rounded-md cursor-pointer bg-secondary-color-light transition-all hover:scale-105 items-center text-white justify-center align-middle"
          title="Criar uma disciplina"
          onClick={() => {
            toggleModal("NewSubject");
          }}>
          <AiOutlinePlus />
        </div>
      </div>
      <div className="flex mt-2 text-2xl gap-4 flex-wrap">
        {selectedClass?.subjects?.map((subject, index) => (
          <div
            className="hover:underline cursor-pointer bg-white dark:bg-black text-black p-2.5 rounded-md"
            onClick={() => {
              router.push(`/subjects/${subject.name}`);
            }}>
            <p>{subject.name}</p>
          </div>
        ))}
      </div>
      
    </div>
  );
}
