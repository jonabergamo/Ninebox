"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Cookies from "js-cookie";
import Image from "next/image";
import AsideBar from "@/components/asideBar";
import UserInfo from "@/components/userInfo";
import ClassSwitch from "@/components/classSwitch";
import { FaBookOpen } from "react-icons/fa";
import axios from "axios";
import NineBox from "@/components/nineBox";
import LoadingScreen from "@/app/loadingScreen";
import { BiCopy } from "react-icons/bi";
import toast from "react-hot-toast";
import { IoAlert } from "react-icons/io5";

interface Percentiles {
  "0": number;
  "25": number;
  "50": number;
  "75": number;
  "100": number;
}

interface NineBoxAxisData {
  avg: number;
  median: number;
  std_dev: number;
  percentiles: Percentiles;
}

interface NineBoxData {
  level: NineBoxAxisData;
  x: NineBoxAxisData;
  y: NineBoxAxisData;
}

interface ApiResponse {
  status: string;
  aggregate_nineboxes: NineBoxData;
}

const calculateStdDevOfThree = (level: number, x: number, y: number) => {
  var avg = (level * 2 + x / 2 + y / 2) / 3;
  avg = Math.sqrt(avg);
  return parseFloat(avg.toFixed(2));
};

const describeStdDev = (stdDev: number) => {
  if (stdDev < 0.2) return "Turma Muito Equilibrada";
  if (stdDev < 0.5) return "Turma Equilibrada";
  if (stdDev < 1) return "Moderadamente Desequilibrada";
  return "Turma Muito Desequilibrada";
};

