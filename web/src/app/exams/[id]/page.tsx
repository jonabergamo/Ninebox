"use client"
import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, CheckCircle2, Radio, Trash2, Users, XCircle } from "lucide-react"
import { toast } from "sonner"
import AppShell from "@/components/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { exams, Exam } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { useT, intlTag } from "@/lib/i18n"
import { clock, useExamSocket } from "@/lib/ws"
import { cn } from "@/lib/utils"

export default function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  return <AppShell>{user?.role === "teacher" ? <Lobby id={Number(id)} /> : <Room id={Number(id)} />}</AppShell>
}

function Countdown({ seconds, status }: { seconds: number | null; status: Exam["status"] }) {
  const { t } = useT()
  if (status === "closed") return <span className="text-muted-foreground font-mono text-5xl">{t.exam.closed}</span>
  if (seconds == null) return <span className="text-muted-foreground font-mono text-5xl">--:--</span>
  return <span className={cn("font-mono text-6xl font-semibold tabular-nums", seconds <= 60 && "text-destructive")}>{clock(seconds)}</span>
}

function Header({ exam, backHref = "/exams" }: { exam: Exam; backHref?: string }) {
  const { t } = useT()
  return (
    <div className="space-y-1">
      <Link href={backHref} className="text-muted-foreground inline-flex items-center gap-1 text-sm hover:underline">
        <ArrowLeft className="size-3.5" /> {t.common.back}
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{exam.title}</h1>
        <Badge variant="secondary">{t.dash.level(exam.level)}</Badge>
        <Badge variant="outline">{t.exam.minutes(exam.duration_minutes)}</Badge>
      </div>
      {exam.instructions && <p className="text-muted-foreground max-w-2xl text-sm">{exam.instructions}</p>}
    </div>
  )
}

