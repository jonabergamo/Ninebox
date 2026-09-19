import { cn } from "@/lib/utils"

// the brand mark. eight quiet cells and the top right one lit, where everyone wants to end up
export function Logo({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={cn("shrink-0", className)} aria-hidden>
      <rect width="64" height="64" rx="14" className="fill-foreground" />
      <g className="fill-background/40">
        <rect x="12" y="12" width="12" height="12" rx="3" />
        <rect x="26" y="12" width="12" height="12" rx="3" />
        <rect x="12" y="26" width="12" height="12" rx="3" />
        <rect x="26" y="26" width="12" height="12" rx="3" />
        <rect x="40" y="26" width="12" height="12" rx="3" />
        <rect x="12" y="40" width="12" height="12" rx="3" />
        <rect x="26" y="40" width="12" height="12" rx="3" />
        <rect x="40" y="40" width="12" height="12" rx="3" />
      </g>
      <rect x="40" y="12" width="12" height="12" rx="3" fill="#34d399" />
    </svg>
  )
}
