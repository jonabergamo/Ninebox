import Cookies from "js-cookie"

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "")

export type Role = "teacher" | "student"
export type User = { id: number; email: string; name: string; role: Role }
export type Tokens = { access: string; refresh: string }
export type Klass = { id: number; name: string; code: string; teacher_name: string; students_count: number; created_at: string }
export type Subject = { id: number; classroom: number; name: string }
export type Grid = { id: number; classroom: number; name: string }
export type Criterion = { id: number; description: string; weight: number }
export type Activity = {
  id: number
  classroom: number
  name: string
  description: string
  level: number
  due_at: string | null
  subjects: number[]
  grids: number[]
  criteria: Criterion[]
  created_at: string
  submitted: number
  graded: number
}
export type Letter = "E" | "G" | "A" | "P"
export type Mark = { criterion: number; grade: Letter; feedback: string }
export type Submission = {
  id: number
  activity: number
  activity_name: string
  activity_level: number
  due_at: string | null
  student: User
  link: string
  submitted_at: string | null
  graded_at: string | null
  final_grade: number | null
  marks: Mark[]
}
export type Placement = { id: number; grid: number; grid_name: string; classroom: number; student: User; level: number; x: number; y: number; fail_streak: number }
export type Heatmap = { grid: Grid; placements: Placement[] }[]
export type History = { level: number; x: number; y: number; grade: number; at: string; activity: string; kind: "activity" | "exam" }

const KEY = "nb.tokens"
export const tokens = {
  read: (): Tokens | null => {
    const raw = Cookies.get(KEY)
    return raw ? JSON.parse(raw) : null
  },
  write: (t: Tokens) => Cookies.set(KEY, JSON.stringify(t), { expires: 7, sameSite: "lax", secure: location.protocol === "https:" }),
  clear: () => Cookies.remove(KEY),
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(typeof body === "object" && body && "detail" in body ? String((body as { detail: unknown }).detail) : `http ${status}`)
  }
}

let refreshing: Promise<string | null> | null = null

async function refresh(): Promise<string | null> {
  refreshing ??= (async () => {
    const t = tokens.read()
    if (!t) return null
    const r = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refresh: t.refresh }),
    })
    if (!r.ok) {
      tokens.clear()
      return null
    }
    const data = await r.json()
    tokens.write({ access: data.access, refresh: data.refresh ?? t.refresh })
    return data.access as string
  })().finally(() => (refreshing = null))
  return refreshing
}

// one wrapper for every call. retries once after refreshing an expired access token
export async function api<T>(path: string, init: RequestInit & { json?: unknown; raw?: boolean } = {}): Promise<T> {
  const go = async (access: string | null) => {
    const headers: Record<string, string> = { ...(init.headers as Record<string, string>) }
    if (init.json !== undefined) headers["content-type"] = "application/json"
    if (access) headers.authorization = `Bearer ${access}`
    return fetch(`${API_URL}/api${path}`, { ...init, headers, body: init.json !== undefined ? JSON.stringify(init.json) : init.body })
  }
  let res = await go(tokens.read()?.access ?? null)
  if (res.status === 401 && tokens.read()) {
    const access = await refresh()
    if (access) res = await go(access)
  }
  if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => null))
  if (init.raw) return (await res.text()) as T
  if (res.status === 204) return undefined as T
  return res.json()
}

export const auth = {
  login: async (email: string, password: string) => {
    const r = await fetch(`${API_URL}/api/auth/token`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) })
    if (!r.ok) throw new ApiError(r.status, await r.json().catch(() => null))
    tokens.write(await r.json())
    return api<User>("/auth/me")
  },
  register: async (body: { name: string; email: string; password: string; role: Role }) => {
    const r = await fetch(`${API_URL}/api/auth/register`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
    if (!r.ok) throw new ApiError(r.status, await r.json().catch(() => null))
    const data = await r.json()
    tokens.write({ access: data.access, refresh: data.refresh })
    return data.user as User
  },
  me: () => api<User>("/auth/me"),
}

export const classes = {
  list: () => api<Klass[]>("/classes/"),
  create: (name: string) => api<Klass>("/classes/", { method: "POST", json: { name } }),
  rename: (id: number, name: string) => api<Klass>(`/classes/${id}/`, { method: "PATCH", json: { name } }),
  remove: (id: number) => api<void>(`/classes/${id}/`, { method: "DELETE" }),
  join: (code: string) => api<Klass>("/classes/join/", { method: "POST", json: { code } }),
  students: (id: number) => api<User[]>(`/classes/${id}/students/`),
  removeStudent: (id: number, studentId: number) => api<void>(`/classes/${id}/students/${studentId}/`, { method: "DELETE" }),
  heatmap: (id: number) => api<Heatmap>(`/classes/${id}/heatmap/`),
  csv: (id: number) => api<string>(`/classes/${id}/export.csv/`, { raw: true }),
}

