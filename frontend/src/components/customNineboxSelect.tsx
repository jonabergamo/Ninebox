import { Class, User, Nine_box } from "@/types";
import { useState } from "react";

type CustomNineboxSelectProps = {
  nineboxData: Nine_box[];
  selectedNineboxes: Nine_box[];
  setSelectedNineboxes: React.Dispatch<React.SetStateAction<Nine_box[]>>;
};

export function CustomNineboxSelect({
  nineboxData,
  selectedNineboxes,
  setSelectedNineboxes,
}: CustomNineboxSelectProps) {
  const [filter, setFilter] = useState("");

  const addSelection = (ninebox: Nine_box) => {
    const nineboxAlreadySelected = selectedNineboxes.find(
      (s) => s.id === ninebox.id
    );

    if (nineboxAlreadySelected) {
      setSelectedNineboxes(
        selectedNineboxes.filter((s) => s.id !== ninebox.id)
      );
    } else {
      setSelectedNineboxes([...selectedNineboxes, ninebox]);
    }
  };

  const filterednineboxs = nineboxData.filter((ninebox) =>
    ninebox.description.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-2">
      <input
        className="px-4 py-2 h-9 rounded outline-none focus:ring-secondary-color-light focus:border-secondary-color-light focus:ring-1 border-gray-500 border-[0.5px]"
        placeholder="Filtrar nineboxes..."
        onChange={(e) => {
          setFilter(e.target.value || "");
        }}
      />
      <div
        className="bg-white p-2 rounded-sm h-52 overflow-y-auto select-none"
        style={{ overflowY: "auto", maxHeight: "150px" }}>
        {filterednineboxs.map((ninebox: Nine_box) => {
          const isSelected = selectedNineboxes.some((s) => s.id === ninebox.id);

          return (
            <div
              key={ninebox.id}
              className={`flex cursor-pointer ${
                isSelected ? "bg-secondary-color-light text-white" : ""
              }`}
              onClick={() => addSelection(ninebox)}>
              <div>{ninebox.description}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
