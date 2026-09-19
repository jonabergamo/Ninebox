"use client"
import { FormEvent, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Credit } from "@/components/credit"
import { LangToggle } from "@/components/toggles"
import { authMessage, useAuth } from "@/lib/auth"
import { useT } from "@/lib/i18n"

const DEMO_PW = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "ninebox123"

export default function Login() {
  const { user, login } = useAuth()
  const { t } = useT()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (user) router.replace("/")
  }, [user, router])

  const go = async (e: string, p: string) => {
    setBusy(true)
    try {
      await login(e, p)
      router.replace("/")
    } catch (err) {
      toast.error(authMessage(err, t.auth))
    } finally {
      setBusy(false)
    }
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    go(email, password)
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="bg-primary text-primary-foreground hidden flex-col justify-between p-12 lg:flex">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <Logo size={30} className="[&_rect:first-child]:fill-white/20" /> {t.app}
        </div>
        <div className="max-w-md space-y-3">
          <h2 className="text-3xl font-semibold leading-tight">{t.auth.tagline}</h2>
          <p className="opacity-90">{t.auth.pitch}</p>
        </div>
        <Credit />
      </div>
      <div className="relative flex items-center justify-center p-6 lg:p-12">
        <div className="absolute top-6 right-6">
          <LangToggle />
        </div>
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-3xl font-bold">{t.auth.welcome}</h1>
            <p className="text-muted-foreground">{t.auth.subtitle}</p>
          </div>
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.auth.password}</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button className="w-full" type="submit" disabled={busy}>{t.auth.signIn}</Button>
          </form>
          <p className="text-muted-foreground text-center text-sm">
            {t.auth.noAccount}{" "}
            <Link href="/register" className="text-foreground underline-offset-4 hover:underline">{t.auth.register}</Link>
          </p>
          <div className="bg-muted/40 space-y-3 rounded-xl border p-4 text-sm">
            <p className="text-muted-foreground">{t.auth.demoHint}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="outline" disabled={busy} onClick={() => go("teacher@ninebox.app", DEMO_PW)}>{t.auth.demoTeacher}</Button>
              <Button variant="outline" disabled={busy} onClick={() => go("student@ninebox.app", DEMO_PW)}>{t.auth.demoStudent}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