export const subjects = {
  list: (classroom: number) => api<Subject[]>(`/subjects/?classroom=${classroom}`),
  create: (classroom: number, name: string) => api<Subject>("/subjects/", { method: "POST", json: { classroom, name } }),
  remove: (id: number) => api<void>(`/subjects/${id}/`, { method: "DELETE" }),
}

export const grids = {
  list: (classroom: number) => api<Grid[]>(`/grids/?classroom=${classroom}`),
  create: (classroom: number, name: string) => api<Grid>("/grids/", { method: "POST", json: { classroom, name } }),
  remove: (id: number) => api<void>(`/grids/${id}/`, { method: "DELETE" }),
}

export type ActivityInput = Pick<Activity, "classroom" | "name" | "description" | "level" | "due_at" | "subjects" | "grids"> & { criteria: Omit<Criterion, "id">[] }

export const activities = {
  list: (classroom: number) => api<Activity[]>(`/activities/?classroom=${classroom}`),
  one: (id: number) => api<Activity>(`/activities/${id}/`),
  create: (body: ActivityInput) => api<Activity>("/activities/", { method: "POST", json: body }),
  update: (id: number, body: Partial<ActivityInput>) => api<Activity>(`/activities/${id}/`, { method: "PATCH", json: body }),
  remove: (id: number) => api<void>(`/activities/${id}/`, { method: "DELETE" }),
  submissions: (id: number) => api<Submission[]>(`/activities/${id}/submissions/`),
}

export const submissions = {
  mine: (classroom?: number) => api<Submission[]>(`/submissions/${classroom ? `?activity__classroom=${classroom}` : ""}`),
  submit: (id: number, link: string) => api<Submission>(`/submissions/${id}/submit/`, { method: "POST", json: { link } }),
  grade: (id: number, marks: { criterion_id: number; grade: Letter; feedback?: string }[]) =>
    api<Submission>(`/submissions/${id}/grade/`, { method: "POST", json: { marks } }),
}

export const placements = {
  list: (params: { grid?: number; student?: number } = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]))
    return api<Placement[]>(`/placements/?${q}`)
  },
  timeline: (studentId: number, grid: number) => api<{ placement: Placement; history: History[] }>(`/students/${studentId}/timeline?grid=${grid}`),
}

// ---- exams

export type ExamStatus = "draft" | "open" | "closed"
export type Choice = { id: number; text: string; is_correct?: boolean }
export type Question = { id: number; text: string; points: number; order: number; choices: Choice[] }
export type Attempt = { id: number; student: User; started_at: string; submitted_at: string | null; answers: Record<string, number>; score: number | null }
export type Exam = {
  id: number
  classroom: number
  title: string
  instructions: string
  duration_minutes: number
  level: number
  grids: number[]
  status: ExamStatus
  opened_at: string | null
  ends_at: string | null
  created_at: string
  questions: Question[]
  question_count: number
  my_attempt: Attempt | null
}
export type ExamInput = Pick<Exam, "classroom" | "title" | "instructions" | "duration_minutes" | "level" | "grids"> & {
  questions: { text: string; points: number; choices: { text: string; is_correct: boolean }[] }[]
}

export const exams = {
  list: (classroom: number) => api<Exam[]>(`/exams/?classroom=${classroom}`),
  one: (id: number) => api<Exam>(`/exams/${id}/`),
  create: (body: ExamInput) => api<Exam>("/exams/", { method: "POST", json: body }),
  update: (id: number, body: Partial<ExamInput>) => api<Exam>(`/exams/${id}/`, { method: "PATCH", json: body }),
  remove: (id: number) => api<void>(`/exams/${id}/`, { method: "DELETE" }),
  open: (id: number) => api<Exam>(`/exams/${id}/open/`, { method: "POST" }),
  close: (id: number) => api<Exam>(`/exams/${id}/close/`, { method: "POST" }),
  reopen: (id: number) => api<Exam>(`/exams/${id}/reopen/`, { method: "POST" }),
  results: (id: number) => api<Attempt[]>(`/exams/${id}/results/`),
  start: (id: number) => api<Attempt>(`/exams/${id}/start/`, { method: "POST" }),
  answer: (id: number, question: number, choice: number) => api<Attempt>(`/exams/${id}/answer/`, { method: "POST", json: { question, choice } }),
  submit: (id: number) => api<Attempt>(`/exams/${id}/submit/`, { method: "POST" }),
}

export const account = {
  rename: (name: string) => api<User>("/auth/me", { method: "PATCH", json: { name } }),
  password: (current: string, next: string) => api<void>("/auth/password", { method: "POST", json: { current, new: next } }),
}
