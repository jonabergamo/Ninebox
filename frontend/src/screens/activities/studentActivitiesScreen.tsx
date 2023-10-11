import ActivityAccordion from "@/components/activityAccordion";
import { useModal } from "@/context/ModalContext";
import { useUser } from "@/context/UserContext";
import axios from "axios";
import React, { useEffect, useState, lazy, Suspense } from "react";
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
import { RiGitRepositoryCommitsFill } from "react-icons/ri";
import LoadingScreen from "@/app/loadingScreen";

const StudentActivityAccordion = lazy(
  () => import("@/components/studentActivityAccordion")
);

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

  useEffect(() => {
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
      } catch {
        toast.remove();
        toast.error("Ocorreu um erro inesperado ao carregar as atividades");
      }
    };
    fetchActivities();
  }, [selectedClass, user, ordering]);

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
          <div key={index}>
            <Suspense fallback={<LoadingScreen />}>
              <StudentActivityAccordion studentActivity={studentActivity} />
            </Suspense>
          </div>
        ))}
      </div>
    </div>
  );
}
