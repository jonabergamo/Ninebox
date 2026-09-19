"use client"
import { useEffect, useRef, useState } from "react"
import { API_URL, tokens, ExamStatus } from "./api"

export type ExamLive = {
  status: ExamStatus
  opened_at: string | null
  ends_at: string | null
  server_now: string
  submitted: number
  started: number
  connected: number
  joined?: string
  submitted_by?: string
}

// the server owns the clock. we keep the offset between its time and ours and count down locally
export function useExamSocket(examId: number | null, onEvent?: (e: ExamLive) => void) {
  const [live, setLive] = useState<ExamLive | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [online, setOnline] = useState(false)
  const [offset, setOffset] = useState(0)
  const handler = useRef(onEvent)
  useEffect(() => {
    handler.current = onEvent
  })

  useEffect(() => {
    if (!examId) return
    let ws: WebSocket | null = null
    let closed = false
    let retry = 1000
    const connect = () => {
      const access = tokens.read()?.access
      if (!access) return
      ws = new WebSocket(`${API_URL.replace(/^http/, "ws")}/ws/exams/${examId}/?token=${access}`)
      ws.onopen = () => {
        setOnline(true)
        retry = 1000
      }
      ws.onmessage = (m) => {
        const e = JSON.parse(m.data) as ExamLive
        setOffset(new Date(e.server_now).getTime() - Date.now())
        setLive(e)
        handler.current?.(e)
      }
      ws.onclose = () => {
        setOnline(false)
        if (!closed) setTimeout(connect, (retry = Math.min(retry * 2, 15000)))
      }
    }
    connect()
    return () => {
      closed = true
      ws?.close()
    }
  }, [examId])

  useEffect(() => {
    if (!live?.ends_at || live.status !== "open") return
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [live])

  const remaining =
    live?.ends_at && live.status === "open" ? Math.max(0, Math.round((new Date(live.ends_at).getTime() - (now + offset)) / 1000)) : null

  return { live, remaining, online }
}

export const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`
