"use client";
import ActivityAccordion from "@/components/activityAccordion";
import { useModal } from "@/context/ModalContext";
import { useUser } from "@/context/UserContext";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import Cookies from "js-cookie";
import { Activity } from "@/types";
import toast from "react-hot-toast";
import { FaSadTear } from "react-icons/fa";
import { IoMdSad } from "react-icons/io";
import { MdCancel } from "react-icons/md";

export default function TeacherActivitesScreen() {
  const { toggleModal } = useModal();
  const { selectedClass, user } = useUser();
  const [activityData, setActivityData] = useState<Activity[]>([]);
  const [ordering, setOrdering] = useState<string>("-id");
  const [filter, setFilter] = useState("");
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/activities/?class_obj=${selectedClass?.unique_id}&ordering=${ordering}`,
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
      activityData.filter((activity) =>
        activity.name.toLowerCase().includes(filter.toLowerCase())
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
          ? filteredActivities.map((activity, index) => (
              <div key={index}>
                <ActivityAccordion activity={activity} />
              </div>
            ))
          : NoActivities}
      </div>
    </div>
  );
}
