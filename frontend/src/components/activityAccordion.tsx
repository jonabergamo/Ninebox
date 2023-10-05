"use client";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import { BiExpand } from "react-icons/bi";
import { MdDeleteForever, MdExpandMore } from "react-icons/md";
import { useModal } from "@/context/ModalContext";
import { PiChalkboardTeacherFill } from "react-icons/pi";
import { useEffect, useState } from "react";
import { selectClasses } from "@mui/material";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useUser } from "@/context/UserContext";
import { Activity, Nine_box, Subject } from "@/types";





interface Props {
  activity: Activity;
}

export default function ActivityAccordion({ activity }: Props) {
  const { toggleModal } = useModal();
  const created_date = new Date(activity.created_at);

  function formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // +1 porque getMonth() começa do 0 para janeiro
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  return (
    <div>
      <Accordion defaultExpanded={false}>
        <AccordionSummary
          expandIcon={<MdExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header">
          <div className="flex w-full justify-between">
            <Typography>
              <strong className="text-2xl font-medium">{activity.name}</strong>
            </Typography>
            <Typography>
              <strong className="text-gray-500 text-2xl font-medium mr-5">
                {formatDate(created_date)}
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
                <strong className="text-md font-medium">Notas</strong>
              </Typography>
            </AccordionSummary>
            <AccordionDetails className="bg-gray-200">
              <Typography>
                <strong>Média:</strong>{" "}
                {activity.average_grade || "Sem registro"}
                <br />
                <strong>Mediana:</strong>{" "}
                {activity.median_grade || "Sem registro"}
                <br />
                <strong>Percentil 25%:</strong>{" "}
                {activity.percentile_25 || "Sem registro"}
                <br />
                <strong>Percentil 75%:</strong>{" "}
                {activity.percentile_75 || "Sem registro"}
              </Typography>
            </AccordionDetails>
          </Accordion>

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
              <Typography>
                <strong className="mt-5">Nível da atividade:</strong>
                <div className="flex flex-col">
                  <strong className="text-secondary-color-light">
                    {activity.level}
                  </strong>
                </div>
              </Typography>
              <Typography>
                <strong>Descrição:</strong>
                <br />
                {activity.description}
              </Typography>
              <Typography>
                <strong>Critérios:</strong>
                <br />
                <div className="flex flex-col gap-2">
                  {activity.criteria.map((c, index) => (
                    <div className="flex gap-2">
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
                  {activity.subjects.map((s, index) => (
                    <div className="flex gap-2">
                      {index + 1}.<p>{s.name}</p>
                    </div>
                  ))}
                </div>
              </Typography>
              <Typography>
                <strong className="mt-5">Nine Boxes:</strong>
                <br />
                <div className="flex flex-col">
                  {activity.nine_boxes.map((ninebox, index) => (
                    <div className="flex gap-2">
                      {index + 1}.<p>{ninebox.description}</p>
                    </div>
                  ))}
                </div>
              </Typography>
            </AccordionDetails>
          </Accordion>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
