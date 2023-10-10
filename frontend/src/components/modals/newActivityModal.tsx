import { useModal } from "@/context/ModalContext";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AiOutlinePlus } from "react-icons/ai";
import {
  MdDelete,
  MdMarkEmailRead,
  MdOutlineEmail,
  MdRemove,
} from "react-icons/md";
import { User, Class, Nine_box, Subject } from "@/types";
import axios from "axios";
import Cookies from "js-cookie";
import { useUser } from "@/context/UserContext";
import { CustomUserSelect } from "../customUserSelect";
import { CustomNineboxSelect } from "../customNineboxSelect";
import { CustomSubjectsSelect } from "../customSubjectSelect";
import { Checkbox, FormControlLabel } from "@mui/material";

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
  const [sendEmailToStudents, setSetSendEmailToStudents] =
    useState<boolean>(false);
  const [sendEmailToTeacher, setSendEmailToTeacher] = useState<boolean>(true);

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

  const fetchStudents = async () => {
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

  const fetchNineboxes = async () => {
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

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/subjects/?class_obj=${selectedClass?.unique_id}`,
        {
          headers: {
            Authorization: `Token ${Cookies.get("token")}`,
          },
        }
      );

      // Filtrando as disciplinas
      const filteredSubjects = user?.subjects
        ? response.data.filter((subject: Subject) =>
            user.subjects!.includes(subject.id)
          )
        : [];

      setSubjectsData(filteredSubjects);
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
    fetchStudents();
    fetchNineboxes();
    fetchSubjects();
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
    send_to_students: boolean;
    send_to_teacher: boolean;
  }

  window.addEventListener("beforeunload", (e) => {
    if (
      description.length >= 1 ||
      activityName.length >= 1 ||
      selectedStudents.length >= 1 ||
      selectedNineboxes.length >= 1 ||
      selectedSubjects.length >= 1
    ) {
      e.preventDefault();
      e.returnValue =
        "Você tem alterações não salvas. Tem certeza de que deseja sair?";
    }
  });

  window.addEventListener("popstate", function (event) {
    closeModal();
  });

  const handleAddActivity = async () => {
    toast.loading("Enviando atividade para os alunos...");
    closeModal();
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
        send_to_students: sendEmailToStudents,
        send_to_teacher: sendEmailToTeacher,
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
        // Fechar o modal após a criação bem-sucedida da classe.
        toast.remove();
        toast.success(
          "Atividade " + activityName + " criada e enviada com sucesso"
        );
      } else {
        // Lidar com outros códigos de status aqui.
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const e = error as { response: { status: number } };
        fetchUser();
        if (e.response.status === 500) {
          toast.remove();
          toast.error(
            "Os emails não foram enviados, verifique seu provedor de internet."
          );
        } else {
          toast.remove();
          toast.error("Ocorreu um erro desconhecido.");
        }
      }
    }
    fetchUser();
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
          Descrição da atividade:
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
            <p className="font-bold">{index + 1}</p>
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
        <p className="text-sm">Somente as disciplinas a qual você pertence.</p>
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
      <FormControlLabel
        label="Enviar documento da atividade para os estudantes."
        control={
          <Checkbox
            checked={sendEmailToStudents}
            onChange={() => {
              setSetSendEmailToStudents(!sendEmailToStudents);
            }}
            sx={{
              color: "red",
              "&.Mui-checked": {
                color: "red",
              },
            }}
          />
        }
      />
      <FormControlLabel
        className="mt-[-15px]"
        label="Enviar documento da atividade para mim."
        control={
          <Checkbox
            checked={sendEmailToTeacher}
            onChange={() => {
              setSendEmailToTeacher(!sendEmailToTeacher);
            }}
            sx={{
              color: "red",
              "&.Mui-checked": {
                color: "red",
              },
            }}
          />
        }
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
