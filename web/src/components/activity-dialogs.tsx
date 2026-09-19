"use client"
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { activities, grids, subjects, submissions, ActivityInput, Letter, Submission, Activity } from "@/lib/api"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const LETTERS: Letter[] = ["E", "G", "A", "P"]

export function NewActivityDialog({ classId }: { classId: number }) {
  const { t } = useT()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const subj = useQuery({ queryKey: ["subjects", classId], queryFn: () => subjects.list(classId), enabled: open })
  const grd = useQuery({ queryKey: ["grids", classId], queryFn: () => grids.list(classId), enabled: open })
  const blank = (): ActivityInput => ({
    classroom: classId,
    name: "",
    description: "",
    level: 0,
    due_at: null,
    subjects: [],
    grids: [],
    criteria: [{ description: "", weight: 1 }],
  })
  const [form, setForm] = useState<ActivityInput>(blank)

  const create = useMutation({
    mutationFn: () => activities.create({ ...form, criteria: form.criteria.filter((c) => c.description.trim()) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activities", classId] })
      toast.success(t.activity.created)
      setOpen(false)
      setForm(blank())
    },
    onError: () => toast.error(t.common.failed),
  })

  const toggle = (key: "subjects" | "grids", id: number) =>
    setForm((f) => ({ ...f, [key]: f[key].includes(id) ? f[key].filter((x) => x !== id) : [...f[key], id] }))
  const ok = form.name.trim() && form.grids.length > 0 && form.criteria.some((c) => c.description.trim())

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" /> {t.activity.new}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t.activity.new}</DialogTitle>
          <DialogDescription>{t.activity.levelHint}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (ok) create.mutate()
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="a-name">{t.activity.name}</Label>
            <Input id="a-name" autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="a-desc">{t.activity.description}</Label>
            <Textarea id="a-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="a-level">{t.activity.level}</Label>
              <Input id="a-level" type="number" min={0} max={20} value={form.level} onChange={(e) => setForm({ ...form, level: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-due">{t.activity.due}</Label>
              <Input id="a-due" type="date" value={form.due_at?.slice(0, 10) ?? ""} onChange={(e) => setForm({ ...form, due_at: e.target.value ? new Date(e.target.value + "T23:59:00").toISOString() : null })} />
            </div>
          </div>
          <Picker label={t.activity.subjects} items={subj.data ?? []} selected={form.subjects} onToggle={(id) => toggle("subjects", id)} />
          <Picker label={t.activity.grids} items={grd.data ?? []} selected={form.grids} onToggle={(id) => toggle("grids", id)} required />
          <div className="space-y-2">
            <Label>{t.activity.criteria}</Label>
            {form.criteria.map((c, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder={t.activity.criterion}
                  value={c.description}
                  onChange={(e) => setForm({ ...form, criteria: form.criteria.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)) })}
                />
                <Input
                  type="number"
                  min={1}
                  max={10}
                  className="w-20"
                  title={t.activity.weight}
                  value={c.weight}
                  onChange={(e) => setForm({ ...form, criteria: form.criteria.map((x, j) => (j === i ? { ...x, weight: Number(e.target.value) } : x)) })}
                />
                <Button type="button" variant="ghost" size="icon" disabled={form.criteria.length === 1} onClick={() => setForm({ ...form, criteria: form.criteria.filter((_, j) => j !== i) })}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, criteria: [...form.criteria, { description: "", weight: 1 }] })}>
              <Plus className="size-4" /> {t.activity.addCriterion}
            </Button>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t.common.cancel}</Button>
            <Button type="submit" disabled={!ok || create.isPending}>{t.activity.create}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Picker({ label, items, selected, onToggle, required }: { label: string; items: { id: number; name: string }[]; selected: number[]; onToggle: (id: number) => void; required?: boolean }) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && " *"}
      </Label>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={() => onToggle(it.id)}
            className={cn("rounded-full border px-3 py-1 text-xs", selected.includes(it.id) ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted")}
          >
            {it.name}
          </button>
        ))}
        {items.length === 0 && <span className="text-muted-foreground text-xs">–</span>}
      </div>
    </div>
  )
}

// the teacher marks each criterion with a letter and, if they want, a line of feedback
export function GradeDialog({ submission, activity, onDone }: { submission: Submission; activity: Activity; onDone?: () => void }) {
  const { t } = useT()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [marks, setMarks] = useState<Record<number, { grade?: Letter; feedback: string }>>(() =>
    Object.fromEntries(activity.criteria.map((c) => {
      const m = submission.marks.find((x) => x.criterion === c.id)
      return [c.id, { grade: m?.grade, feedback: m?.feedback ?? "" }]
    })),
  )
  const complete = activity.criteria.every((c) => marks[c.id]?.grade)

  const save = useMutation({
    mutationFn: () => submissions.grade(submission.id, activity.criteria.map((c) => ({ criterion_id: c.id, grade: marks[c.id].grade!, feedback: marks[c.id].feedback }))),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ["submissions"] })
      qc.invalidateQueries({ queryKey: ["activities"] })
      qc.invalidateQueries({ queryKey: ["heatmap"] })
      qc.invalidateQueries({ queryKey: ["timeline"] })
      toast.success(t.activity.saved(s.final_grade ?? 0))
      setOpen(false)
      onDone?.()
    },
    onError: () => toast.error(t.common.failed),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant={submission.graded_at ? "outline" : "default"} />}>
        {submission.graded_at ? t.activity.regrade : t.activity.grade}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t.activity.gradeTitle} · {submission.student.name}
          </DialogTitle>
          <DialogDescription>{t.activity.gradeBody}</DialogDescription>
        </DialogHeader>
        {submission.link && (
          <a href={submission.link} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4">
            {t.activity.link}
          </a>
        )}
        <div className="space-y-4">
          {activity.criteria.map((c) => (
            <div key={c.id} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{c.description}</span>
                <span className="text-muted-foreground text-xs">
                  {t.activity.weight} {c.weight}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {LETTERS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setMarks({ ...marks, [c.id]: { ...marks[c.id], grade: l } })}
                    className={cn("rounded-md border py-1.5 text-sm font-semibold", marks[c.id]?.grade === l ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted")}
                    title={t.activity.letters[l]}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <Input placeholder={t.activity.feedback} value={marks[c.id]?.feedback ?? ""} onChange={(e) => setMarks({ ...marks, [c.id]: { ...marks[c.id], feedback: e.target.value } })} />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          {!complete && <span className="text-muted-foreground text-xs">{t.activity.allMarks}</span>}
          <span className="flex-1" />
          <Button variant="ghost" onClick={() => setOpen(false)}>{t.common.cancel}</Button>
          <Button disabled={!complete || save.isPending} onClick={() => save.mutate()}>{t.activity.save}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function HandInDialog({ submission }: { submission: Submission }) {
  const { t } = useT()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [link, setLink] = useState(submission.link)
  const send = useMutation({
    mutationFn: () => submissions.submit(submission.id, link.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions"] })
      toast.success(t.activity.handed)
      setOpen(false)
    },
    onError: () => toast.error(t.common.failed),
  })
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant={submission.submitted_at ? "outline" : "default"} />}>{t.activity.hand}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.activity.handTitle}</DialogTitle>
          <DialogDescription>{t.activity.handBody}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (link.trim()) send.mutate()
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="link">{t.activity.yourLink}</Label>
            <Input id="link" type="url" required autoFocus value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t.common.cancel}</Button>
            <Button type="submit" disabled={send.isPending || !link.trim()}>{t.activity.hand}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
