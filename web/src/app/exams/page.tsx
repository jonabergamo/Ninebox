"use client"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Timer } from "lucide-react"
import AppShell from "@/components/app-shell"
import { NewExamDialog } from "@/components/exam-dialog"
import { Badge } from "@/components/ui/badge"
import { exams } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { useClassroom } from "@/lib/classroom"
import { useT } from "@/lib/i18n"

export default function ExamsPage() {
  const { t } = useT()
  const { user } = useAuth()
  const { current } = useClassroom()
  const q = useQuery({ queryKey: ["exams", current?.id], queryFn: () => exams.list(current!.id), enabled: !!current, refetchInterval: 15_000 })
  const teacher = user?.role === "teacher"
  return (
    <AppShell title={t.exam.title}>
      {!current ? (
        <p className="text-muted-foreground">{teacher ? t.dash.empty : t.dash.studentEmpty}</p>
      ) : (
        <>
          {teacher && (
            <div className="flex justify-end">
              <NewExamDialog classId={current.id} />
            </div>
          )}
          <ul className="grid gap-2 md:grid-cols-2">
            {(q.data ?? []).map((e) => (
              <li key={e.id}>
                <Link href={`/exams/${e.id}`} className="bg-card hover:bg-muted/60 flex flex-col gap-1 rounded-lg border px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{e.title}</span>
                    <Badge variant={e.status === "open" ? "default" : e.status === "closed" ? "secondary" : "outline"} className={e.status === "open" ? "animate-pulse" : ""}>
                      {t.exam.status[e.status]}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Timer className="size-3" /> {t.exam.minutes(e.duration_minutes)} · {t.exam.questionsCount(e.question_count)} · {t.dash.level(e.level)}
                    {e.my_attempt?.score != null && ` · ${t.exam.score} ${e.my_attempt.score}`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {q.isSuccess && q.data.length === 0 && <p className="text-muted-foreground text-sm">{t.exam.none}</p>}
        </>
      )}
    </AppShell>
  )
}
