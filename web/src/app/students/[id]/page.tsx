"use client"
import { use, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import AppShell from "@/components/app-shell"
import NineBoxGrid from "@/components/nine-box-grid"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { placements } from "@/lib/api"
import { useT, intlTag } from "@/lib/i18n"

export default function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <AppShell>
      <Timeline studentId={Number(id)} />
    </AppShell>
  )
}

// where the student is on each grid, and how they got there
export function Timeline({ studentId, backHref = "/students" }: { studentId: number; backHref?: string }) {
  const { t, locale } = useT()
  const search = useSearchParams()
  const mine = useQuery({ queryKey: ["placements", studentId], queryFn: () => placements.list({ student: studentId }) })
  const [chosen, setGridId] = useState<number | null>(Number(search.get("grid")) || null)
  const gridId = chosen ?? mine.data?.[0]?.grid ?? null

  const tl = useQuery({ queryKey: ["timeline", studentId, gridId], queryFn: () => placements.timeline(studentId, gridId!), enabled: !!gridId })
  const student = mine.data?.[0]?.student
  const p = tl.data?.placement
  const history = tl.data?.history ?? []
  const fmt = (d: string) => new Date(d).toLocaleDateString(intlTag[locale], { day: "2-digit", month: "short" })

  return (
    <>
      <div className="space-y-1">
        <Link href={backHref} className="text-muted-foreground inline-flex items-center gap-1 text-sm hover:underline">
          <ArrowLeft className="size-3.5" /> {t.common.back}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{student?.name ?? t.student.title}</h1>
          {mine.data && mine.data.length > 1 && (
            <select value={gridId ?? ""} onChange={(e) => setGridId(Number(e.target.value))} className="bg-background h-9 rounded-md border px-2 text-sm" aria-label={t.student.pickGrid}>
              {mine.data.map((pl) => (
                <option key={pl.grid} value={pl.grid}>
                  {pl.grid_name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{p?.grid_name ?? "–"}</CardTitle>
            <CardDescription>
              {p ? `${t.dash.level(p.level)} · ${t.cells[`${p.x},${p.y}`]}` : "–"}
              {p && p.fail_streak > 0 && <Badge variant="outline" className="ml-2">{t.student.streak(p.fail_streak)}</Badge>}
            </CardDescription>
          </CardHeader>
          <CardContent>{p && <NineBoxGrid x={p.x} y={p.y} size="lg" />}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t.student.grades}</CardTitle>
            <CardDescription>{t.student.timelineHint}</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {history.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t.student.noHistory}</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history.map((h) => ({ ...h, label: fmt(h.at) }))} margin={{ left: -20, right: 10, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                    labelFormatter={(_, pl) => (pl?.[0]?.payload as { activity?: string })?.activity ?? ""}
                    formatter={(v) => [String(v), t.activity.final]}
                  />
                  <Line type="monotone" dataKey="grade" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {history.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">{t.student.timeline}</h2>
          <ol className="flex gap-3 overflow-x-auto pb-2">
            {history.map((h, i) => (
              <li key={i} className="bg-card flex shrink-0 flex-col items-center gap-1 rounded-lg border p-3 text-center">
                <NineBoxGrid x={h.x} y={h.y} size="sm" labels={false} />
                <span className="max-w-28 truncate text-xs font-medium" title={h.activity}>{h.activity}</span>
                <span className="text-muted-foreground text-[11px]">
                  {fmt(h.at)} · {h.grade} · {t.dash.level(h.level)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </>
  )
}
