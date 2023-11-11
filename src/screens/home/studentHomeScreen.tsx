"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Cookies from "js-cookie";
import axios from "axios";
import LoadingScreen from "@/app/loadingScreen";
import { BiCopy } from "react-icons/bi";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/hooks/useAxiosAuth";

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

export default function StudentHomeScreen() {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
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
    const fetchData = async () => {
      try {
        const response = await axiosAuth.get<ApiResponse>(
          `/classes/${selectedClass?.unique_id}/get_aggregate_nineboxes/${
            selectedNineBox ? "?ninebox=" + selectedNineBox : ""
          }`
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

  return session?.user ? (
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
