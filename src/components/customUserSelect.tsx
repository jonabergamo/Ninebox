import { Class, User } from "@/types";
import { useState } from "react";

type Student = {
  user: User;
  classes: Class[];
  nine_boxes: number[];
};

type CustomUserSelectProps = {
  studentData: Student[];
  selectedStudents: Student[];
  setSelectedStudents: React.Dispatch<React.SetStateAction<Student[]>>;
};

export function CustomUserSelect({
  studentData,
  selectedStudents,
  setSelectedStudents,
}: CustomUserSelectProps) {
  const [filter, setFilter] = useState("");

  const addSelection = (student: Student) => {
    const studentAlreadySelected = selectedStudents.find(
      (s) => s.user.id === student.user.id
    );

    if (studentAlreadySelected) {
      setSelectedStudents(
        selectedStudents.filter((s) => s.user.id !== student.user.id)
      );
    } else {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  const filteredStudents = studentData.filter(
    (student) =>
      student.user.name.toLowerCase().includes(filter.toLowerCase()) ||
      student.user.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-2">
      <input
        className="px-4 py-2 h-9 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
        placeholder="Filtrar estudantes..."
        onChange={(e) => {
          setFilter(e.target.value || "");
        }}
      />
      <div
        className="bg-white p-2 rounded-sm h-52 overflow-y-auto select-none"
        style={{ overflowY: "auto", maxHeight: "150px" }}>
        {filteredStudents.map((student: Student) => {
          const isSelected = selectedStudents.some(
            (s) => s.user.id === student.user.id
          );

          return (
            <div
              key={student.user.id}
              className={`flex cursor-pointer ${
                isSelected ? "bg-secondary-color-light text-white" : ""
              }`}
              onClick={() => addSelection(student)}>
              <div>
                {student.user.name} ({student.user.email})
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
