"use client"
import { use } from "react"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react"
import { toast } from "sonner"
import AppShell from "@/components/app-shell"
import { GradeDialog, HandInDialog, NewActivityDialog } from "@/components/activity-dialogs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TableSkeleton } from "@/components/skeletons"
import { activities, submissions, Submission } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { useT, intlTag } from "@/lib/i18n"

export default function ActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  return <AppShell>{user?.role === "teacher" ? <TeacherView id={Number(id)} /> : <StudentView id={Number(id)} />}</AppShell>
}

function statusOf(s: Submission) {
  return s.graded_at ? "graded" : s.submitted_at ? "submitted" : "pending"
}

function Header({ id }: { id: number }) {
  const { t, locale } = useT()
  const act = useQuery({ queryKey: ["activity", id], queryFn: () => activities.one(id) })
  const a = act.data
  if (!a) return null
  return (
    <div className="space-y-1">
      <Link href="/activities" className="text-muted-foreground inline-flex items-center gap-1 text-sm hover:underline">
        <ArrowLeft className="size-3.5" /> {t.common.back}
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{a.name}</h1>
        <Badge variant="secondary">{t.dash.level(a.level)}</Badge>
        {a.due_at && <span className="text-muted-foreground text-sm">{t.activity.due_in} {new Date(a.due_at).toLocaleDateString(intlTag[locale])}</span>}
      </div>
      {a.description && <p className="text-muted-foreground max-w-2xl text-sm">{a.description}</p>}
      <p className="text-muted-foreground text-xs">
        {t.activity.criteria}: {a.criteria.map((c) => `${c.description} (${c.weight})`).join(" · ")}
      </p>
    </div>
  )
}

function TeacherView({ id }: { id: number }) {
  const { t } = useT()
  const qc = useQueryClient()
  const router = useRouter()
  const act = useQuery({ queryKey: ["activity", id], queryFn: () => activities.one(id) })
  const subs = useQuery({ queryKey: ["submissions", "activity", id], queryFn: () => activities.submissions(id) })
  const remove = useMutation({
    mutationFn: () => activities.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activities"] })
      toast.success(t.activity.removed)
      router.replace("/activities")
    },
    onError: () => toast.error(t.common.failed),
  })
  const badge = (s: Submission) => {
    const st = statusOf(s)
    return <Badge variant={st === "graded" ? "default" : st === "submitted" ? "secondary" : "outline"}>{t.activity.status[st]}</Badge>
  }
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Header id={id} />
        <div className="flex gap-1">
          {act.data && <NewActivityDialog classId={act.data.classroom} activity={act.data} />}
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => confirm(t.activity.remove + "?") && remove.mutate()}>
            <Trash2 className="size-4" /> {t.activity.remove}
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t.activity.submissions}</CardTitle>
          <CardDescription>
            {subs.data?.filter((s) => s.submitted_at).length ?? 0} {t.activity.submitted} · {subs.data?.filter((s) => s.graded_at).length ?? 0} {t.activity.gradedCount}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {subs.isPending ? <TableSkeleton /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.dash.students}</TableHead>
                <TableHead>{t.activity.status.pending.split(" ")[0] === "Not" ? "Status" : "Status"}</TableHead>
                <TableHead>{t.activity.final}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(subs.data ?? []).map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link href={`/students/${s.student.id}`} className="font-medium hover:underline">{s.student.name}</Link>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    {badge(s)}
                    {s.link && (
                      <a href={s.link} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground" title={t.activity.link}>
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="font-mono">{s.final_grade ?? "–"}</TableCell>
                  <TableCell className="text-right">
                    {act.data && s.submitted_at && (
                      <GradeDialog
                        submission={s}
                        activity={act.data}
                        onNext={() => (subs.data ?? []).find((x) => x.id !== s.id && x.submitted_at && !x.graded_at)}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function StudentView({ id }: { id: number }) {
  const { t, locale } = useT()
  const act = useQuery({ queryKey: ["activity", id], queryFn: () => activities.one(id) })
  const subs = useQuery({ queryKey: ["submissions", "mine-all"], queryFn: () => submissions.mine() })
  const s = subs.data?.find((x) => x.activity === id)
  if (!act.data || !s) return <Header id={id} />
  const st = statusOf(s)
  return (
    <>
      <Header id={id} />
      <Card className="max-w-xl">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base">
            {t.activity.status[st]}
            {!s.graded_at && <HandInDialog submission={s} />}
          </CardTitle>
          {s.submitted_at && <CardDescription>{t.activity.handed} {new Date(s.submitted_at).toLocaleString(intlTag[locale])}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {s.link && (
            <a href={s.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline underline-offset-4">
              <ExternalLink className="size-3.5" /> {t.activity.link}
            </a>
          )}
          {s.graded_at && (
            <>
              <p>
                {t.activity.final}: <span className="font-mono text-2xl font-semibold">{s.final_grade}</span>
              </p>
              <ul className="space-y-2">
                {s.marks.map((m) => {
                  const c = act.data!.criteria.find((x) => x.id === m.criterion)
                  return (
                    <li key={m.criterion} className="rounded-md border p-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{c?.description}</span>
                        <Badge variant="secondary">{m.grade} · {t.activity.letters[m.grade]}</Badge>
                      </div>
                      {m.feedback && <p className="text-muted-foreground mt-1">{m.feedback}</p>}
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}
