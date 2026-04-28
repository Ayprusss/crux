"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Route, GradeInfo } from "@/types/route"

// Ordered grade scales for range computation
const VSCALE_ORDER = [
  "VB", "V0", "V1", "V2", "V3", "V4", "V5", "V6",
  "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14",
  "V15", "V16", "V17",
]

const YDS_ORDER = [
  "5.0", "5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "5.8", "5.9",
  "5.10a", "5.10b", "5.10c", "5.10d",
  "5.11a", "5.11b", "5.11c", "5.11d",
  "5.12a", "5.12b", "5.12c", "5.12d",
  "5.13a", "5.13b", "5.13c", "5.13d",
  "5.14a", "5.14b", "5.14c", "5.14d",
  "5.15a", "5.15b", "5.15c", "5.15d",
]

export interface GradeRange {
  min: string
  max: string
}

export interface RouteStats {
  routeCount: number
  vscaleRange: GradeRange | null
  ydsRange: GradeRange | null
  disciplineCounts: Record<string, number>
}

function normalizeVScale(raw: string): string {
  const upper = raw.trim().toUpperCase()
  if (upper === "VB" || upper === "V-") return "VB"
  const match = upper.match(/^V(\d+)/)
  return match ? `V${match[1]}` : upper
}

function normalizeYDS(raw: string): string {
  return raw.trim().toLowerCase()
}

function computeRange(grades: string[], order: string[]): GradeRange | null {
  const indices = grades
    .map((g) => order.indexOf(g))
    .filter((i) => i !== -1)
  if (indices.length === 0) return null
  return {
    min: order[Math.min(...indices)],
    max: order[Math.max(...indices)],
  }
}

function parseGrade(grade: GradeInfo | null): { vscale?: string; yds?: string } {
  if (!grade) return {}
  return {
    vscale: grade.vscale ?? undefined,
    yds: grade.yds ?? undefined,
  }
}

function computeStats(routes: Route[]): RouteStats {
  const vscaleGrades: string[] = []
  const ydsGrades: string[] = []
  const disciplineCounts: Record<string, number> = {}

  for (const route of routes) {
    const { vscale, yds } = parseGrade(route.grade)
    if (vscale) vscaleGrades.push(normalizeVScale(vscale))
    if (yds) ydsGrades.push(normalizeYDS(yds))

    for (const t of route.type ?? []) {
      disciplineCounts[t] = (disciplineCounts[t] ?? 0) + 1
    }
  }

  return {
    routeCount: routes.length,
    vscaleRange: computeRange(vscaleGrades, VSCALE_ORDER),
    ydsRange: computeRange(ydsGrades, YDS_ORDER),
    disciplineCounts,
  }
}

interface UseRoutesResult {
  routes: Route[]
  stats: RouteStats
  loading: boolean
  error: string | null
}

export function useRoutes(placeId: string | null, enabled = true): UseRoutesResult {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!placeId || !enabled) {
      setRoutes([])
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    const supabase = createClient()
    supabase
      .from("routes")
      .select("*")
      .eq("place_id", placeId)
      .order("name")
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) {
          setError(err.message)
        } else {
          setRoutes((data ?? []) as unknown as Route[])
        }
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [placeId, enabled])

  return { routes, stats: computeStats(routes), loading, error }
}
