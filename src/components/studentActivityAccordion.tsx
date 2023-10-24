import { StudentActivity } from "@/types";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { MdExpandMore } from "react-icons/md";
import { RiAlertFill, RiGitRepositoryCommitsFill } from "react-icons/ri";
import Cookies from "js-cookie";
import axios from "axios";
import { useUser } from "@/context/UserContext";
import { RiShareBoxFill } from "react-icons/ri";

interface Props {
  studentActivity: StudentActivity;
  delivered?: boolean;
}

type GradeInfo = {
  color: string;
  description: string;
};

const GRADE_MAPPING: { [key: string]: GradeInfo } = {
  E: { color: "green", description: "Excelente" },
  G: { color: "blue", description: "Bom" },
  A: { color: "orange", description: "Regular" },
  P: { color: "red", description: "Ruim" },
};

export default function StudentActivityAccordion({
  studentActivity,
  delivered = true,
}: Props) {
  const [activity_link, setActivity_link] = useState<string>("");
  const { fetchUser, user } = useUser();

  useEffect(() => {
    setActivity_link("");
  }, [user]);

  function formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // +1 porque getMonth() começa do 0 para janeiro
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  const handleSendActivity = async () => {
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/student_activities/${studentActivity.id}/submit_activity/`,
        {
          activity_link,
        },
        {
          headers: {
            Authorization: `Token ${Cookies.get("token")}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Atividade entregue com sucesso!");
        fetchUser();
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const e = error as { response: { status: number } };
      } else {
        toast.error("Ocorreu um erro desconhecido ao entregar a atividade.");
      }
    }
  };

  return (
    <div>
      <Accordion defaultExpanded={false}>
        <AccordionSummary
          expandIcon={<MdExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header">
          <div className="flex w-full justify-between">
            <Typography>
              <strong className="text-2xl font-medium">
                {studentActivity.activity.name}
              </strong>
            </Typography>
            <div>
              {studentActivity.final_grade ? (
                <Typography>
                  <strong className="text-xl text-white font-medium bg-green-500 px-2 py-1">
                    CORRIGIDA
                  </strong>
                </Typography>
              ) : studentActivity.activity_link ? (
                <Typography>
                  <strong className="text-xl text-white font-medium bg-blue-500 px-2 py-1">
                    ENTREGUE
                  </strong>
                </Typography>
              ) : (
                <Typography>
                  <strong className="text-xl text-white font-medium bg-red-500 px-2 py-1">
                    PENDENTE
                  </strong>
                </Typography>
              )}
              <Typography>
                <strong className="text-gray-500 text-2xl font-medium mr-5">
                  {studentActivity.post_date
                    ? formatDate(new Date(studentActivity.post_date))
                    : formatDate(new Date(studentActivity.activity.created_at))}
                </strong>
              </Typography>
            </div>
          </div>
        </AccordionSummary>
        <AccordionDetails className="bg-gray-200">
          {delivered && (
            <label className="mt-5 flex flex-col text-lg w-full">
              Link da atividade:
              <div className="flex gap-3 w-3/6 h-10">
                <input
                  disabled={studentActivity?.activity_link ? true : false}
                  className="w-full  px-4 py-1 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
                  value={studentActivity?.activity_link || activity_link}
                  onChange={(e) => {
                    setActivity_link(e.target.value);
                  }}
                />
                {studentActivity?.activity_link && (
                  <button
                    onClick={() => {
                      window.open(studentActivity.activity_link, "__blank__");
                    }}
                    className={`flex text-white items-center gap-2  rounded-sm  transition-all duration-300  bg-secondary-color-light hover:scale-105 
                   px-2 py-1`}>
                    <RiShareBoxFill />
                  </button>
                )}
                <button
                  onClick={handleSendActivity}
                  disabled={studentActivity?.activity_link ? true : false}
                  className={`flex items-center gap-2  rounded-sm  transition-all duration-300 text-white ${
                    !studentActivity?.activity_link
                      ? "bg-secondary-color-light hover:scale-105"
                      : "bg-gray-500"
                  } px-2 py-1`}>
                  <RiGitRepositoryCommitsFill />{" "}
                  {!studentActivity?.activity_link ? "ENTREGAR" : "ENTREGUE"}
                </button>
              </div>
              {!studentActivity?.activity_link && (
                <div className="mt-2 text-base inline-flex w-fit p-2 items-center gap-3 bg-secondary-color-light text-white">
                  <RiAlertFill />
                  Atenção! Não é possivel desfazer uma entrega.
                </div>
              )}
            </label>
          )}
          <Accordion defaultExpanded={false} className="mt-5">
            <AccordionSummary
              expandIcon={<MdExpandMore />}
              aria-controls="panel1a-content"
              id="panel1a-header">
              <Typography>
                <strong className="text-md font-medium">
                  Detalhes da atividade
                </strong>
              </Typography>
            </AccordionSummary>
            <AccordionDetails className="bg-gray-200">
              <div className="flex flex-col gap-5">
                <Typography>
                  <strong className="mt-5">Criada por:</strong>
                  <div className="flex flex-col">
                    <strong className="text-secondary-color-light">
                      {studentActivity.activity.created_by.name}
                    </strong>
                  </div>
                </Typography>
                <Typography>
                  <strong className="mt-5">Nível da atividade:</strong>
                  <div className="flex flex-col">
                    <strong className="text-secondary-color-light">
                      {studentActivity.activity.level}
                    </strong>
                  </div>
                </Typography>
                <Typography>
                  <strong>Descrição:</strong>
                  <br />
                  {studentActivity.activity.description}
                </Typography>
                <Typography>
                  <strong>Critérios:</strong>
                  <br />
                  <div className="flex flex-col gap-2">
                    {studentActivity.activity.criteria.map((c, index) => (
                      <div className="flex gap-2" key={c.id}>
                        {index + 1}.<p className="break-all">{c.description}</p>
                        <p className="text-sm bg-secondary-color-light text-white px-2 py-1 h-7 whitespace-nowrap">
                          Peso: {c.weight}
                        </p>
                      </div>
                    ))}
                  </div>
                </Typography>
                <Typography>
                  <strong className="mt-5">Disciplinas envolvidas:</strong>
                  <br />
                  <div className="flex flex-col">
                    {studentActivity?.activity.subjects.map((s, index) => (
                      <div className="flex gap-2" key={index}>
                        {index + 1}.<p>{s.name}</p>
                      </div>
                    ))}
                  </div>
                </Typography>
                <Typography>
                  <strong className="mt-5">Nine Boxes:</strong>
                  <br />
                  <div className="flex flex-col">
                    {studentActivity.activity.nine_boxes.map(
                      (ninebox, index) => (
                        <div className="flex gap-2" key={index}>
                          {index + 1}.<p>{ninebox.description}</p>
                        </div>
                      )
                    )}
                  </div>
                </Typography>
              </div>
            </AccordionDetails>
          </Accordion>

          {studentActivity.final_grade && (
            <Accordion defaultExpanded={false} className="">
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls="panel1a-content"
                id="panel1a-header">
                <Typography>
                  <strong className="text-md font-medium">
                    Detalhes da correção
                  </strong>
                </Typography>
              </AccordionSummary>
              <AccordionDetails className="bg-gray-200">
                <div className="flex flex-col gap-5">
                  <Typography>
                    <strong className="mt-5">Corrigido em:</strong>
                    <div className="flex flex-col">
                      <strong className="text-secondary-color-light">
                        {studentActivity.correction_date &&
                          formatDate(new Date(studentActivity.correction_date))}
                      </strong>
                    </div>
                  </Typography>
                  <Typography>
                    <strong className="mt-5">Nota da atividade:</strong>
                    <div className="flex flex-col">
                      <strong className="text-secondary-color-light">
                        {studentActivity.final_grade}
                      </strong>
                    </div>
                  </Typography>
                  <Typography>
                    <strong>Critérios:</strong>
                    <br />
                    <div className="flex flex-col gap-2">
                      {studentActivity.activity.criteria.map((c, index) => (
                        <div className="flex gap-2" key={index}>
                          {index + 1}.
                          <p className="break-all">{c.description}</p>
                          <p className="text-sm bg-secondary-color-light text-white px-2 py-1 h-7 whitespace-nowrap">
                            Peso: {c.weight}
                          </p>
                          {(() => {
                            const evaluation = studentActivity.evaluations.find(
                              (e) => e.criteria === c.id
                            );
                            if (evaluation) {
                              const gradeInfo = GRADE_MAPPING[evaluation.grade];
                              const gradeColor = gradeInfo.color;
                              const gradeDescription = gradeInfo.description;

                              return (
                                <p
                                  className={`text-base text-white px-2 bg-${gradeColor} py-1 h-7 whitespace-nowrap bg-${gradeColor}-500`}>
                                  {gradeDescription}
                                </p>
                              );
                            }
                          })()}
                        </div>
                      ))}
                    </div>
                  </Typography>
                </div>
              </AccordionDetails>
            </Accordion>
          )}
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
