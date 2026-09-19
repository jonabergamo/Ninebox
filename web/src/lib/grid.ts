// the nine cells, bottom left is 1 and top right is 9. x is performance, y is potential
export const CELLS: [number, number][] = [
  [1, 3], [2, 3], [3, 3],
  [1, 2], [2, 2], [3, 2],
  [1, 1], [2, 1], [3, 1],
]

export const cellIndex = (x: number, y: number) => (y - 1) * 3 + x

// colours run from the bottom left corner to the top right, like the original app
export const cellTone = (x: number, y: number) => {
  const sum = x + y
  if (sum === 2) return "bg-red-500/80"
  if (sum === 3) return "bg-orange-400/80"
  if (sum === 4) return "bg-sky-500/80"
  if (sum === 5) return "bg-emerald-500/80"
  return "bg-emerald-700/90"
}
