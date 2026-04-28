"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, ListTree } from "lucide-react"
import { useRoutes } from "@/hooks/useRoutes"
import type { Route } from "@/types/route"

// ── Grade difficulty tiers ────────────────────────────────────────

const VSCALE_ORDER = [
  "VB","V0","V1","V2","V3","V4","V5","V6",
  "V7","V8","V9","V10","V11","V12","V13","V14","V15","V16","V17",
]

function vscaleIndex(g: string): number {
  const norm = g.trim().toUpperCase().replace(/^V-$/, "VB")
  const match = norm.match(/^V(\d+)/)
  const key = match ? `V${match[1]}` : norm
  const i = VSCALE_ORDER.indexOf(key)
  return i === -1 ? 0 : i
}

function vscaleTier(g: string): "beginner" | "intermediate" | "advanced" | "elite" {
  const i = vscaleIndex(g)
  if (i <= 2) return "beginner"       // VB–V2
  if (i <= 5) return "intermediate"   // V3–V5
  if (i <= 9) return "advanced"       // V6–V9
  return "elite"                       // V10+
}

function ydsTier(g: string): "beginner" | "intermediate" | "advanced" | "elite" {
  const norm = g.trim().toLowerCase()
  if (norm <= "5.8") return "beginner"
  if (norm <= "5.10d") return "intermediate"
  if (norm <= "5.12d") return "advanced"
  return "elite"
}

const TIER_COLORS = {
  beginner:     "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  intermediate: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  advanced:     "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  elite:        "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

// ── Sub-components ────────────────────────────────────────────────

function GradeBadge({ grade }: { grade: Route["grade"] }) {
  if (!grade) return <span className="text-xs text-muted-foreground">–</span>

  const g = grade as Record<string, string>
  if (g.vscale) {
    const tier = vscaleTier(g.vscale)
    return (
      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold tabular-nums ${TIER_COLORS[tier]}`}>
        {g.vscale.toUpperCase().startsWith("V") ? g.vscale.toUpperCase() : `V${g.vscale}`}
      </span>
    )
  }
  if (g.yds) {
    const tier = ydsTier(g.yds)
    return (
      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold tabular-nums ${TIER_COLORS[tier]}`}>
        {g.yds}
      </span>
    )
  }
  if (g.font) {
    return (
      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
        {g.font}
      </span>
    )
  }
  // fallback: first available grade system
  const first = Object.values(g)[0]
  return (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold bg-muted text-muted-foreground">
      {first}
    </span>
  )
}

function RouteRow({ route }: { route: Route }) {
  const disciplines = (route.type ?? []).slice(0, 2)
  return (
    <div className="flex items-center gap-2.5 py-2 border-b last:border-0 border-border/50">
      <div className="w-16 shrink-0">
        <GradeBadge grade={route.grade} />
      </div>
      <p className="flex-1 text-sm text-foreground truncate">{route.name}</p>
      <div className="flex gap-1 shrink-0">
        {disciplines.map((d) => (
          <span key={d} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">
            {d === "tr" ? "top rope" : d}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Stats bar ─────────────────────────────────────────────────────

function StatsBar({ stats }: { stats: ReturnType<typeof useRoutes>["stats"] }) {
  const { routeCount, vscaleRange, ydsRange, disciplineCounts } = stats

  const gradeLabel = (() => {
    if (vscaleRange) {
      return vscaleRange.min === vscaleRange.max
        ? vscaleRange.min
        : `${vscaleRange.min}–${vscaleRange.max}`
    }
    if (ydsRange) {
      return ydsRange.min === ydsRange.max
        ? ydsRange.min
        : `${ydsRange.min}–${ydsRange.max}`
    }
    return null
  })()

  const topDisciplines = Object.entries(disciplineCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary">
        {routeCount} {routeCount === 1 ? "route" : "routes"}
      </span>
      {gradeLabel && (
        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-muted text-muted-foreground">
          {gradeLabel}
        </span>
      )}
      {topDisciplines.map(([disc, count]) => (
        <span key={disc} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-muted/60 text-muted-foreground capitalize">
          {disc === "tr" ? "top rope" : disc} · {count}
        </span>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────

const PAGE_SIZE = 15

interface RouteListProps {
  placeId: string
}

export default function RouteList({ placeId }: RouteListProps) {
  const [expanded, setExpanded] = useState(false)
  const { routes, stats, loading } = useRoutes(placeId, true)

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
        <ListTree className="h-4 w-4 animate-pulse" />
        Loading routes…
      </div>
    )
  }

  if (routes.length === 0) return null

  const visible = expanded ? routes : routes.slice(0, PAGE_SIZE)
  const hasMore = routes.length > PAGE_SIZE

  return (
    <div className="flex items-start gap-3">
      <ListTree className="h-5 w-5 text-primary shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground mb-2">Routes & Problems</p>
        <StatsBar stats={stats} />
        <div className="rounded-lg border border-border/60 bg-muted/20 px-3 divide-y divide-border/40">
          {visible.map((route) => (
            <RouteRow key={route.id} route={route} />
          ))}
        </div>
        {hasMore && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? (
              <><ChevronUp className="h-3.5 w-3.5" /> Show less</>
            ) : (
              <><ChevronDown className="h-3.5 w-3.5" /> Show all {routes.length} routes</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
