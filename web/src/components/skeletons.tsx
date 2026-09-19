import { Skeleton } from "@/components/ui/skeleton"

export function ListSkeleton({ rows = 4, cols = 2 }: { rows?: number; cols?: number }) {
  return (
    <ul className={`grid gap-2 ${cols === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : cols === 2 ? "md:grid-cols-2" : ""}`} aria-busy>
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="bg-card space-y-2 rounded-lg border px-4 py-3">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </li>
      ))}
    </ul>
  )
}

export function StatsSkeleton({ n = 4 }: { n?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="bg-card space-y-3 rounded-xl border p-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-16" />
        </div>
      ))}
    </div>
  )
}

export function BoardSkeleton({ n = 2 }: { n?: number }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2" aria-busy>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="bg-card flex flex-col items-center gap-4 rounded-xl border p-6">
          <Skeleton className="h-4 w-32 self-start" />
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 9 }).map((_, j) => (
              <Skeleton key={j} className="size-32 rounded-md" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4" aria-busy>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="ml-auto h-8 w-16" />
        </div>
      ))}
    </div>
  )
}
