"use client"
import { createContext, useContext, ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import { classes, Klass } from "./api"
import { useAuth } from "./auth"
import { useLocal } from "./local"

type Ctx = { list: Klass[]; current: Klass | null; select: (id: number) => void; loading: boolean }
const ClassContext = createContext<Ctx>({ list: [], current: null, select: () => {}, loading: true })

// the class the user is looking at right now. teachers switch between theirs, students usually have one
export function ClassProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [saved, save] = useLocal("nb.class")
  const id = Number(saved) || null
  const q = useQuery({ queryKey: ["classes"], queryFn: classes.list, enabled: !!user })

  const list = q.data ?? []
  const current = list.find((c) => c.id === id) ?? list[0] ?? null

  const select = (next: number) => save(String(next))

  return <ClassContext.Provider value={{ list, current, select, loading: q.isLoading }}>{children}</ClassContext.Provider>
}

export const useClassroom = () => useContext(ClassContext)
