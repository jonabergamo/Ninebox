"use client"
import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LangToggle } from "@/components/toggles"
import { authMessage, useAuth } from "@/lib/auth"
import { useT } from "@/lib/i18n"
import { Role } from "@/lib/api"
import { cn } from "@/lib/utils"

export default function Register() {
  const { register } = useAuth()
  const { t } = useT()
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" as Role })
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await register(form)
      router.replace("/")
    } catch (err) {
      toast.error(authMessage(err, t.auth))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6">
      <div className="absolute top-6 right-6">
        <LangToggle />
      </div>
      <form className="w-full max-w-md space-y-5" onSubmit={submit}>
        <h1 className="text-3xl font-bold">{t.auth.register}</h1>
        <div className="grid grid-cols-2 gap-2">
          {(["student", "teacher"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setForm({ ...form, role: r })}
              className={cn("rounded-md border px-3 py-2 text-sm", form.role === r ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted")}
            >
              {t.auth[r]}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">{t.auth.name}</Label>
          <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t.auth.email}</Label>
          <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t.auth.password}</Label>
          <Input id="password" type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <Button className="w-full" type="submit" disabled={busy}>{t.auth.register}</Button>
        <p className="text-muted-foreground text-center text-sm">
          {t.auth.haveAccount}{" "}
          <Link href="/login" className="text-foreground underline-offset-4 hover:underline">{t.auth.signIn}</Link>
        </p>
      </form>
    </div>
  )
}
