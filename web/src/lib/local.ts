import { useSyncExternalStore } from "react"

// a localStorage value every component can subscribe to, safe for the server render
const listeners = new Set<() => void>()

export function useLocal(key: string, fallback = ""): [string, (v: string) => void] {
  const value = useSyncExternalStore(
    (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    () => {
      try {
        return localStorage.getItem(key) ?? fallback
      } catch {
        return fallback
      }
    },
    () => fallback,
  )
  const set = (v: string) => {
    try {
      localStorage.setItem(key, v)
    } catch {}
    listeners.forEach((fn) => fn())
  }
  return [value, set]
}
