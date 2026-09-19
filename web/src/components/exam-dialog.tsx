"use client"
import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Circle, CircleCheck, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { exams, grids, ExamInput } from "@/lib/api"
import { useT } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const blankQ = () => ({ text: "", points: 1, choices: [{ text: "", is_correct: true }, { text: "", is_correct: false }] })

export function NewExamDialog({ classId }: { classId: number }) {
  const { t } = useT()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const grd = useQuery({ queryKey: ["grids", classId], queryFn: () => grids.list(classId), enabled: open })
  const blank = (): ExamInput => ({ classroom: classId, title: "", instructions: "", duration_minutes: 20, level: 1, grids: [], questions: [blankQ()] })
  const [form, setForm] = useState<ExamInput>(blank)

  const create = useMutation({
    mutationFn: () => exams.create({ ...form, questions: form.questions.map((q) => ({ ...q, choices: q.choices.filter((c) => c.text.trim()) })) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exams", classId] })
      toast.success(t.exam.created)
      setOpen(false)
      setForm(blank())
    },
    onError: () => toast.error(t.common.failed),
  })

  const setQ = (i: number, patch: Partial<ExamInput["questions"][number]>) =>
    setForm({ ...form, questions: form.questions.map((q, j) => (j === i ? { ...q, ...patch } : q)) })
  const ok =
    form.title.trim() &&
    form.grids.length > 0 &&
    form.questions.every((q) => q.text.trim() && q.choices.filter((c) => c.text.trim()).length >= 2 && q.choices.some((c) => c.is_correct && c.text.trim()))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" /> {t.exam.new}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.exam.new}</DialogTitle>
          <DialogDescription>{t.exam.correctHint}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            if (ok) create.mutate()
          }}
        >
          <div className="grid gap-3 sm:grid-cols-[1fr_120px_120px]">
            <div className="space-y-2">
              <Label htmlFor="e-title">{t.exam.name}</Label>
              <Input id="e-title" autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={140} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-dur">{t.exam.duration}</Label>
              <Input id="e-dur" type="number" min={1} max={240} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-level">{t.exam.level}</Label>
              <Input id="e-level" type="number" min={0} max={20} value={form.level} onChange={(e) => setForm({ ...form, level: Number(e.target.value) })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-instr">{t.exam.instructions}</Label>
            <Textarea id="e-instr" rows={2} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t.exam.grids} *</Label>
            <div className="flex flex-wrap gap-1.5">
              {(grd.data ?? []).map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setForm({ ...form, grids: form.grids.includes(g.id) ? form.grids.filter((x) => x !== g.id) : [...form.grids, g.id] })}
                  className={cn("rounded-full border px-3 py-1 text-xs", form.grids.includes(g.id) ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted")}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Label>{t.exam.questions}</Label>
            {form.questions.map((q, i) => (
              <div key={i} className="space-y-2 rounded-lg border p-3">
                <div className="flex gap-2">
                  <Input placeholder={`${t.exam.question} ${i + 1}`} value={q.text} onChange={(e) => setQ(i, { text: e.target.value })} />
                  <Input type="number" min={1} max={10} className="w-20" title={t.exam.points} value={q.points} onChange={(e) => setQ(i, { points: Number(e.target.value) })} />
                  <Button type="button" variant="ghost" size="icon" disabled={form.questions.length === 1} onClick={() => setForm({ ...form, questions: form.questions.filter((_, j) => j !== i) })}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                {q.choices.map((c, k) => (
                  <div key={k} className="flex items-center gap-2 pl-2">
                    <button type="button" aria-label={t.exam.correctHint} onClick={() => setQ(i, { choices: q.choices.map((x, m) => ({ ...x, is_correct: m === k })) })}>
                      {c.is_correct ? <CircleCheck className="size-5 text-emerald-600" /> : <Circle className="text-muted-foreground size-5" />}
                    </button>
                    <Input placeholder={`${t.exam.choice} ${k + 1}`} value={c.text} onChange={(e) => setQ(i, { choices: q.choices.map((x, m) => (m === k ? { ...x, text: e.target.value } : x)) })} />
                    <Button type="button" variant="ghost" size="icon" disabled={q.choices.length <= 2} onClick={() => setQ(i, { choices: q.choices.filter((_, m) => m !== k).map((x, m) => (q.choices[k].is_correct && m === 0 ? { ...x, is_correct: true } : x)) })}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="ghost" size="sm" disabled={q.choices.length >= 6} onClick={() => setQ(i, { choices: [...q.choices, { text: "", is_correct: false }] })}>
                  <Plus className="size-3.5" /> {t.exam.addChoice}
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, questions: [...form.questions, blankQ()] })}>
              <Plus className="size-4" /> {t.exam.addQuestion}
            </Button>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t.common.cancel}</Button>
            <Button type="submit" disabled={!ok || create.isPending}>{t.exam.create}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
