"use client"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { classes, Heatmap as HeatmapData } from "@/lib/api"
import { useT } from "@/lib/i18n"
import NineBoxGrid from "./nine-box-grid"
import { BoardSkeleton } from "./skeletons"
import { CELLS, cellTone } from "@/lib/grid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((p, i, a) => (i === 0 || i === a.length - 1 ? p[0] : ""))
    .join("")
    .toUpperCase()

// every student of the class on every grid. teachers click an initial to open the student
export default function Heatmap({ classId, linkStudents = true }: { classId: number; linkStudents?: boolean }) {
  const { t } = useT()
  const q = useQuery({ queryKey: ["heatmap", classId], queryFn: () => classes.heatmap(classId) })
  const data: HeatmapData = q.data ?? []
  if (q.isPending) return <BoardSkeleton />
  if (q.isSuccess && data.length === 0) return <p className="text-muted-foreground text-sm">{t.klass.gridsHint}</p>
  return (
    <div className="space-y-3">
    <div className="grid gap-4 lg:grid-cols-2">
      {data.map(({ grid, placements }) => (
        <Card key={grid.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{grid.name}</CardTitle>
            <CardDescription>{placements.length} {t.dash.students.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center overflow-x-auto">
            <NineBoxGrid
              size="lg"
              render={(x, y) => {
                const here = placements.filter((p) => p.x === x && p.y === y)
                return (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] leading-none opacity-80">{t.cells[`${x},${y}`]}</span>
                    <div className="flex max-w-[7.5rem] flex-wrap justify-center gap-0.5">
                      {here.map((p) =>
                        linkStudents ? (
                          <Link
                            key={p.id}
                            href={`/students/${p.student.id}?grid=${grid.id}`}
                            title={`${p.student.name} · ${t.dash.level(p.level)}`}
                            className="bg-background/90 text-foreground hover:bg-background relative flex size-6 items-center justify-center rounded-full text-[10px] font-semibold shadow"
                          >
                            {initials(p.student.name)}
                            {p.level > 0 && <span className="bg-foreground text-background absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full text-[8px]">{p.level}</span>}
                          </Link>
                        ) : (
                          <span key={p.id} title={p.student.name} className="bg-background/90 text-foreground flex size-6 items-center justify-center rounded-full text-[10px] font-semibold shadow">
                            {initials(p.student.name)}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )
              }}
            />
          </CardContent>
        </Card>
      ))}
    </div>
    <Legend />
    </div>
  )
}

function Legend() {
  const { t } = useT()
  return (
    <details className="text-muted-foreground text-xs">
      <summary className="cursor-pointer select-none">{t.legend}</summary>
      <ul className="mt-2 grid gap-1 sm:grid-cols-3">
        {[...CELLS].reverse().map(([x, y]) => (
          <li key={`${x}-${y}`} className="flex items-center gap-2">
            <span className={`inline-block size-3 rounded-sm ${cellTone(x, y)}`} />
            <span>{t.cells[`${x},${y}`]}</span>
            <span className="opacity-60">· {t.axis.x} {x}, {t.axis.y} {y}</span>
          </li>
        ))}
      </ul>
    </details>
  )
}
