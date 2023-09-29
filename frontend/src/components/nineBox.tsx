import React from "react";

interface NineBoxProps {
  x: number;
  y: number;
  size?: number;
  gap?: number;
}
const getColor = (row: number, col: number) => {
  if (row === 1 && col === 1) return "bg-red-500";
  if ((row === 1 && col === 2) || (row === 2 && col === 1))
    return "bg-orange-500";
  if (
    (row === 1 && col === 3) ||
    (row === 3 && col === 1) ||
    (row === 2 && col === 2)
  )
    return "bg-blue-500";
  if ((row === 2 && col === 3) || (row === 3 && col === 2))
    return "bg-green-500";
  if (row === 3 && col === 3) return "bg-green-700";
  return "bg-gray-300";
};

const getText = (row: number, col: number) => {
  if (row === 1 && col === 1) return "Insuficiente";
  if (row === 1 && col === 2) return "Eficaz";
  if (row === 1 && col === 3) return "Comprometido";
  if (row === 2 && col === 1) return "Questionável";
  if (row === 2 && col === 2) return "Mantenedor";
  if (row === 2 && col === 3) return "Forte Desempenho";
  if (row === 3 && col === 1) return "Enigma";
  if (row === 3 && col === 2) return "Forte Desempenho";
  if (row === 3 && col === 3) return "Alto Potencial";
  return "";
};

export default function NineBox({ x, y, size = 120, gap = 5 }: NineBoxProps) {
  const clampedX = Math.min(Math.max(Math.round(x), 1), 3);
  const clampedY = Math.min(Math.max(Math.round(y), 1), 3);

  const boxStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  const gridStyle = {
    gap: `${gap}px`,
    width: `${size * 3 + gap * 2}px`,
    height: `${size * 3 + gap * 2}px`,
  };

  return (
    <div className="grid grid-cols-3" style={gridStyle}>
      {[3, 2, 1].map((row) => {
        return [1, 2, 3].map((col) => (
          <div
            key={`${row}-${col}`}
            style={boxStyle}
            className={`border ${getColor(
              row,
              col
            )} flex items-center justify-center ${
              row === clampedX && col === clampedY
                ? "ring-2 ring-black saturate-100"
                : "saturate-50 brightness-75 hover:saturate-100 hover:brightness-100"
            }`}>
            <span
              style={{ fontSize: `${size * 0.13}px` }}
              className="text-white text-center leading-5">
              {getText(row, col)}
            </span>
          </div>
        ));
      })}
    </div>
  );
}
