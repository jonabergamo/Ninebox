"use client"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Copy } from "lucide-react"
import { toast } from "sonner"
import AppShell, { JoinDialog } from "@/components/app-shell"
import Landing from "@/components/landing"
import Heatmap from "@/components/heatmap"
import NineBoxGrid from "@/components/nine-box-grid"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { activities, placements, submissions } from "@/lib/api"
import { ListSkeleton, StatsSkeleton } from "@/components/skeletons"
import { useAuth } from "@/lib/auth"
import { useClassroom } from "@/lib/classroom"
import { useT } from "@/lib/i18n"

export default function Home() {
  const { user } = useAuth()
  if (user === null) return <Landing />
  return <AppShell>{user?.role === "teacher" ? <TeacherHome /> : <StudentHome />}</AppShell>
}

function TeacherHome() {
  const { t } = useT()
  const { current, loading } = useClassroom()
  const acts = useQuery({ queryKey: ["activities", current?.id], queryFn: () => activities.list(current!.id), enabled: !!current })
  if (!current) return loading ? <StatsSkeleton /> : <p className="text-muted-foreground">{t.dash.empty}</p>
  const toGrade = (acts.data ?? []).reduce((n, a) => n + (a.submitted - a.graded), 0)
  const copy = () => {
    navigator.clipboard.writeText(current.code)
    toast.success(t.dash.copied)
  }
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{current.name}</h1>
        <Link href={`/classes/${current.id}`} className="text-sm font-medium underline-offset-4 hover:underline">
          {t.klass.open} →
        </Link>
      </div>
      {acts.isPending ? <StatsSkeleton /> : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat title={t.dash.students} value={current.students_count} />
        <Stat title={t.dash.activities} value={acts.data?.length} />
        <Stat title={t.dash.toGrade} value={toGrade} tone={toGrade > 0 ? "text-amber-600" : undefined} />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t.dash.code}</CardTitle>
            <CardDescription>{t.dash.codeHint}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <span className="font-mono text-2xl tracking-[0.2em]">{current.code}</span>
            <Button size="icon" variant="ghost" onClick={copy} aria-label={t.common.copy}>
              <Copy className="size-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
      )}
      <div>
        <h2 className="mb-1 text-lg font-semibold">{t.dash.heatmap}</h2>
        <p className="text-muted-foreground mb-3 text-sm">{t.dash.heatmapHint}</p>
        <Heatmap classId={current.id} />
      </div>
      <div>
        <h2 className="mb-3 text-lg font-semibold">{t.dash.recent}</h2>
        {acts.isPending && <ListSkeleton rows={4} />}
        <ul className="grid gap-2 md:grid-cols-2">
          {(acts.data ?? []).slice(0, 4).map((a) => (
            <li key={a.id}>
              <Link href={`/activities/${a.id}`} className="bg-card hover:bg-muted/60 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm">
                <span className="truncate font-medium">{a.name}</span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {a.graded}/{a.submitted} {t.activity.gradedCount} · {t.dash.level(a.level)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {acts.isSuccess && acts.data.length === 0 && <p className="text-muted-foreground text-sm">{t.activity.none}</p>}
      </div>
    </>
  )
}

function StudentHome() {
  const { t, locale } = useT()
  const { current, list, loading } = useClassroom()
  const mine = useQuery({ queryKey: ["placements", "mine"], queryFn: () => placements.list() })
  const subs = useQuery({ queryKey: ["submissions", current?.id], queryFn: () => submissions.mine(current!.id), enabled: !!current })

  if (loading || (current && (mine.isPending || subs.isPending))) {
    return (
      <>
        <StatsSkeleton n={2} />
        <ListSkeleton rows={2} />
      </>
    )
  }
  if (list.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed p-8">
        <p className="text-muted-foreground">{t.dash.studentEmpty}</p>
        <JoinDialog big />
      </div>
    )
  }
  const pending = (subs.data ?? []).filter((s) => !s.graded_at)
  const gridsHere = (mine.data ?? []).filter((p) => p.classroom === current?.id)
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">{current?.name}</h1>
      <div>
        <h2 className="mb-3 text-lg font-semibold">{t.dash.yourGrids}</h2>
        <div className="flex flex-wrap gap-6">
          {gridsHere.map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{p.grid_name}</CardTitle>
                <CardDescription>
                  {t.dash.level(p.level)} · {t.cells[`${p.x},${p.y}`]}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-3">
                <NineBoxGrid x={p.x} y={p.y} />
                <Link href={`/me?grid=${p.grid}`} className="text-sm font-medium underline-offset-4 hover:underline">{t.progression}</Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-lg font-semibold">{t.dash.pending}</h2>
        {pending.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t.dash.nothingPending}</p>
        ) : (
          <ul className="grid gap-2 md:grid-cols-2">
            {pending.map((s) => (
              <li key={s.id}>
                <Link href={`/activities/${s.activity}`} className="bg-card hover:bg-muted/60 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm">
                  <span className="truncate font-medium">{s.activity_name}</span>
                  <span className="flex items-center gap-2">
                    {s.due_at && <span className="text-muted-foreground text-xs">{t.activity.due_in} {new Date(s.due_at).toLocaleDateString(locale === "pt" ? "pt-BR" : "en-US")}</span>}
                    <Badge variant={s.submitted_at ? "secondary" : "outline"}>{s.submitted_at ? t.activity.status.submitted : t.activity.status.pending}</Badge>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

function Stat({ title, value, tone }: { title: string; value?: number; tone?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <span className={`text-4xl font-semibold ${tone ?? ""}`}>{value ?? "–"}</span>
      </CardContent>
    </Card>
  )
}
