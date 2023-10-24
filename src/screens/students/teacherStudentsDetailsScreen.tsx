"use client";
import { useUser } from "@/context/UserContext";
import axios from "axios";
import React, { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import {
  FullUser,
  StudentActivity,
  StudentNineBox,
  StudentSubjects,
} from "@/types";
import { IoMdSad } from "react-icons/io";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import { MdCancel, MdExpandMore } from "react-icons/md";
import NineBox from "@/components/nineBox";
import StudentActivityAccordion from "@/components/studentActivityAccordion";
import LoadingScreen from "@/app/loadingScreen";

interface Props {
  student_id: string;
}

export default function TeacherStudentsDetailsScreen({ student_id }: Props) {
  const { selectedClass } = useUser();
  const [studentNineboxes, setStudentNineboxes] = useState<StudentNineBox[]>(
    []
  );
  const [studentSubjects, setStudentsSubjects] = useState<StudentSubjects[]>(
    []
  );
  const [activityData, setActivityData] = useState<StudentActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<
    StudentActivity[]
  >([]);
  const [student, setStudent] = useState<FullUser>();
  const [ordering, setOrdering] = useState<string>("-id");
  const [filterActivity, setFilterActivity] = useState("");
  const [found, setFound] = useState(false);

  useEffect(() => {
    if (
      student &&
      student.classes &&
      selectedClass &&
      selectedClass.unique_id
    ) {
      setFound(
        student.classes.some((cls) => cls.unique_id === selectedClass.unique_id)
      );
    } else {
      setFound(false);
    }
  }, [student, selectedClass]);

  useEffect(() => {
    const fetchStudent = () => {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/students/${student_id}`, {
          headers: { Authorization: `Token ${Cookies.get("token")}` },
        })
        .then((res) => {
          const { classes, user, nine_boxes, subjects } = res.data;
          const user_structure = {
            classes: classes,
            info: user,
            nine_boxes,
            subjects,
          };
          setStudent(user_structure);
        })
        .catch((error) => {});
    };

    fetchStudent();
  }, [student_id, selectedClass]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/student_activities/?class_obj=${selectedClass?.unique_id}&ordering=${ordering}&student=${student?.info.id}`,
          {
            headers: { Authorization: `Token ${Cookies.get("token")}` },
          }
        );
        setActivityData(response.data);
        setFilteredActivities(response.data);
      } catch {
        toast.remove();
        toast.error("Ocorreu um erro inesperado ao carregar as atividades");
      }
    };
    const fetchNineboxes = async () => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/student_nineboxes/get_student_nine_boxes_for_class/`,
          {
            student_id: student?.info.id,
            class_obj: selectedClass?.unique_id,
          },
          {
            headers: { Authorization: `Token ${Cookies.get("token")}` },
          }
        );
        setStudentNineboxes(response.data);
      } catch {
        toast.remove();
        toast.error("Ocorreu um erro inesperado ao carregar as nineboxes");
      }
    };
    const fetchSubjects = async () => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/subjects/student-details/`,
          {
            student_id: student?.info.id,
            class_id: selectedClass?.unique_id,
          },
          {
            headers: { Authorization: `Token ${Cookies.get("token")}` },
          }
        );
        setStudentsSubjects(response.data);
      } catch {
        toast.remove();
        toast.error("Ocorreu um erro inesperado ao carregar as atividades");
      }
    };
    if (student?.info) {
      fetchActivities();
      fetchNineboxes();
      fetchSubjects();
    }
  }, [student]);

  const NoSubjects = (
    <span className=" w-full flex flex-col gap-2 items-center justify-center text-xl text-gray-500">
      <div className="text-4xl">
        <IoMdSad />
      </div>
      Sem Disciplinas
    </span>
  );

  const NoNineBoxes = (
    <span className=" w-full flex flex-col gap-2 items-center justify-center text-xl text-gray-500">
      <div className="text-4xl">
        <IoMdSad />
      </div>
      Sem Nineboxes
    </span>
  );

  const NoActivities = (
    <span className=" w-full flex flex-col gap-2 items-center justify-center text-xl text-gray-500">
      <div className="text-4xl">
        <IoMdSad />
      </div>
      Sem atividades
    </span>
  );

  const StudentNotFound = (
    <span className=" w-full flex flex-col gap-2 items-center justify-center text-xl text-gray-500">
      <div className="text-4xl">
        <IoMdSad />
      </div>
      Estudante não encontrado
    </span>
  );

  return found ? (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl">{student?.info.name}</h1>
        <label htmlFor="">
          <strong>Email: </strong>
          <a href={`mailto:${student?.info.email}`}>{student?.info.email}</a>
        </label>
      </div>
      <div>
        <div className="flex gap-2">
          <h1 className="text-2xl font-medium mb-5">Disciplinas</h1>
        </div>
        <div className="flex flex-col flex-wrap mt-2 text-2xl gap-4">
          {studentSubjects.length !== 0
            ? studentSubjects &&
              studentSubjects.map((subject, index) => (
                <div key={index}>
                  <Accordion defaultExpanded={false}>
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
                        {(subject.average_grade &&
                          subject.average_grade.toFixed(2)) ||
                          "Sem registro"}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </div>
              ))
            : NoSubjects}
        </div>
      </div>
      <div>
        <div className="flex gap-2">
          <h1 className="text-2xl font-medium mb-5">Nineboxes</h1>
        </div>
        <div className="flex flex-col flex-wrap mt-2 text-2xl gap-4">
          {studentNineboxes.length !== 0
            ? studentNineboxes.map((ninebox, index) => (
                <div key={index}>
                  <Accordion defaultExpanded={false}>
                    <AccordionSummary
                      expandIcon={<MdExpandMore />}
                      aria-controls="panel1a-content"
                      id="panel1a-header">
                      <Typography className="flex items-center justify-center">
                        <strong className="text-2xl font-medium">
                          {ninebox.nine_box.description}
                        </strong>
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails className="bg-gray-300">
                      <Typography>
                        <div className="w-full text-left mb-2">
                          <h2 className="text-xl font-bold">
                            Level:{" "}
                            <label className="text-secondary-color-light">
                              {ninebox.level}
                            </label>
                          </h2>
                        </div>
                        <NineBox
                          x={ninebox.x}
                          y={ninebox.y}
                          size={90}
                          dark={false}
                        />
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </div>
              ))
            : NoNineBoxes}
        </div>
      </div>
      <div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-3">
            <h1 className="text-2xl font-medium mb-5">Atividades</h1>
          </div>
          <div className="flex gap-3 items-center">
            <input
              value={filterActivity}
              className="px-4 py-2 h-9 rounded outline-none text-black focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
              placeholder="Filtrar atividades..."
              onChange={(e) => {
                setFilterActivity(e.target.value || "");
              }}
            />
            {filterActivity && (
              <button
                className=" bg-secondary-color-light h-9 hover:brightness-90 text-white font-bold py-2 px-4 rounded"
                // onClick={handleAddActivity}
                onClick={() => {
                  setFilterActivity("");
                }}>
                <MdCancel />
              </button>
            )}
          </div>
          {filterActivity && (
            <p>
              Resultados para: <strong>{filterActivity}</strong>
            </p>
          )}
        </div>

        <div className="flex flex-col mt-2 text-2xl gap-4">
          {filteredActivities.length > 0
            ? filteredActivities.map((studentActivity, index) => (
                <div key={index}>
                  <Suspense fallback={<LoadingScreen />}>
                    <StudentActivityAccordion
                      delivered={false}
                      studentActivity={studentActivity}
                    />
                  </Suspense>
                </div>
              ))
            : NoActivities}
        </div>
      </div>
    </div>
  ) : (
    StudentNotFound // Mostrar quando a classe não é encontrada para o estudante
  );
}