export default function TeacherHomeScreen() {
  const router = useRouter();
  const { token, user, selectedClass } = useUser();
  const [classNineBoxData, setClassNineBoxData] = useState<NineBoxData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStat, setSelectedStat] = useState<
    "avg" | "median" | "percentiles"
  >("avg");
  const [chosenXValue, setChosenXValue] = useState<number>(2);
  const [chosenYValue, setChosenYValue] = useState<number>(2);
  const [chosenLevelValue, setChosenLevelValue] = useState<number>(0);
  const [selectedPercentil, setSelectedPercentil] = useState<
    "0" | "25" | "50" | "75" | "100"
  >("50");
  const [std_dev, setStd_dev] = useState<number>(0.5);
  const [selectedNineBox, setSelectedNineBox] = useState<string | null>(null);

  useEffect(() => {
    if (classNineBoxData?.level && classNineBoxData?.x && classNineBoxData?.y) {
      setStd_dev(
        calculateStdDevOfThree(
          classNineBoxData?.level.std_dev,
          classNineBoxData?.x.std_dev,
          classNineBoxData?.y.std_dev
        )
      );
    }

    if (classNineBoxData) {
      switch (selectedStat) {
        case "avg":
          setChosenXValue(classNineBoxData.x.avg);
          setChosenYValue(classNineBoxData.y.avg);
          setChosenLevelValue(Math.round(classNineBoxData.level.avg));

          break;
        case "median":
          setChosenXValue(classNineBoxData.x.median);
          setChosenYValue(classNineBoxData.y.median);
          setChosenLevelValue(classNineBoxData.level.median);
          break;
        case "percentiles":
          setChosenXValue(classNineBoxData.x.percentiles[selectedPercentil]); // ou algum outro percentil
          setChosenYValue(classNineBoxData.y.percentiles[selectedPercentil]); // ou algum outro percentil
          setChosenLevelValue(
            Math.round(classNineBoxData.level.percentiles[selectedPercentil])
          );
          break;
        default:
          setChosenYValue(classNineBoxData.x.avg);
          setChosenYValue(classNineBoxData.y.avg);
          setChosenLevelValue(classNineBoxData.level.avg);

          break;
      }
    }

    // Agora você tem `chosenXValue` e `chosenYValue` atualizados
    // Você pode usá-los como achar melhor, talvez definir um estado ou chamar outra função
  }, [classNineBoxData, selectedStat, selectedPercentil, selectedClass]);

  useEffect(() => {
    if (!token && !Cookies.get("token")) {
      router.push("/login"); // Redireciona para a página de login se o token não existir
    }
  }, [token, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ApiResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/classes/${
            selectedClass?.unique_id
          }/get_aggregate_nineboxes/${
            selectedNineBox ? "?ninebox=" + selectedNineBox : ""
          }`,
          {
            headers: { Authorization: `Token ${Cookies.get("token")}` },
          }
        );
        setClassNineBoxData(response.data.aggregate_nineboxes);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unexpected error occurred");
        }
      }
    };

    if (selectedClass) {
      fetchData();
    }
  }, [selectedClass, selectedNineBox]);

  return user?.info ? (
    <div className="text-xl text-primary-color-dark dark:text-primary-color-light">
      {user?.classes && user.classes.length > 0 ? (
        <div>
          <p>Turma Atual</p>
          <h1 className="text-3xl">
            {selectedClass?.name}
            <span className="flex text-3xl ml-2 text-secondary-color-light gap-2">
              #{selectedClass?.unique_id}
              <button
                className="text-2xl hover:brightness-90 transition-all duration-300"
                title="Copiar"
                onClick={async () => {
                  if (selectedClass?.unique_id) {
                    try {
                      await navigator.clipboard.writeText(
                        selectedClass.unique_id
                      );
                      toast("Copiado para a área de transferencia", {
                        icon: "📌",
                      });
                    } catch (err) {
                      toast.error("Falha ao copiar texto");
                    }
                  }
                }}>
                <BiCopy />
              </button>
            </span>
          </h1>
          {selectedClass?.nineboxes && selectedClass?.nineboxes?.length > 0 ? (
            <div className="flex gap-5 flex-wrap justify-center align-middle items-center">
              <div className="w-full sm:text-left sm:mt-5 text-center  mb-2">
                <h1 className="text-2xl ">Ninebox:</h1>
                <h2 className="text-xl font-medium">
                  Level:{" "}
                  <label className="text-secondary-color-light">
                    {chosenLevelValue}
                  </label>
                </h2>
                <h1 className="text-sm">Desvio Padrão: {std_dev}</h1>
                <h2 className="text-sm">{describeStdDev(std_dev)}</h2>
              </div>
              <div className="flex flex-row md:flex-col">
                <div className="flex flex-wrap md:flex-col gap-2">
                  <div className="flex flex-col gap-2">
                    <div className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Escopo
                      <select
                        value={selectedNineBox || ""}
                        className="bg-gray-50 border h-10 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-secondary-color-light focus:border-secondary-color-light block  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-secondary-color-dark dark:focus:border-secondary-color-dark"
                        onChange={(e) => setSelectedNineBox(e.target.value)}>
                        <option value="" className="">
                          Todas
                        </option>
                        {selectedClass?.nineboxes &&
                          selectedClass?.nineboxes.map((ninebox, index) => (
                            <option key={index} value={ninebox.id}>
                              {ninebox.description}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Medida estátistica
                      <select
                        value={selectedStat}
                        className="bg-gray-50  border w-[120px] h-10 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-secondary-color-light focus:border-secondary-color-light block  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-secondary-color-dark dark:focus:border-secondary-color-dark"
                        onChange={(e) =>
                          setSelectedStat(
                            e.target.value as "avg" | "median" | "percentiles"
                          )
                        }>
                        <option value="avg">Média</option>
                        <option value="median">Mediana</option>
                        <option value="percentiles">Percentis</option>
                      </select>
                    </div>

                    {selectedStat == "percentiles" && (
                      <div className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Percentil
                        <select
                          className="bg-gray-50  border w-[250px] h-10 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-secondary-color-light focus:border-secondary-color-light block  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-secondary-color-dark dark:focus:border-secondary-color-dark"
                          value={selectedPercentil}
                          onChange={(e) =>
                            setSelectedPercentil(
                              e.target.value as "0" | "25" | "50" | "75" | "100"
                            )
                          }>
                          <option value="0">0%</option>
                          <option value="25">25%</option>
                          <option value="50">50%</option>
                          <option value="75">75%</option>
                          <option value="100">100%</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <NineBox x={chosenXValue} y={chosenYValue} size={90} />
                </div>
              </div>
            </div>
          ) : (
            <div className="inline-flex text-white bg-secondary-color-light py-1 px-2 items-center justify-center text-sm">
              <label className="text-xl">
                <IoAlert />
              </label>
              <label>
                Sua turma não possui nineboxes, clique{" "}
                <label
                  onClick={() => {
                    router.push("/nineboxes");
                  }}
                  className="font-bold underline-offset-auto cursor-pointer ">
                  aqui
                </label>{" "}
                para criar{" "}
              </label>
            </div>
          )}
        </div>
      ) : (
        <div className="flex w-full h-full items-center align-middle justify-center">
          <h1>Entre em uma turma para começar!</h1>
        </div>
      )}
    </div>
  ) : (
    <LoadingScreen />
  );
}
