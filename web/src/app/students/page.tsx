"use client"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import AppShell from "@/components/app-shell"
import { classes } from "@/lib/api"
import { useClassroom } from "@/lib/classroom"
import { useT } from "@/lib/i18n"

export default function StudentsPage() {
  const { t } = useT()
  const { current } = useClassroom()
  const q = useQuery({ queryKey: ["students", current?.id], queryFn: () => classes.students(current!.id), enabled: !!current })
  return (
    <AppShell title={t.nav.students}>
      {!current ? (
        <p className="text-muted-foreground">{t.dash.empty}</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(q.data ?? []).map((s) => (
            <li key={s.id}>
              <Link href={`/students/${s.id}`} className="bg-card hover:bg-muted/60 flex flex-col rounded-lg border px-4 py-3 text-sm">
                <span className="font-medium">{s.name}</span>
                <span className="text-muted-foreground text-xs">{s.email}</span>
              </Link>
            </li>
          ))}
          {q.isSuccess && q.data.length === 0 && <p className="text-muted-foreground text-sm">{t.klass.noStudents}</p>}
        </ul>
      )}
    </AppShell>
  )
}
