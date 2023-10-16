import { Class, User, Subject } from "@/types";
import { useState } from "react";

type CustomSubjectsSelectProps = {
  subjectsData: Subject[];
  selectedSubjects: Subject[];
  setSelectedSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
};

export function CustomSubjectsSelect({
  subjectsData,
  selectedSubjects,
  setSelectedSubjects,
}: CustomSubjectsSelectProps) {
  const [filter, setFilter] = useState("");

  const addSelection = (subject: Subject) => {
    const SubjectsAlreadySelected = selectedSubjects.find(
      (s) => s.id === subject.id
    );

    if (SubjectsAlreadySelected) {
      setSelectedSubjects(selectedSubjects.filter((s) => s.id !== subject.id));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const filteredSubjectss = subjectsData.filter((subject) =>
    subject.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-2">
      <input
        className="px-4 py-2 h-9 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
        placeholder="Filtrar disciplinas..."
        onChange={(e) => {
          setFilter(e.target.value || "");
        }}
      />
      <div
        className="bg-white p-2 rounded-sm h-52 overflow-y-auto select-none"
        style={{ overflowY: "auto", maxHeight: "150px" }}>
        {filteredSubjectss.map((subject: Subject) => {
          const isSelected = selectedSubjects.some((s) => s.id === subject.id);

          return (
            <div
              key={subject.id}
              className={`flex cursor-pointer ${
                isSelected ? "bg-secondary-color-light text-white" : ""
              }`}
              onClick={() => addSelection(subject)}>
              <div>{subject.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
