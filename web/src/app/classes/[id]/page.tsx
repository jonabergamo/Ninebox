"use client"
import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Download, Trash2 } from "lucide-react"
import { toast } from "sonner"
import AppShell from "@/components/app-shell"
import Heatmap from "@/components/heatmap"
import { NewActivityDialog } from "@/components/activity-dialogs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ListSkeleton } from "@/components/skeletons"
import { classes, grids, subjects, activities } from "@/lib/api"
import { useClassroom } from "@/lib/classroom"
import { useT } from "@/lib/i18n"

export default function ClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const classId = Number(id)
  const { t } = useT()
  const { list } = useClassroom()
  const klass = list.find((c) => c.id === classId)
  return (
    <AppShell title={klass?.name}>
      <Tabs defaultValue="heatmap">
        <TabsList className="flex-wrap">
          {(Object.keys(t.klass.tabs) as (keyof typeof t.klass.tabs)[]).map((k) => (
            <TabsTrigger key={k} value={k}>
              {t.klass.tabs[k]}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="heatmap" className="pt-4">
          <Heatmap classId={classId} />
        </TabsContent>
        <TabsContent value="students" className="pt-4">
          <Students classId={classId} />
        </TabsContent>
        <TabsContent value="activities" className="pt-4">
          <Activities classId={classId} />
        </TabsContent>
        <TabsContent value="setup" className="grid gap-4 pt-4 md:grid-cols-2">
          <ListEditor kind="subjects" classId={classId} />
          <ListEditor kind="grids" classId={classId} />
        </TabsContent>
        <TabsContent value="export" className="pt-4">
          <Export classId={classId} name={klass?.name ?? "class"} />
        </TabsContent>
      </Tabs>
    </AppShell>
  )
}

function Students({ classId }: { classId: number }) {
  const { t } = useT()
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ["students", classId], queryFn: () => classes.students(classId) })
  const remove = useMutation({
    mutationFn: (sid: number) => classes.removeStudent(classId, sid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students", classId] })
      qc.invalidateQueries({ queryKey: ["heatmap", classId] })
      qc.invalidateQueries({ queryKey: ["classes"] })
    },
    onError: () => toast.error(t.common.failed),
  })
  if (q.isPending) return <ListSkeleton rows={9} cols={3} />
  if (q.isSuccess && q.data.length === 0) return <p className="text-muted-foreground text-sm">{t.klass.noStudents}</p>
  return (
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {(q.data ?? []).map((s) => (
        <li key={s.id} className="bg-card flex items-center justify-between gap-2 rounded-lg border px-4 py-3 text-sm">
          <Link href={`/students/${s.id}`} className="min-w-0 hover:underline">
            <span className="block truncate font-medium">{s.name}</span>
            <span className="text-muted-foreground block truncate text-xs">{s.email}</span>
          </Link>
          <Button size="icon" variant="ghost" title={t.klass.removeStudent} onClick={() => confirm(t.klass.removeStudent + "?") && remove.mutate(s.id)}>
            <Trash2 className="text-muted-foreground size-4" />
          </Button>
        </li>
      ))}
    </ul>
  )
}

function Activities({ classId }: { classId: number }) {
  const { t } = useT()
  const q = useQuery({ queryKey: ["activities", classId], queryFn: () => activities.list(classId) })
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <NewActivityDialog classId={classId} />
      </div>
      {q.isPending && <ListSkeleton rows={6} />}
      <ul className="grid gap-2 md:grid-cols-2">
        {(q.data ?? []).map((a) => (
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
      {q.isSuccess && q.data.length === 0 && <p className="text-muted-foreground text-sm">{t.activity.none}</p>}
    </div>
  )
}

function ListEditor({ kind, classId }: { kind: "subjects" | "grids"; classId: number }) {
  const { t } = useT()
  const qc = useQueryClient()
  const svc = kind === "subjects" ? subjects : grids
  const [name, setName] = useState("")
  const q = useQuery({ queryKey: [kind, classId], queryFn: () => svc.list(classId) })
  const refresh = () => {
    qc.invalidateQueries({ queryKey: [kind, classId] })
    qc.invalidateQueries({ queryKey: ["heatmap", classId] })
  }
  const add = useMutation({ mutationFn: () => svc.create(classId, name.trim()), onSuccess: () => { refresh(); setName("") }, onError: () => toast.error(t.common.failed) })
  const del = useMutation({ mutationFn: (id: number) => svc.remove(id), onSuccess: refresh, onError: () => toast.error(t.common.failed) })
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t.klass[kind]}</CardTitle>
        {kind === "grids" && <CardDescription>{t.klass.gridsHint}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (name.trim()) add.mutate()
          }}
        >
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={kind === "subjects" ? t.klass.subjectName : t.klass.gridName} maxLength={100} />
          <Button type="submit" disabled={!name.trim() || add.isPending}>{t.klass.add}</Button>
        </form>
        <ul className="divide-y rounded-md border">
          {(q.data ?? []).map((it) => (
            <li key={it.id} className="flex items-center justify-between px-3 py-2 text-sm">
              {it.name}
              <Button size="icon" variant="ghost" className="size-7" onClick={() => confirm(t.common.delete + "?") && del.mutate(it.id)}>
                <Trash2 className="text-muted-foreground size-3.5" />
              </Button>
            </li>
          ))}
          {q.isSuccess && q.data.length === 0 && <li className="text-muted-foreground px-3 py-2 text-sm">{t.common.none}</li>}
        </ul>
      </CardContent>
    </Card>
  )
}

function Export({ classId, name }: { classId: number; name: string }) {
  const { t } = useT()
  const qc = useQueryClient()
  const router = useRouter()
  const { select, list } = useClassroom()
  const download = async () => {
    const csv = await classes.csv(classId)
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    a.download = `${name}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const remove = useMutation({
    mutationFn: () => classes.remove(classId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["classes"] })
      const other = list.find((c) => c.id !== classId)
      if (other) select(other.id)
      toast.success(t.klass.removed)
      router.replace("/")
    },
    onError: () => toast.error(t.common.failed),
  })
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t.klass.export}</CardTitle>
          <CardDescription>{t.klass.exportHint}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={download}>
            <Download className="size-4" /> CSV
          </Button>
        </CardContent>
      </Card>
      <Card className="border-destructive/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t.klass.remove}</CardTitle>
          <CardDescription>{t.klass.removeBody}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => confirm(t.klass.remove + "?") && remove.mutate()}>
            <Trash2 className="size-4" /> {t.klass.remove}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
