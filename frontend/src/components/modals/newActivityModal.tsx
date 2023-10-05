import { useModal } from "@/context/ModalContext";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AiOutlinePlus } from "react-icons/ai";
import { MdDelete, MdRemove } from "react-icons/md";
import { User, Class, Nine_box, Subject } from "@/types";
import axios from "axios";
import Cookies from "js-cookie";
import { useUser } from "@/context/UserContext";
import { CustomUserSelect } from "../customUserSelect";
import { CustomNineboxSelect } from "../customNineboxSelect";
import { CustomSubjectsSelect } from "../customSubjectSelect";

type Criterion = {
  description: string;
  weight: number;
};

type Student = {
  user: User;
  classes: Class[];
  nine_boxes: number[];
};

export default function NewActivityModal() {
  const { closeModal } = useModal();
  const { selectedClass, user, fetchUser } = useUser();
  const [activityName, setActivityName] = useState("");
  const [level, setLevel] = useState(0);
  const [criteria, setCriteria] = useState<Criterion[]>([
    { description: "", weight: 0 },
  ]);
  const [nineboxData, setNineboxData] = useState<Nine_box[]>([]);
  const [selectedNineboxes, setSelectedNineboxes] = useState<Nine_box[]>([]);

  const [subjectsData, setSubjectsData] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [description, setDescription] = useState("");

  const [discipline, setDiscipline] = useState<string[]>([]);

  const addCriterion = () => {
    setCriteria([...criteria, { description: "", weight: 0 }]);
  };

  const [selectedStudents, setSelectedStudents] = useState<Student[]>([]);
  const [studentsData, setStudentsData] = useState<Student[]>([]);

  const handleDelete = (criterionIndex: number) => {
    if (criteria.length <= 1) {
      toast.error("Você deve ter ao menos 1 critério");
      return;
    }

    // Cria uma cópia do array original, removendo o item no índice especificado
    const updatedCriteria = criteria.filter(
      (_, index) => index !== criterionIndex
    );
    // Atualiza o estado com o novo array
    setCriteria(updatedCriteria);
  };

  const fechStudents = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/students/?classes=${selectedClass?.unique_id}`,
        {
          headers: {
            Authorization: `Token ${Cookies.get("token")}`,
          },
        }
      );
      setStudentsData(response.data);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const e = error as { response: { status: number } };
        if (e.response.status === 400) {
          toast.remove();
          toast(`Sem alunos na turma ${selectedClass?.name}`, {
            icon: "ℹ️",
          });
        } else {
          toast.error("Ocorreu um erro desconhecido ao carregar os alunos.");
        }
      }
    }
  };

  const fechNineboxes = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/nineboxes/?class_obj=${selectedClass?.unique_id}`,
        {
          headers: {
            Authorization: `Token ${Cookies.get("token")}`,
          },
        }
      );
      setNineboxData(response.data);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const e = error as { response: { status: number } };
        if (e.response.status === 400) {
          toast.remove();
          toast(`Sem nineboxes na turma ${selectedClass?.name}`, {
            icon: "ℹ️",
          });
        } else {
          toast.error("Ocorreu um erro desconhecido ao carregar as ninebox.");
        }
      }
    }
  };

  const fechSubjects = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/subjects/?class_obj=${selectedClass?.unique_id}`,
        {
          headers: {
            Authorization: `Token ${Cookies.get("token")}`,
          },
        }
      );
      setSubjectsData(response.data);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const e = error as { response: { status: number } };
        if (e.response.status === 400) {
          toast.remove();
          toast(`Sem disciplinas na turma ${selectedClass?.name}`, {
            icon: "ℹ️",
          });
        } else {
          toast.error(
            "Ocorreu um erro desconhecido ao carregar as disciplinas."
          );
        }
      }
    }
  };

  useEffect(() => {
    fechStudents();
    fechNineboxes();
    fechSubjects();
  }, []);

  interface RequestBody {
    name: string;
    description: string;
    level: number;
    subjects: number[];
    nine_boxes: number[];
    criteria: Criterion[];
    class_id?: string;
    student_ids?: number[];
  }

  const handleAddActivity = async () => {
    try {
      const subjectIds = selectedSubjects.map((subject) => subject.id);
      const nineboxIds = selectedNineboxes.map((ninebox) => ninebox.id);
      const studentsIds = selectedStudents.map((student) => student.user.id);

      const requestBody: RequestBody = {
        name: activityName,
        description: description,
        level: level,
        subjects: subjectIds,
        nine_boxes: nineboxIds,
        criteria: criteria,
        class_id: selectedClass?.unique_id,
      };
      if (studentsIds.length) {
        requestBody.student_ids = studentsIds;
      }
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/teachers/${user?.info.id}/create_activity/`,
        requestBody,
        {
          headers: {
            Authorization: `Token ${Cookies.get("token")}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        // Atualizar as informações do usuário ou fazer algo mais.
        fetchUser();

        // Fechar o modal após a criação bem-sucedida da classe.
        closeModal();
        toast.success("Atividade " + activityName + " criada com sucesso");
      } else {
        // Lidar com outros códigos de status aqui.
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const e = error as { response: { status: number } };
        toast.error("Ocorreu um erro desconhecido.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 px-5 text-primary-color-dark">
      <h1 className="text-primary-color-dark text-2xl">Criar uma atividade</h1>
      <div className="flex flex-col justify-evenly w-full flex-wap gap-5">
        <div className="flex justify-evenly w-full flex-wap gap-5">
          <label className="flex flex-col w-9/12">
            Nome da atividade:
            <input
              className="w-full px-4 py-2 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
            />
          </label>
          <label className="flex flex-col w-3/12">
            Nível:
            <input
              className="px-4 py-2 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
              type="number"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
            />
          </label>
        </div>
        <label className="flex flex-col w-full">
          Descrição:
          <textarea
            rows={4}
            className="block p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500  dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
          />
        </label>
      </div>
      Critérios:
      {criteria.map((criterion, index) => (
        <div
          key={index}
          className="flex  p-3 rounded-sm justify-evenly w-full flex-wap gap-3">
          <div className="flex flex-col justify-between items-center text-white p-2 bg-secondary-color-light rounded-sm">
            <p className="font-bold">{index}</p>
            <div
              className="w-full cursor-pointer hover:scale-110 transition-all duration-300"
              onClick={() => handleDelete(index)}>
              <MdDelete />
            </div>
          </div>
          <label className="flex flex-col w-9/12">
            Descrição:
            <textarea
              rows={4}
              className="block p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500  dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={criterion.description}
              onChange={(e) => {
                const newCriteria = [...criteria];
                newCriteria[index].description = e.target.value;
                setCriteria(newCriteria);
              }}
            />
          </label>
          <label className="flex flex-col w-3/12">
            Peso:
            <input
              className="px-4 py-2 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
              type="number"
              value={criterion.weight}
              onChange={(e) => {
                const newCriteria = [...criteria];
                newCriteria[index].weight = Number(e.target.value);
                setCriteria(newCriteria);
              }}
            />
          </label>
        </div>
      ))}
      <div className="flex items-center justify-center">
        <button
          onClick={addCriterion}
          className="flex text-1xl p-0.5 rounded-md hover:scale-110 transition-all duration-300 bg-secondary-color-light h-10 w-10 text-white items-center justify-center text-center">
          <AiOutlinePlus />
        </button>
      </div>
      <label>
        Nineboxes:
        <CustomNineboxSelect
          nineboxData={nineboxData}
          selectedNineboxes={selectedNineboxes}
          setSelectedNineboxes={setSelectedNineboxes}
        />
      </label>
      <label>
        Disciplinas:
        <CustomSubjectsSelect
          subjectsData={subjectsData}
          setSelectedSubjects={setSelectedSubjects}
          selectedSubjects={selectedSubjects}
        />
      </label>
      <h1 className="text-md">Estudantes:</h1>
      <p className="text-sm">
        Não selecionar nenhum estudante irá encaminhar a atividade para todos os
        alunos dessa turma.
      </p>
      <CustomUserSelect
        studentData={studentsData}
        selectedStudents={selectedStudents}
        setSelectedStudents={setSelectedStudents}
      />
      <div className="flex flex-col gap-2">
        <button
          className="mt-4 bg-secondary-color-light hover:brightness-90 text-white font-bold py-2 px-4 rounded"
          // onClick={handleAddActivity}
          onClick={handleAddActivity}>
          Adicionar
        </button>
        <button
          className=" bg-gray-500 hover:brightness-90 text-white font-bold py-2 px-4 rounded"
          onClick={closeModal}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
