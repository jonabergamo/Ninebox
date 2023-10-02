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
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get<ApiResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/classes/${selectedClass?.unique_id}/get_aggregate_nineboxes/`,
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
      } finally {
        setLoading(false);
      }
    };

    if (selectedClass) {
      fetchData();
    }
  }, [selectedClass]);

  return user?.info ? (
    <div className="text-xl text-gray-700">
      {user?.classes && user.classes.length > 0 ? (
        <div>
          <p>Turma Atual</p>
          <h1 className="text-3xl text-black">
            {selectedClass?.name}
            <span className="text-2xl ml-2 text-gray-700">
              #{selectedClass?.unique_id}
            </span>
            <h1 className="text-sm">Desvio Padrão: {std_dev}</h1>
            <h2 className="text-sm">{describeStdDev(std_dev)}</h2>
          </h1>

          <div className="flex gap-5 flex-wrap justify-center align-middle items-center">
            <div className="flex flex-col">
              <div className="w-full text-center mb-2">
                <h1 className="text-2xl text-black">Ninebox geral:</h1>
                <h2 className="text-xl font-medium">
                  Level:{" "}
                  <label className="text-blue-500">{chosenLevelValue}</label>
                </h2>
              </div>
              <div className="flex  gap-2">
                <div className="flex flex-col gap-2">
                  <label>
                    <select
                      value={selectedStat}
                      className="bg-gray-50  border w-[120px] h-10 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      onChange={(e) =>
                        setSelectedStat(
                          e.target.value as "avg" | "median" | "percentiles"
                        )
                      }>
                      <option value="avg">Média</option>
                      <option value="median">Mediana</option>
                      <option value="percentiles">Percentis</option>
                    </select>
                  </label>
                  {selectedStat == "percentiles" && (
                    <label>
                      <select
                        className="bg-gray-50  border w-[120px] h-10 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
                    </label>
                  )}
                </div>
                <NineBox x={chosenXValue} y={chosenYValue} size={90} />
              </div>
            </div>
          </div>
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
