import { useModal } from "@/context/ModalContext";
import { useUser } from "@/context/UserContext";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import Cookies from "js-cookie";
import { Criteria } from "@/types";

type Grade = {
  criteria_id: number;
  grade: string;
};

export default function EvaluateModal() {
  const { closeModal, studentActivity } = useModal();
  const { user, fetchUser } = useUser();
  const [grades, setGrades] = useState<Grade[]>([]);

  const handleEvaluate = async () => {
    if (grades.length !== studentActivity?.activity.criteria.length) {
      toast.error("Você deve corrigir todos os critérios.");
      return;
    }
    toast.loading("Corrigindo...");
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/student_activities/${studentActivity?.studentActivity.id}/grade_exam/`,
        {
          grades: grades,
        },
        {
          headers: { Authorization: `Token ${Cookies.get("token")}` },
        }
      );

      if (response.status === 200 || response.status === 201) {
        fetchUser();
        closeModal();
        toast.remove();
        toast.success("Atividade corrigida com sucesso!");
      } else {
        console.log(response.data);
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const e = error as { response: { status: number; data: any } };
        if (e.response.status === 400) {
          console.error("Error 400:", e.response.data);
        } else {
          toast.remove();
          toast.error("Ocorreu um erro desconhecido.");
          console.error(error);
        }
      }
    }
    toast.remove();
  };

  const handleGradeUpdate = (criteria_id: number, grade: string) => {
    // Verifique se a entrada com o ID do critério já existe
    const existingGradeIndex = grades.findIndex(
      (g) => g.criteria_id === criteria_id
    );

    if (existingGradeIndex !== -1) {
      // Atualize a entrada existente
      const updatedGrades = [...grades];
      updatedGrades[existingGradeIndex].grade = grade;
      setGrades(updatedGrades);
    } else {
      // Adicione uma nova entrada
      setGrades([...grades, { criteria_id, grade }]);
    }
  };

  useEffect(() => {
    console.log(grades);
  }, [grades]);

  return (
    <div className="flex flex-col gap-2 px-8 pb-5 text-primary-color-dark relative">
      <button
        className="absolute top-0 left-0 bg-red-500 hover:bg-red-600 text-white hover:scale-105 transition-all duration-300 p-2 rounded-full"
        onClick={() => {
          closeModal();
        }}>
        <IoClose />
      </button>
      <h1 className="text-primary-color-dark text-2xl w-full text-center">
        Corrigir Atividade
      </h1>
      <label>
        <strong>Aluno:</strong> {studentActivity?.studentActivity.student.name}
      </label>
      <h1 className="font-bold text-lg">Critérios:</h1>
      {studentActivity?.activity.criteria.map((c, index) => (
        <CriteriaSelector index={index} c={c} onChange={handleGradeUpdate} />
      ))}
      <div className="flex flex-col gap-2 w-full items-center">
        <button
          className="mt-4 w-5/12 bg-secondary-color-light hover:scale-105 transition-all duration-300 text-white font-bold py-2 px-4 rounded"
          onClick={handleEvaluate}>
          Corrigir
        </button>
      </div>
    </div>
  );
}

type CriteriaSelectorProps = {
  index: number;
  c: Criteria;
  onChange: (criteria_id: number, grade: string) => void;
};

function CriteriaSelector({ index, c, onChange }: CriteriaSelectorProps) {
  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (selected) {
      onChange(c.id, selected);
    }
  }, [selected]);

  return (
    <div
      key={index}
      className="flex flex-col items-center max-w-2xl p-3 rounded-sm justify-start flex-wap gap-3">
      <div className="flex break-words">
        <div className="flex flex-col justify-between items-center text-white p-2 bg-secondary-color-light rounded-sm">
          <p className="font-bold">{index + 1}</p>
        </div>
        <label className="flex flex-col">
          <div className="block p-2.5 w-full break-words text-lg text-gray-900 bg-white  focus:ring-blue-500 focus:border-blue-500  dark:focus:ring-blue-500 dark:focus:border-blue-500">
            {c.description}
          </div>
        </label>
        <label className="flex flex-col">
          <p className="text-sm bg-secondary-color-light text-white px-2 py-1 h-7 whitespace-nowrap">
            Peso: {c.weight}
          </p>
        </label>
      </div>
      <div className="flex text-md">
        <button
          className={`hover:scale-105 transition-all duration-300 hover:shadow-md ${
            selected === "P" ? "bg-red-500" : "bg-gray-500 "
          } text-white px-3 py-1`}
          onClick={() => {
            setSelected("P");
          }}>
          RUIM
        </button>
        <button
          className={`hover:scale-105 transition-all duration-300 hover:shadow-md ${
            selected === "A" ? "bg-orange-500" : "bg-gray-500"
          } text-white px-3 py-1`}
          onClick={() => {
            setSelected("A");
          }}>
          REGULAR
        </button>
        <button
          className={`hover:scale-105 transition-all duration-300 hover:shadow-md ${
            selected === "G" ? "bg-blue-500" : "bg-gray-500"
          } text-white px-3 py-1`}
          onClick={() => {
            setSelected("G");
          }}>
          BOM
        </button>
        <button
          className={`hover:scale-105 transition-all duration-300 hover:shadow-md ${
            selected === "E" ? "bg-green-500" : "bg-gray-500"
          } text-white px-3 py-1`}
          onClick={() => {
            setSelected("E");
          }}>
          EXCELENTE
        </button>
      </div>
    </div>
  );
}
