"use client"
import { FormEvent, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import AppShell from "@/components/app-shell"
import { LangToggle, ThemeToggle } from "@/components/toggles"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { account, ApiError } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { useT } from "@/lib/i18n"

export default function SettingsPage() {
  const { t } = useT()
  const { user, refresh } = useAuth()
  const [name, setName] = useState(user?.name ?? "")
  const [pw, setPw] = useState({ current: "", next: "" })

  const rename = useMutation({
    mutationFn: () => account.rename(name.trim()),
    onSuccess: () => {
      refresh()
      toast.success(t.settings.saved)
    },
    onError: () => toast.error(t.common.failed),
  })
  const change = useMutation({
    mutationFn: () => account.password(pw.current, pw.next),
    onSuccess: () => {
      setPw({ current: "", next: "" })
      toast.success(t.settings.changed)
    },
    onError: (e) => toast.error(e instanceof ApiError && e.status === 400 ? t.settings.wrong : t.common.failed),
  })
  const on = (fn: () => void) => (e: FormEvent) => {
    e.preventDefault()
    fn()
  }

  return (
    <AppShell title={t.settings.title}>
      <div className="grid max-w-3xl gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">{t.settings.name}</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={on(() => name.trim() && rename.mutate())}>
              <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
              <Button type="submit" disabled={rename.isPending || !name.trim() || name.trim() === user?.name}>{t.settings.saveName}</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">{t.settings.password}</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={on(() => change.mutate())}>
              <div className="space-y-1">
                <Label htmlFor="cur">{t.settings.current}</Label>
                <Input id="cur" type="password" required value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="nxt">{t.settings.next}</Label>
                <Input id="nxt" type="password" required minLength={8} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
              </div>
              <Button type="submit" disabled={change.isPending || pw.next.length < 8}>{t.settings.changePassword}</Button>
            </form>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base">{t.settings.appearance}</CardTitle></CardHeader>
          <CardContent className="flex gap-2"><LangToggle /><ThemeToggle /></CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
