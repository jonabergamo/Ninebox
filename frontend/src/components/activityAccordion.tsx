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
  id?: number;
  permission: boolean;
}

export default function ActivityAccordion({
  title,
  description,
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
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
