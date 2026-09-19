"use client"
import { Code2, ExternalLink, X } from "lucide-react"
import { useT } from "@/lib/i18n"
import { useAuth } from "@/lib/auth"
import { useLocal } from "@/lib/local"
import { Button } from "@/components/ui/button"

export const LINKS = { portfolio: "https://jonathanbergamo.vercel.app", repo: "https://github.com/jonabergamo/Ninebox" }

export function Credit({ compact = false }: { compact?: boolean }) {
  const { t } = useT()
  if (compact) {
    return (
      <div className="text-muted-foreground flex flex-col gap-1 border-t px-4 py-3 text-xs">
        <a href={LINKS.portfolio} target="_blank" rel="noreferrer" className="hover:text-foreground">{t.credit.by}</a>
        <a href={LINKS.repo} target="_blank" rel="noreferrer" className="hover:text-foreground flex items-center gap-1">
          <Code2 className="size-3" /> {t.credit.code}
        </a>
      </div>
    )
  }
  return (
    <div className="space-y-3 rounded-xl border border-white/20 bg-white/10 p-4 text-sm">
      <p className="font-medium">{t.credit.title}</p>
      <p className="opacity-90">{t.credit.body}</p>
      <div className="flex flex-wrap gap-4 font-medium">
        <a href={LINKS.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-1 underline-offset-4 hover:underline">
          <ExternalLink className="size-4" /> {t.credit.portfolio}
        </a>
        <a href={LINKS.repo} target="_blank" rel="noreferrer" className="flex items-center gap-1 underline-offset-4 hover:underline">
          <Code2 className="size-4" /> {t.credit.code}
        </a>
      </div>
    </div>
  )
}

const DEMO = ["teacher@ninebox.app", "student@ninebox.app"]

export function DemoBanner() {
  const { user } = useAuth()
  const { t } = useT()
  const [banner, setBanner] = useLocal("nb.banner", "on")
  if (banner === "off" || !user || !DEMO.includes(user.email)) return null
  return (
    <div className="bg-muted/60 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border px-4 py-3 text-sm">
      <p className="min-w-48 flex-1">
        <span className="font-medium">{t.banner.title}</span> {t.banner.body}
      </p>
      <a href={LINKS.repo} target="_blank" rel="noreferrer" className="font-medium underline-offset-4 hover:underline">{t.banner.code}</a>
      <a href={LINKS.portfolio} target="_blank" rel="noreferrer" className="font-medium underline-offset-4 hover:underline">{t.banner.more}</a>
      <Button
        size="icon"
        variant="ghost"
        className="size-7"
        aria-label={t.banner.close}
        onClick={() => setBanner("off")}
      >
        <X className="size-4" />
      </Button>
    </div>
  )
}
