"use client"
import AppShell from "@/components/app-shell"
import { Timeline } from "@/app/students/[id]/page"
import { useAuth } from "@/lib/auth"

export default function MePage() {
  const { user } = useAuth()
  return <AppShell>{user && <Timeline studentId={user.id} backHref="/" />}</AppShell>
}
