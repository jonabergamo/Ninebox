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

interface Props {
  title: string;
  description?: string;
  avg?: number;
  std_dev?: number;
  activities?: number;
  children?: React.ReactNode;
  id?: number;
  permission: boolean;
}

export default function SubjectAccordion({
  title,
  description,
  avg,
  std_dev,
  activities,
  children,
  id,
  permission = false,
}: Props) {
  const { toggleModal } = useModal();
  const { user } = useUser();
  const [teachers, setTeachers] = useState<any>();

  useEffect(() => {
    const fetchTeathers = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/teachers/?subjects=${id}`,
          {
            headers: { Authorization: `Token ${Cookies.get("token")}` },
          }
        );

        if (response.status === 200) {
          setTeachers(response.data);
        } else {
          // Lidar com outros códigos de status aqui.
        }
      } catch (error: unknown) {
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error
        ) {
          const e = error as { response: { status: number } };
          toast.remove();
          toast.error("Ocorreu um erro desconhecido ao deletar a disciplina.");
        }
      }
    };
    fetchTeathers();
  }, [user, id]);

  return (
    <div>
      <Accordion defaultExpanded={true}>
        <AccordionSummary
          expandIcon={<MdExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header">
          <Typography>
            <strong className="text-2xl font-medium">{title}</strong>
          </Typography>
        </AccordionSummary>
        <AccordionDetails className="bg-gray-200">
          <div>
            <Typography>{description}</Typography>
            <Typography>
              <strong>Nota média da sala:</strong> {avg}
            </Typography>
            <Typography>
              <strong>Desvio Padrão:</strong> {std_dev}
            </Typography>
            <Typography>
              <strong>Atividades relacionadas:</strong> {activities}
            </Typography>
            <Typography>
              <strong>Professores da disciplina:</strong>
            </Typography>
            {teachers &&
              teachers.map((teacher: any, index: number) => (
                <Typography key={index} component="div">
                  {teacher.user.name}
                  {teacher.user.id == user?.info.id && (
                    <span className="bg-secondary-color-light text-sm text-white p-1 ml-2 rounded-sm">
                      VOCÊ
                    </span>
                  )}
                </Typography>
              ))}
            {children}
          </div>
          {permission && (
            <div className="flex gap-2 mt-2">
              <button
                className="flex text-md p-2 gap-2 h-8 rounded-md cursor-pointer bg-secondary-color-light transition-all hover:scale-105 items-center text-white justify-center align-middle"
                title="Criar uma disciplina"
                onClick={() => {
                  toggleModal("ConfirmDeleteSubject", id);
                }}>
                <MdDeleteForever />
                <span className="text-sm">Deletar</span>
              </button>
              <button
                className="flex text-md p-2 gap-2 h-8 rounded-md cursor-pointer bg-secondary-color-light transition-all hover:scale-105 items-center text-white justify-center align-middle"
                title="Criar uma disciplina"
                onClick={() => {
                  toggleModal("AddTeacherToSubject", id);
                }}>
                <PiChalkboardTeacherFill />
                <span className="text-sm">Adicionar Professor</span>
              </button>
            </div>
          )}
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
