import NineboxAccordion from "@/components/nineboxAccordion";
import { useModal } from "@/context/ModalContext";
import { useUser } from "@/context/UserContext";
import React, { useEffect, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";
import { Nine_box, StudentNineBox } from "@/types";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import { MdExpandMore } from "react-icons/md";
import NineBox from "@/components/nineBox";

export default function StudentNineboxesScreen() {
  const { toggleModal } = useModal();
  const { user, selectedClass } = useUser();
  const [studentNineboxes, setStudentNineboxes] = useState<StudentNineBox[]>(
    []
  );

  const fetchNinboxes = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/student_nineboxes/get_student_nine_boxes_for_class/`,
        {
          student_id: user?.info.id,
          class_obj: selectedClass?.unique_id,
        },
        {
          headers: { Authorization: `Token ${Cookies.get("token")}` },
        }
      );
      setStudentNineboxes(response.data);
      console.log(response.data);
    } catch {
      toast.remove();
      toast.error("Ocorreu um erro inesperado ao carregar as atividades");
    }
  };

  useEffect(() => {
    fetchNinboxes();
  }, [user, selectedClass]);

  return (
    <div>
      <div className="flex gap-2">
        <h1 className="text-4xl font-medium mb-5">Nineboxes</h1>
      </div>
      <div className="flex flex-wrap mt-2 text-2xl gap-4">
        {studentNineboxes.map((ninebox, index) => (
          <div>
            <Accordion defaultExpanded={true}>
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
                  <NineBox x={ninebox.x} y={ninebox.y} size={90} dark={false} />
                </Typography>
              </AccordionDetails>
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}
