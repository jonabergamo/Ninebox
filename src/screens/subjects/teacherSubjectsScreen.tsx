import React from "react";
import { useUser } from "@/context/UserContext";
import { AiOutlinePlus } from "react-icons/ai";
import { useModal } from "@/context/ModalContext";
import { MdDelete } from "react-icons/md";
import { useRouter } from "next/navigation";
import SubjectAccordion from "@/components/subjectAccordion";
import { IoMdSad } from "react-icons/io";

export default function TeacherSubjectsScreen() {
  const { user, selectedClass } = useUser();
  const { toggleModal } = useModal();
  const router = useRouter();

  const NoSubjects = (
    <span className=" w-full flex flex-col gap-2 items-center justify-center text-xl text-gray-500">
      <div className="text-4xl">
        <IoMdSad />
      </div>
      Sem Disciplinas
    </span>
  );

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
      <div className="flex flex-wrap mt-2 text-2xl gap-4">
        {selectedClass?.subjects?.length !== 0
          ? selectedClass?.subjects?.map((subject, index) => (
              <SubjectAccordion
                key={index}
                title={subject.name}
                std_dev={subject.std_dev_activity_grade}
                avg={subject.average_activity_grade}
                activities={subject.activities.length}
                id={subject.id}
                permission={
                  user?.subjects
                    ? user.subjects.some((s) => s === subject.id)
                    : false
                }
              />
            ))
          : NoSubjects}
      </div>
    </div>
  );
}
