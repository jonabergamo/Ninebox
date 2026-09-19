"use client"
import { ReactNode, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Grid3x3, LayoutDashboard, ListChecks, LogOut, Plus, Users } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth"
import { useClassroom } from "@/lib/classroom"
import { useT } from "@/lib/i18n"
import { classes, ApiError } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Credit, DemoBanner } from "./credit"
import { LangToggle, ThemeToggle } from "./toggles"

// wraps every page behind the login. redirects out when there's no session
export default function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const { user, logout } = useAuth()
  const { t } = useT()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (user === null) router.replace("/login")
  }, [user, router])

  if (!user) return <div className="text-muted-foreground flex min-h-screen items-center justify-center text-sm">{t.loading}</div>

  const teacher = user.role === "teacher"
  const nav = teacher
    ? [
        { href: "/", label: t.nav.home, icon: LayoutDashboard },
        { href: "/activities", label: t.nav.activities, icon: ListChecks },
        { href: "/students", label: t.nav.students, icon: Users },
      ]
    : [
        { href: "/", label: t.nav.home, icon: LayoutDashboard },
        { href: "/activities", label: t.nav.activities, icon: ListChecks },
      ]

  return (
    <div className="flex min-h-screen">
      <aside className="bg-card hidden w-56 shrink-0 flex-col border-r md:flex">
        <Link href="/" className="flex h-14 items-center gap-2 border-b px-4 font-semibold">
          <Grid3x3 className="size-5" /> {t.app}
        </Link>
        <nav className="flex flex-col gap-1 p-3">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                pathname === n.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <n.icon className="size-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <Credit compact />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-card/80 sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b px-4 py-2 backdrop-blur md:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold md:hidden">
            <Grid3x3 className="size-5" />
          </Link>
          <ClassSwitcher />
          <span className="flex-1" />
          <span className="text-muted-foreground hidden text-sm sm:block">{user.name}</span>
          <LangToggle />
          <ThemeToggle />
          <Button variant="outline" size="icon" title={t.nav.signOut} onClick={() => { logout(); router.replace("/login") }}>
            <LogOut className="size-4" />
          </Button>
        </header>
        <nav className="flex gap-1 border-b px-2 py-1 md:hidden">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={cn("flex-1 rounded-md px-2 py-1.5 text-center text-xs", pathname === n.href ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
              {n.label}
            </Link>
          ))}
        </nav>
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <DemoBanner />
          {title && <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>}
          {children}
        </main>
      </div>
    </div>
  )
}

function ClassSwitcher() {
  const { user } = useAuth()
  const { list, current, select } = useClassroom()
  const { t } = useT()
  const teacher = user?.role === "teacher"
  return (
    <div className="flex items-center gap-2">
      {list.length > 0 ? (
        <select
          value={current?.id ?? ""}
          onChange={(e) => select(Number(e.target.value))}
          className="bg-background h-9 rounded-md border px-2 text-sm"
          aria-label={t.nav.classes}
        >
          {list.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      ) : (
        <span className="text-muted-foreground text-sm">{t.nav.noClass}</span>
      )}
      {teacher ? <NewClassDialog /> : <JoinDialog />}
    </div>
  )
}

export function NewClassDialog() {
  const { t } = useT()
  const { select } = useClassroom()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const create = useMutation({
    mutationFn: () => classes.create(name.trim()),
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ["classes"] })
      select(c.id)
      toast.success(t.klass.created)
      setOpen(false)
      setName("")
    },
    onError: () => toast.error(t.common.failed),
  })
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Plus className="size-4" /> {t.nav.newClass}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.nav.newClass}</DialogTitle>
          <DialogDescription>{t.dash.codeHint}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (name.trim()) create.mutate()
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="class-name">{t.klass.newName}</Label>
            <Input id="class-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t.common.cancel}</Button>
            <Button type="submit" disabled={create.isPending || !name.trim()}>{t.klass.create}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function JoinDialog({ big = false }: { big?: boolean }) {
  const { t } = useT()
  const { select } = useClassroom()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState("")
  const join = useMutation({
    mutationFn: () => classes.join(code.trim().toUpperCase()),
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ["classes"] })
      qc.invalidateQueries({ queryKey: ["placements"] })
      qc.invalidateQueries({ queryKey: ["submissions"] })
      select(c.id)
      toast.success(t.auth.joined(c.name))
      setOpen(false)
      setCode("")
    },
    onError: (e) => toast.error(e instanceof ApiError && e.status === 400 ? t.auth.badCode : t.common.failed),
  })
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={big ? "default" : "outline"} size={big ? "default" : "sm"} />}>
        <Plus className="size-4" /> {t.nav.join}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.auth.joinTitle}</DialogTitle>
          <DialogDescription>{t.auth.joinBody}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (code.trim().length === 6) join.mutate()
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="class-code">{t.auth.code}</Label>
            <Input id="class-code" autoFocus value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6} className="font-mono text-lg tracking-[0.3em] uppercase" placeholder="DEMO7B" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>{t.common.cancel}</Button>
            <Button type="submit" disabled={join.isPending || code.trim().length !== 6}>{t.auth.joinBtn}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
