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
      if (typeof error === "object" && error !== null && "response" in error) {
        const e = error as { response: { status: number } };
        toast.remove();
        toast.error("Ocorreu um erro desconhecido ao deletar a disciplina.");
      }
    }
  };

  useEffect(() => {
    fetchTeathers();
  }, [user]);

  return (
    <div>
      <Accordion>
        <AccordionSummary
          expandIcon={<MdExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header">
          <Typography>{title}</Typography>
        </AccordionSummary>
        <AccordionDetails className="bg-gray-200">
          <Typography>{description}</Typography>
          <Typography>
            <label className="font-bold">Nota média da sala:</label> {avg}
          </Typography>
          <Typography>
            <label className="font-bold">Desvio Padrão:</label> {std_dev}
          </Typography>
          <Typography>
            <label className="font-bold">Atividades relacionadas:</label>
            {activities}
          </Typography>
          <Typography>
            <label className="font-bold">Professores da disciplina:</label>
            {teachers &&
              teachers.map((teacher: any, index: number) => (
                <div key={index}>
                  {teacher.user.name}
                  {teacher.user.id == user?.info.id && (
                    <label className="bg-secondary-color-light text-sm text-white p-1 ml-2 rounded-sm">
                      VOCÊ
                    </label>
                  )}
                </div>
              ))}
          </Typography>
          {children}
          {permission && (
            <div className="flex gap-2 mt-2">
              <button
                className="flex text-md p-2 gap-2 h-8 rounded-md cursor-pointer bg-secondary-color-light transition-all hover:scale-105 items-center text-white justify-center align-middle"
                title="Criar uma disciplina"
                onClick={() => {
                  toggleModal("ConfirmDeleteSubject", id);
                }}>
                <MdDeleteForever />
                <p className="text-sm">Deletar</p>
              </button>
              <button
                className="flex text-md p-2 gap-2 h-8 rounded-md cursor-pointer bg-secondary-color-light transition-all hover:scale-105 items-center text-white justify-center align-middle"
                title="Criar uma disciplina"
                onClick={() => {
                  toggleModal("AddTeacherToSubject", id);
                }}>
                <PiChalkboardTeacherFill />
                <p className="text-sm">Adicionar Professor</p>
              </button>
            </div>
          )}
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
