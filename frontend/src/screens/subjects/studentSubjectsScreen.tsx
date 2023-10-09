import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { AiOutlinePlus } from "react-icons/ai";
import { useModal } from "@/context/ModalContext";
import { MdDelete, MdExpandMore } from "react-icons/md";
import { useRouter } from "next/navigation";
import SubjectAccordion from "@/components/subjectAccordion";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";

type StudentSubjects = {
  subject_name: string;
  total_activities: number;
  total_delivered: number;
  average_grade: number;
};

export default function StudentSubjectsScreen() {
  const { user, selectedClass } = useUser();
  const { toggleModal } = useModal();
  const [studentSubjects, setStudentsSubjects] = useState<StudentSubjects[]>(
    []
  );
  const router = useRouter();

  const fetchSubjects = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/subjects/student-details/`,
        {
          student_id: user?.info.id,
          class_id: selectedClass?.unique_id,
        },
        {
          headers: { Authorization: `Token ${Cookies.get("token")}` },
        }
      );
      setStudentsSubjects(response.data);
      console.log(response.data);
    } catch {
      toast.remove();
      toast.error("Ocorreu um erro inesperado ao carregar as atividades");
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [user, selectedClass]);

  return (
    <div>
      <div className="flex gap-2">
        <h1 className="text-4xl font-medium mb-5">Disciplinas</h1>
      </div>
      <div className="flex flex-col flex-wrap mt-2 text-2xl gap-4">
        {studentSubjects &&
          studentSubjects.map((subject, index) => (
            <div>
              <Accordion defaultExpanded={true}>
                <AccordionSummary
                  expandIcon={<MdExpandMore />}
                  aria-controls="panel1a-content"
                  id="panel1a-header">
                  <div className="flex w-full justify-between">
                    <Typography>
                      <strong className="text-2xl font-medium">
                        {subject.subject_name}
                      </strong>
                    </Typography>
                    {subject.total_activities - subject.total_delivered !==
                      0 && (
                      <div className="mr-5">
                        <strong className="text-base font-medium">
                          Atividade pendente
                        </strong>
                      </div>
                    )}
                  </div>
                </AccordionSummary>
                <AccordionDetails className="bg-gray-200">
                  <Typography>
                    <strong>Total de atividades: </strong>
                    {subject.total_activities}
                  </Typography>
                  <Typography>
                    <strong>Total de entregas: </strong>
                    {subject.total_delivered}
                  </Typography>
                  <Typography>
                    <strong>Média na disciplina: </strong>
                    {subject.average_grade || "Sem registro"}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </div>
          ))}
      </div>
    </div>
  );
}
