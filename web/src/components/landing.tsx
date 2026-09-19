"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Code2, GraduationCap, School } from "lucide-react"
import { toast } from "sonner"
import NineBoxGrid from "@/components/nine-box-grid"
import { Logo } from "@/components/logo"
import { LINKS } from "@/components/credit"
import { LangToggle, ThemeToggle } from "@/components/toggles"
import { Button } from "@/components/ui/button"
import { authMessage, useAuth } from "@/lib/auth"
import { useT } from "@/lib/i18n"

const DEMO_PW = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "ninebox123"
// a student's journey, replayed on the landing page
const PATH: [number, number][] = [[2, 1], [3, 1], [2, 2], [3, 2], [2, 3], [3, 3], [2, 1]]

export default function Landing() {
  const { t } = useT()
  const { login } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % PATH.length), 1800)
    return () => clearInterval(id)
  }, [])
  const demo = async (email: string) => {
    setBusy(true)
    try {
      await login(email, DEMO_PW)
      router.replace("/")
    } catch (e) {
      toast.error(authMessage(e, t.auth))
    } finally {
      setBusy(false)
    }
  }
  const [x, y] = PATH[step]
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="flex items-center gap-2 font-semibold"><Logo size={26} /> {t.app}</span>
        <div className="flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
          <Button variant="outline" onClick={() => router.push("/login")}>{t.landing.signIn}</Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-24">
        <section className="grid items-center gap-12 py-12 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div className="space-y-6">
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">{t.landing.kicker}</p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{t.landing.headline}</h1>
            <p className="text-muted-foreground max-w-xl text-lg">{t.landing.sub}</p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" disabled={busy} onClick={() => demo("teacher@ninebox.app")}><School className="size-4" /> {t.auth.demoTeacher}</Button>
              <Button size="lg" variant="outline" disabled={busy} onClick={() => demo("student@ninebox.app")}><GraduationCap className="size-4" /> {t.auth.demoStudent}</Button>
            </div>
            <p className="text-muted-foreground text-sm">{t.auth.demoHint}</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <NineBoxGrid x={x} y={y} size="lg" />
            <p className="text-muted-foreground text-sm">{t.cells[`${x},${y}`]} · {t.dash.level(step === PATH.length - 1 ? 1 : 0)}</p>
          </div>
        </section>
        <section className="py-10">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">{t.landing.how}</h2>
          <ol className="grid gap-4 md:grid-cols-3">
            {t.landing.steps.map(([title, body], i) => (
              <li key={title} className="bg-card rounded-xl border p-5">
                <span className="text-muted-foreground font-mono text-xs">0{i + 1}</span>
                <h3 className="mt-2 font-semibold">{title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{body}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="grid gap-4 py-6 md:grid-cols-2">
          <div className="bg-card rounded-xl border p-6">
            <h3 className="flex items-center gap-2 font-semibold"><School className="size-4" /> {t.landing.teachers}</h3>
            <p className="text-muted-foreground mt-2 text-sm">{t.landing.teachersBody}</p>
          </div>
          <div className="bg-card rounded-xl border p-6">
            <h3 className="flex items-center gap-2 font-semibold"><GraduationCap className="size-4" /> {t.landing.students}</h3>
            <p className="text-muted-foreground mt-2 text-sm">{t.landing.studentsBody}</p>
          </div>
        </section>
        <section className="bg-primary text-primary-foreground mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-8">
          <div>
            <p className="text-xl font-semibold">{t.landing.cta}</p>
            <p className="text-sm opacity-80">{t.credit.body}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={busy} onClick={() => demo("teacher@ninebox.app")}>{t.auth.demoTeacher}</Button>
            <Button variant="secondary" disabled={busy} onClick={() => demo("student@ninebox.app")}>{t.auth.demoStudent}</Button>
          </div>
        </section>
      </main>
      <footer className="text-muted-foreground mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm">
        <a href={LINKS.portfolio} target="_blank" rel="noreferrer" className="hover:text-foreground">{t.credit.by}</a>
        <div className="flex gap-4">
          <a href={LINKS.repo} target="_blank" rel="noreferrer" className="hover:text-foreground flex items-center gap-1"><Code2 className="size-4" /> {t.landing.code}</a>
          <Link href="/register" className="hover:text-foreground">{t.auth.register}</Link>
        </div>
      </footer>
    </div>
  )
}
