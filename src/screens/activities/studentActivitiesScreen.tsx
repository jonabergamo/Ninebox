"use client";
import { useModal } from "@/context/ModalContext";
import { useUser } from "@/context/UserContext";
import axios from "axios";
import React, { useEffect, useState, lazy, Suspense } from "react";
import Cookies from "js-cookie";
import { StudentActivity } from "@/types";
import toast from "react-hot-toast";
import LoadingScreen from "@/app/loadingScreen";
import { IoMdSad } from "react-icons/io";
import { MdCancel } from "react-icons/md";

const StudentActivityAccordion = lazy(
  () => import("@/components/studentActivityAccordion")
);

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

  useEffect(() => {
    filterActivities();
  }, [filter]);

  const NoActivities = (
    <span className=" w-full flex flex-col gap-2 items-center justify-center text-xl text-gray-500">
      <div className="text-4xl">
        <IoMdSad />
      </div>
      Sem atividades
    </span>
  );

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
            value={filter}
            className="px-4 py-2 h-9 rounded outline-none text-black focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
            placeholder="Filtrar atividades..."
            onChange={(e) => {
              setFilter(e.target.value || "");
            }}
          />
          {filter && (
            <button
              className=" bg-secondary-color-light h-9 hover:brightness-90 text-white font-bold py-2 px-4 rounded"
              // onClick={handleAddActivity}
              onClick={() => {
                setFilter("");
              }}>
              <MdCancel />
            </button>
          )}
        </div>
        {filter && (
          <p>
            Resultados para: <strong>{filter}</strong>
          </p>
        )}
      </div>

      <div className="flex flex-col mt-2 text-2xl gap-4">
        {filteredActivities.length > 0
          ? filteredActivities.map((studentActivity, index) => (
              <div key={index}>
                <Suspense fallback={<LoadingScreen />}>
                  <StudentActivityAccordion studentActivity={studentActivity} />
                </Suspense>
              </div>
            ))
          : NoActivities}
      </div>
    </div>
  );
}