// the teacher's side. a big clock, who is in, who handed in, open and close
function Lobby({ id }: { id: number }) {
  const { t, locale } = useT()
  const qc = useQueryClient()
  const router = useRouter()
  const q = useQuery({ queryKey: ["exam", id], queryFn: () => exams.one(id) })
  const { live, remaining, online } = useExamSocket(id, (e) => {
    if (e.joined) toast(t.exam.joined(e.joined))
    if (e.submitted_by) toast.success(t.exam.submittedBy(e.submitted_by))
    if (e.status !== q.data?.status) qc.invalidateQueries({ queryKey: ["exam", id] })
  })
  const status = live?.status ?? q.data?.status ?? "draft"
  const results = useQuery({ queryKey: ["results", id], queryFn: () => exams.results(id), enabled: status === "closed" })
  const after = { onSuccess: () => qc.invalidateQueries({ queryKey: ["exam", id] }), onError: () => toast.error(t.common.failed) }
  const open = useMutation({ mutationFn: () => exams.open(id), ...after })
  const close = useMutation({ mutationFn: () => exams.close(id), ...after })
  const reopen = useMutation({
    mutationFn: () => exams.reopen(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exam", id] })
      qc.invalidateQueries({ queryKey: ["heatmap"] })
      qc.invalidateQueries({ queryKey: ["placements"] })
      toast.success(t.exam.reopened)
    },
    onError: () => toast.error(t.common.failed),
  })
  const remove = useMutation({
    mutationFn: () => exams.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exams"] })
      toast.success(t.exam.removed)
      router.replace("/exams")
    },
  })
  if (!q.data) return null
  const exam = q.data
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Header exam={exam} />
        {status === "draft" && (
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => confirm(t.exam.remove + "?") && remove.mutate()}>
            <Trash2 className="size-4" /> {t.exam.remove}
          </Button>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Radio className={cn("size-4", online ? "text-emerald-500" : "text-muted-foreground")} />
              {online ? t.exam.live : t.exam.offline} · {t.exam.status[status]}
            </CardTitle>
            <CardDescription>{status === "draft" ? t.exam.openHint : exam.ends_at && new Date(exam.ends_at).toLocaleTimeString(intlTag[locale])}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 py-8">
            <Countdown seconds={remaining} status={status} />
            <div className="text-muted-foreground flex flex-wrap justify-center gap-6 text-sm">
              <span className="flex items-center gap-1"><Users className="size-4" /> {live?.connected ?? 0} {t.exam.connected}</span>
              <span>{live?.started ?? 0} {t.exam.started}</span>
              <span>{live?.submitted ?? 0} {t.exam.submitted}</span>
            </div>
            {status === "draft" && <Button size="lg" onClick={() => open.mutate()} disabled={open.isPending}>{t.exam.open}</Button>}
            {status === "open" && <Button size="lg" variant="destructive" onClick={() => confirm(t.exam.close + "?") && close.mutate()} disabled={close.isPending}>{t.exam.close}</Button>}
            {status === "closed" && (
              <Button size="lg" variant="outline" onClick={() => confirm(t.exam.reopenBody) && reopen.mutate()} disabled={reopen.isPending}>
                {t.exam.reopen}
              </Button>
            )}
          </CardContent>
        </Card>
        <Card className="lg:w-80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t.exam.questions}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {exam.questions.map((qq, i) => (
              <div key={qq.id}>
                <p className="font-medium">{i + 1}. {qq.text} <span className="text-muted-foreground">({qq.points})</span></p>
                <p className="text-muted-foreground text-xs">{qq.choices.find((c) => c.is_correct)?.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      {status === "closed" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t.exam.results}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.dash.students}</TableHead>
                  <TableHead>{t.exam.score}</TableHead>
                  <TableHead>{t.exam.submitted}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(results.data ?? []).map((a) => (
                  <TableRow key={a.id}>
                    <TableCell><Link href={`/students/${a.student.id}`} className="font-medium hover:underline">{a.student.name}</Link></TableCell>
                    <TableCell className="font-mono">{a.score ?? "–"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{a.submitted_at ? new Date(a.submitted_at).toLocaleTimeString(intlTag[locale]) : t.exam.notTaken}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  )
}

// the student's side. waits for the teacher, then questions and a clock, then the score
function Room({ id }: { id: number }) {
  const { t } = useT()
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ["exam", id], queryFn: () => exams.one(id) })
  const { live, remaining } = useExamSocket(id, (e) => {
    if (e.status !== q.data?.status) qc.invalidateQueries({ queryKey: ["exam", id] })
  })
  const exam = q.data
  const status = live?.status ?? exam?.status ?? "draft"
  // what the server has plus what was clicked since, so a click shows before the request returns
  const [local, setLocal] = useState<Record<string, number>>({})
  const answers: Record<string, number> = { ...(exam?.my_attempt?.answers ?? {}), ...local }

  const start = useMutation({ mutationFn: () => exams.start(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["exam", id] }), onError: () => toast.error(t.common.failed) })
  const answer = useMutation({
    mutationFn: ({ qid, cid }: { qid: number; cid: number }) => exams.answer(id, qid, cid),
    onMutate: ({ qid, cid }) => setLocal((a) => ({ ...a, [qid]: cid })),
    onError: () => toast.error(t.common.failed),
  })
  const submit = useMutation({
    mutationFn: () => exams.submit(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exam", id] })
      qc.invalidateQueries({ queryKey: ["placements"] })
      toast.success(t.exam.submittedOk)
    },
    onError: () => toast.error(t.common.failed),
  })
  useEffect(() => {
    if (status === "closed") qc.invalidateQueries({ queryKey: ["exam", id] })
  }, [status, id, qc])

  if (!exam) return null
  const attempt = exam.my_attempt
  const done = !!attempt?.submitted_at || status === "closed"
  const answered = Object.keys(answers).length

  return (
    <>
      <Header exam={exam} />
      {status === "draft" && <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-sm">{t.exam.waiting}</p>}
      {status === "open" && !attempt && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10">
            <Countdown seconds={remaining} status={status} />
            <Button size="lg" onClick={() => start.mutate()} disabled={start.isPending}>{t.exam.enter}</Button>
          </CardContent>
        </Card>
      )}
      {status === "open" && attempt && !attempt.submitted_at && (
        <>
          <div className="bg-card sticky top-14 z-10 flex items-center justify-between rounded-lg border px-4 py-2">
            <span className="text-muted-foreground text-sm">{t.exam.submitHint(answered, exam.questions.length)}</span>
            <span className={cn("font-mono text-2xl tabular-nums", remaining != null && remaining <= 60 && "text-destructive")}>{remaining == null ? "--:--" : clock(remaining)}</span>
          </div>
          <ol className="space-y-3">
            {exam.questions.map((qq, i) => (
              <li key={qq.id} className="bg-card rounded-lg border p-4">
                <p className="mb-3 font-medium">{i + 1}. {qq.text} <span className="text-muted-foreground text-xs">({qq.points} {t.exam.points.toLowerCase()})</span></p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {qq.choices.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => answer.mutate({ qid: qq.id, cid: c.id })}
                      className={cn("rounded-md border px-3 py-2 text-left text-sm", answers[qq.id] === c.id ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted")}
                    >
                      {c.text}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          <div className="flex justify-end">
            <Button size="lg" onClick={() => confirm(t.exam.submit + "?") && submit.mutate()} disabled={submit.isPending}>{t.exam.submit}</Button>
          </div>
        </>
      )}
      {done && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{status === "closed" ? t.exam.over : t.exam.submittedOk}</CardTitle>
            {attempt?.score != null && <CardDescription>{t.exam.yourScore}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-4">
            {attempt?.score != null ? <p className="font-mono text-5xl font-semibold">{attempt.score}</p> : <p className="text-muted-foreground text-sm">{t.exam.notTaken}</p>}
            {status === "closed" && attempt && (
              <ol className="space-y-2 text-sm">
                {exam.questions.map((qq, i) => {
                  const picked = attempt.answers[String(qq.id)]
                  const right = qq.choices.find((c) => c.is_correct)
                  const ok = picked != null && picked === right?.id
                  return (
                    <li key={qq.id} className="flex items-start gap-2 rounded-md border p-2">
                      {picked == null ? <span className="text-muted-foreground mt-0.5 size-4">–</span> : ok ? <CheckCircle2 className="mt-0.5 size-4 text-emerald-600" /> : <XCircle className="text-destructive mt-0.5 size-4" />}
                      <div>
                        <p className="font-medium">{i + 1}. {qq.text}</p>
                        <p className="text-muted-foreground text-xs">
                          {picked == null ? t.exam.skipped : ok ? t.exam.correct : `${t.exam.wrong} · ${right?.text}`}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </CardContent>
        </Card>
      )}
    </>
  )
}
