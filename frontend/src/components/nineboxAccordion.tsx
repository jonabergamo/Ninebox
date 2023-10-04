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
import NineBox from "./nineBox";

interface Props {
  title: string;
  description?: string;
  id?: number;
}

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

export default function NineboxAccordion({ description, id, title }: Props) {
  const { toggleModal } = useModal();
  const { user, selectedClass } = useUser();
  const [nineboxData, setNineboxData] = useState<NineBoxData | null>();
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
    if (nineboxData?.level && nineboxData?.x && nineboxData?.y) {
      setStd_dev(
        calculateStdDevOfThree(
          nineboxData?.level.std_dev,
          nineboxData?.x.std_dev,
          nineboxData?.y.std_dev
        )
      );
    }

    if (nineboxData) {
      switch (selectedStat) {
        case "avg":
          setChosenXValue(nineboxData.x.avg);
          setChosenYValue(nineboxData.y.avg);
          setChosenLevelValue(Math.round(nineboxData.level.avg));

          break;
        case "median":
          setChosenXValue(nineboxData.x.median);
          setChosenYValue(nineboxData.y.median);
          setChosenLevelValue(nineboxData.level.median);
          break;
        case "percentiles":
          setChosenXValue(nineboxData.x.percentiles[selectedPercentil]); // ou algum outro percentil
          setChosenYValue(nineboxData.y.percentiles[selectedPercentil]); // ou algum outro percentil
          setChosenLevelValue(
            Math.round(nineboxData.level.percentiles[selectedPercentil])
          );
          break;
        default:
          setChosenYValue(nineboxData.x.avg);
          setChosenYValue(nineboxData.y.avg);
          setChosenLevelValue(nineboxData.level.avg);

          break;
      }
    }

    // Agora você tem `chosenXValue` e `chosenYValue` atualizados
    // Você pode usá-los como achar melhor, talvez definir um estado ou chamar outra função
  }, [nineboxData, selectedStat, selectedPercentil, selectedClass]);

  const fetchNinebox = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/classes/${selectedClass?.unique_id}/get_aggregate_nineboxes/?ninebox=${id}`,
        {
          headers: { Authorization: `Token ${Cookies.get("token")}` },
        }
      );
      setNineboxData(response.data.aggregate_nineboxes);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Um erro inesperado aconteceu");
      }
    }
  };

  useEffect(() => {
    fetchNinebox();
  }, [user]);

  return (
    <div>
      <Accordion defaultExpanded={true}>
        <AccordionSummary
          expandIcon={<MdExpandMore />}
          aria-controls="panel1a-content"
          id="panel1a-header">
          <Typography className="flex items-center justify-center">
            <strong className="text-2xl font-medium">{title}</strong>
          </Typography>
        </AccordionSummary>
        <AccordionDetails className="bg-gray-300">
          <Typography>{description}</Typography>
          <Typography>
            <div className="w-full text-left mb-2">
              <h2 className="text-xl font-bold">
                Level:{" "}
                <label className="text-secondary-color-light">
                  {chosenLevelValue}
                </label>
              </h2>
              <h1 className="text-sm">
                <label className="font-bold">Desvio Padrão:</label> {std_dev}
              </h1>
              <h2 className="text-sm mb-2">{describeStdDev(std_dev)}</h2>
            </div>
          </Typography>
          <div className="flex flex-col gap-2 items-center justify-center">
            <div className="flex gap-4">
              <div className=" text-sm font-medium text-gray-900 ">
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
                <div className="mb-2 text-sm font-medium text-gray-900 ">
                  Percentil
                  <select
                    className="bg-gray-50  border w-[100px] h-10 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-secondary-color-light focus:border-secondary-color-light block  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-secondary-color-dark dark:focus:border-secondary-color-dark"
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
            <NineBox x={chosenXValue} y={chosenYValue} size={90} dark={false} />
          </div>
          <div className="flex gap-2 mt-5 items-center justify-center">
            <button
              className="flex text-md p-2 gap-2 h-8 rounded-md cursor-pointer bg-secondary-color-light transition-all hover:scale-105 items-center text-white justify-center align-middle"
              title="Criar uma disciplina"
              onClick={() => {
                toggleModal("ConfirmDeleteNinebox", id);
              }}>
              <MdDeleteForever />
              <p className="text-sm">Deletar</p>
            </button>
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
