"use client"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import AppShell from "@/components/app-shell"
import { NewActivityDialog } from "@/components/activity-dialogs"
import { Badge } from "@/components/ui/badge"
import { ListSkeleton } from "@/components/skeletons"
import { activities, submissions } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { useClassroom } from "@/lib/classroom"
import { useT, intlTag } from "@/lib/i18n"

export default function ActivitiesPage() {
  const { user } = useAuth()
  const { t } = useT()
  return <AppShell title={t.nav.activities}>{user?.role === "teacher" ? <TeacherList /> : <StudentList />}</AppShell>
}

function TeacherList() {
  const { t, locale } = useT()
  const { current } = useClassroom()
  const q = useQuery({ queryKey: ["activities", current?.id], queryFn: () => activities.list(current!.id), enabled: !!current })
  if (!current) return <p className="text-muted-foreground">{t.dash.empty}</p>
  return (
    <>
      <div className="flex justify-end">
        <NewActivityDialog classId={current.id} />
      </div>
      {q.isPending && <ListSkeleton rows={6} />}
      <ul className="grid gap-2 md:grid-cols-2">
        {(q.data ?? []).map((a) => (
          <li key={a.id}>
            <Link href={`/activities/${a.id}`} className="bg-card hover:bg-muted/60 flex flex-col gap-1 rounded-lg border px-4 py-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{a.name}</span>
                <Badge variant="secondary">{t.dash.level(a.level)}</Badge>
              </div>
              <span className="text-muted-foreground text-xs">
                {a.submitted} {t.activity.submitted} · {a.graded} {t.activity.gradedCount}
                {a.due_at && ` · ${t.activity.due_in} ${new Date(a.due_at).toLocaleDateString(intlTag[locale])}`}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {q.isSuccess && q.data.length === 0 && <p className="text-muted-foreground text-sm">{t.activity.none}</p>}
    </>
  )
}

function StudentList() {
  const { t, locale } = useT()
  const { current } = useClassroom()
  const q = useQuery({ queryKey: ["submissions", current?.id], queryFn: () => submissions.mine(current!.id), enabled: !!current })
  if (!current) return <p className="text-muted-foreground">{t.dash.studentEmpty}</p>
  if (q.isPending) return <ListSkeleton rows={6} />
  return (
    <ul className="grid gap-2 md:grid-cols-2">
      {(q.data ?? []).map((s) => {
        const st = s.graded_at ? "graded" : s.submitted_at ? "submitted" : "pending"
        return (
          <li key={s.id}>
            <Link href={`/activities/${s.activity}`} className="bg-card hover:bg-muted/60 flex flex-col gap-1 rounded-lg border px-4 py-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">{s.activity_name}</span>
                <Badge variant={st === "graded" ? "default" : st === "submitted" ? "secondary" : "outline"}>{t.activity.status[st]}</Badge>
              </div>
              <span className="text-muted-foreground text-xs">
                {t.dash.level(s.activity_level)}
                {s.final_grade != null && ` · ${t.activity.final} ${s.final_grade}`}
                {s.due_at && ` · ${t.activity.due_in} ${new Date(s.due_at).toLocaleDateString(intlTag[locale])}`}
              </span>
            </Link>
          </li>
        )
      })}
      {q.isSuccess && q.data.length === 0 && <p className="text-muted-foreground text-sm">{t.activity.none}</p>}
    </ul>
  )
}
