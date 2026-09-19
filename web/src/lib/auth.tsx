"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { auth, tokens, ApiError, Role, User } from "./api"

type Ctx = {
  user: User | null | undefined // undefined until the cookie has been read
  login: (email: string, password: string) => Promise<User>
  register: (body: { name: string; email: string; password: string; role: Role }) => Promise<User>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<Ctx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const qc = useQueryClient()

  useEffect(() => {
    const load = async () => {
      if (!tokens.read()) return null
      try {
        return await auth.me()
      } catch {
        tokens.clear()
        return null
      }
    }
    load().then(setUser)
  }, [])

  const login = async (email: string, password: string) => {
    const u = await auth.login(email, password)
    setUser(u)
    return u
  }
  const register: Ctx["register"] = async (body) => {
    const u = await auth.register(body)
    setUser(u)
    return u
  }
  const logout = () => {
    tokens.clear()
    localStorage.removeItem("nb.class")
    qc.clear()
    setUser(null)
  }

  const refresh = async () => setUser(await auth.me())

  return <AuthContext.Provider value={{ user, login, register, logout, refresh }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth outside AuthProvider")
  return ctx
}

// the login and register pages turn api errors into a sentence in the current language
export function authMessage(e: unknown, t: { bad: string; noServer: string; taken: string }) {
  if (e instanceof ApiError) {
    if (e.status === 401) return t.bad
    if (e.status === 400 && e.body && typeof e.body === "object" && "email" in e.body) return t.taken
    return e.message
  }
  return t.noServer
}
