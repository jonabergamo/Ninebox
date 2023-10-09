import ActivityAccordion from "@/components/activityAccordion";
import { useModal } from "@/context/ModalContext";
import { useUser } from "@/context/UserContext";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import Cookies from "js-cookie";
import { Nine_box, Subject, Activity, StudentActivity } from "@/types";
import toast from "react-hot-toast";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import { MdExpandMore } from "react-icons/md";

type Criterion = {
  id: number;
  description: string;
  weight: number;
};

export default function StudentActivitiesScreen() {
  const { toggleModal } = useModal();
  const { selectedClass, user } = useUser();
  const [activityData, setActivityData] = useState<StudentActivity[]>([]);
  const [ordering, setOrdering] = useState<string>("-id");
  const [filter, setFilter] = useState("");
  const [filteredActivities, setFilteredActivities] = useState<
    StudentActivity[]
  >([]);

  const fetchActivities = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/student_activities/?class_obj=${selectedClass?.unique_id}&ordering=${ordering}&student=${user?.info.id}`,
        {
          headers: { Authorization: `Token ${Cookies.get("token")}` },
        }
      );
      setActivityData(response.data);
      setFilteredActivities(response.data);
      console.log(response.data);
    } catch {
      toast.remove();
      toast.error("Ocorreu um erro inesperado ao carregar as atividades");
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [selectedClass, user]);

  const filterActivities = () => {
    setFilteredActivities(
      activityData.filter((studentActivity: StudentActivity) =>
        studentActivity.activity.name
          .toLowerCase()
          .includes(filter.toLowerCase())
      )
    );
  };

  function formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // +1 porque getMonth() começa do 0 para janeiro
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-3">
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
        <div className="flex gap-3 items-center">
          <input
            className="px-4 py-2 h-9 rounded outline-none text-black focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
            placeholder="Filtrar atividades..."
            onChange={(e) => {
              setFilter(e.target.value || "");
            }}
          />
          <button
            className=" bg-secondary-color-light hover:brightness-90 text-white font-bold py-2 px-4 rounded"
            // onClick={handleAddActivity}
            onClick={filterActivities}>
            Buscar
          </button>
        </div>
      </div>

      <div className="flex flex-col mt-2 text-2xl gap-4">
        {filteredActivities.map((studentActivity, index) => (
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
                  {!studentActivity.activity_link ? (
                    <Typography>
                      <strong className="text-2xl font-medium">PENDENTE</strong>
                    </Typography>
                  ) : null}
                  <Typography>
                    <strong className="text-gray-500 text-2xl font-medium mr-5">
                      {formatDate(
                        new Date(studentActivity.activity.created_at)
                      )}
                    </strong>
                  </Typography>
                </div>
              </AccordionSummary>
              <AccordionDetails className="bg-gray-200">
                <Accordion defaultExpanded={false}>
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
                            <div className="flex gap-2">
                              {index + 1}.
                              <p className="break-all">{c.description}</p>
                              <p className="text-sm bg-secondary-color-light text-white px-2 py-1 h-7 whitespace-nowrap">
                                Peso: {c.weight}
                              </p>
                            </div>
                          ))}
                        </div>
                      </Typography>
                      <Typography>
                        <strong className="mt-5">
                          Disciplinas envolvidas:
                        </strong>
                        <br />
                        <div className="flex flex-col">
                          {studentActivity?.activity.subjects.map(
                            (s, index) => (
                              <div className="flex gap-2">
                                {index + 1}.<p>{s.name}</p>
                              </div>
                            )
                          )}
                        </div>
                      </Typography>
                      <Typography>
                        <strong className="mt-5">Nine Boxes:</strong>
                        <br />
                        <div className="flex flex-col">
                          {studentActivity.activity.nine_boxes.map(
                            (ninebox, index) => (
                              <div className="flex gap-2">
                                {index + 1}.<p>{ninebox.description}</p>
                              </div>
                            )
                          )}
                        </div>
                      </Typography>
                    </div>
                  </AccordionDetails>
                </Accordion>
              </AccordionDetails>
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}
