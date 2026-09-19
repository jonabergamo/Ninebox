"use client"
import { ReactNode } from "react"
import { CELLS, cellTone } from "@/lib/grid"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type Props = {
  // highlight one cell, the student view
  x?: number
  y?: number
  // or render something inside every cell, the heatmap view
  render?: (x: number, y: number) => ReactNode
  size?: "sm" | "md" | "lg"
  labels?: boolean
  className?: string
}

const SIZES = { sm: "size-9 text-[0px]", md: "size-24 text-[10px]", lg: "size-32 text-xs" }

// the 3x3 board. bottom left is the weakest cell, top right the strongest
export default function NineBoxGrid({ x, y, render, size = "md", labels = true, className }: Props) {
  const { t } = useT()
  return (
    <div className={cn("inline-flex flex-col items-center gap-1", className)}>
      <div className="flex items-center gap-1">
        {labels && size !== "sm" && (
          <span className="text-muted-foreground -rotate-180 text-[10px] uppercase tracking-wide [writing-mode:vertical-rl]">{t.axis.y}</span>
        )}
        <div className="grid grid-cols-3 gap-1">
          {CELLS.map(([cx, cy]) => {
            const active = x === cx && y === cy
            return (
              <div
                key={`${cx}-${cy}`}
                className={cn(
                  "relative flex items-center justify-center rounded-md p-1 text-center leading-tight font-medium text-white transition-all",
                  SIZES[size],
                  cellTone(cx, cy),
                  x != null && !active && "opacity-30 saturate-50",
                  active && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                )}
                title={t.cells[`${cx},${cy}`]}
              >
                {render ? render(cx, cy) : size !== "sm" && <span className="drop-shadow-sm">{t.cells[`${cx},${cy}`]}</span>}
              </div>
            )
          })}
        </div>
      </div>
      {labels && size !== "sm" && <span className="text-muted-foreground text-[10px] uppercase tracking-wide">{t.axis.x}</span>}
    </div>
  )
}
