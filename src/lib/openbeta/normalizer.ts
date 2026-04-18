/**
 * Normalizes OpenBeta GraphQL responses into Supabase-ready insert shapes.
 *
 * Produces two output types:
 * - OpenBetaPlaceInsert: for the `places` table (unmatched areas)
 * - OpenBetaRouteInsert: for the `routes` table
 */

import type { OpenBetaArea, OpenBetaClimb } from "./fetcher"

// ── Insert shapes ────────────────────────────────────────────────

export interface OpenBetaPlaceInsert {
  name: string
  slug: string
  type: "gym" | "boulder" | "crag" | "wall" | "other"
  environment: "indoor" | "outdoor"
  latitude: number
  longitude: number
  address: string | null
  city: string | null
  region: string | null
  country: string
  disciplines: string[]
  amenities: string[]
  description: string | null
  osm_id: number | null
  openbeta_id: string
  source: "openbeta"
  verified: boolean
}

export interface OpenBetaRouteInsert {
  external_id: string
  name: string
  grade: Record<string, string> | null
  type: string[]
  length: number | null
  description: string | null
  protection: string | null
  fa: string | null
  source: "openbeta"
}

// ── Helpers ──────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

/**
 * Infer place type from OpenBeta area metadata.
 */
function inferType(area: OpenBetaArea): OpenBetaPlaceInsert["type"] {
  if (area.metadata.isBoulder) return "boulder"

  // Check discipline totals if available
  const disc = area.aggregate?.byDiscipline
  if (disc) {
    const boulderTotal = disc.bouldering?.total ?? 0
    const routeTotal =
      (disc.sport?.total ?? 0) +
      (disc.trad?.total ?? 0) +
      (disc.tr?.total ?? 0)

    // If overwhelmingly boulder problems, classify as boulder
    if (boulderTotal > 0 && routeTotal === 0) return "boulder"
  }

  return "crag"
}

/**
 * Extract disciplines from aggregate data.
 */
function extractDisciplines(area: OpenBetaArea): string[] {
  const disc = area.aggregate?.byDiscipline
  if (!disc) return []

  const disciplines: string[] = []
  if ((disc.sport?.total ?? 0) > 0) disciplines.push("Sport")
  if ((disc.trad?.total ?? 0) > 0) disciplines.push("Trad")
  if ((disc.bouldering?.total ?? 0) > 0) disciplines.push("Bouldering")
  if ((disc.tr?.total ?? 0) > 0) disciplines.push("Top Rope")
  if ((disc.ice?.total ?? 0) > 0) disciplines.push("Ice")
  if ((disc.alpine?.total ?? 0) > 0) disciplines.push("Alpine")
  if ((disc.aid?.total ?? 0) > 0) disciplines.push("Aid")

  return disciplines
}

/**
 * Infer province/region from the pathTokens array.
 * OpenBeta hierarchy: ["Canada", "British Columbia", "Squamish", ...]
 */
function inferRegion(pathTokens: string[]): string | null {
  // pathTokens[0] = "Canada", pathTokens[1] = province
  if (pathTokens.length >= 2) {
    return pathTokens[1]
  }
  return null
}

// ── Public API ───────────────────────────────────────────────────

/**
 * Normalize an OpenBeta area into a PlaceInsert.
 */
export function normalizeArea(area: OpenBetaArea): OpenBetaPlaceInsert | null {
  const lat = area.metadata.lat
  const lng = area.metadata.lng

  if (lat == null || lng == null) return null
  if (!area.area_name) return null

  return {
    name: area.area_name,
    slug: `${slugify(area.area_name)}-ob-${area.uuid.slice(0, 8)}`,
    type: inferType(area),
    environment: "outdoor", // OpenBeta is exclusively outdoor crags
    latitude: lat,
    longitude: lng,
    address: null,
    city: null,
    region: inferRegion(area.pathTokens ?? []),
    country: "CA",
    disciplines: extractDisciplines(area),
    amenities: [],
    description: area.content?.description || null,
    osm_id: null,
    openbeta_id: area.uuid,
    source: "openbeta",
    verified: false,
  }
}

/**
 * Normalize an OpenBeta climb into a RouteInsert.
 */
export function normalizeClimb(climb: OpenBetaClimb): OpenBetaRouteInsert | null {
  if (!climb.name) return null

  // Build grade object — only include non-null values
  let grade: Record<string, string> | null = null
  if (climb.grades) {
    const g: Record<string, string> = {}
    if (climb.grades.yds) g.yds = climb.grades.yds
    if (climb.grades.vscale) g.vscale = climb.grades.vscale
    if (climb.grades.font) g.font = climb.grades.font
    if (climb.grades.french) g.french = climb.grades.french
    if (climb.grades.ewbank) g.ewbank = climb.grades.ewbank
    if (climb.grades.uiaa) g.uiaa = climb.grades.uiaa
    if (Object.keys(g).length > 0) grade = g
  }

  // Build type array from boolean flags
  const types: string[] = []
  if (climb.type.sport) types.push("sport")
  if (climb.type.trad) types.push("trad")
  if (climb.type.bouldering) types.push("bouldering")
  if (climb.type.tr) types.push("tr")
  if (climb.type.ice) types.push("ice")
  if (climb.type.alpine) types.push("alpine")
  if (climb.type.aid) types.push("aid")
  if (climb.type.mixed) types.push("mixed")
  if (climb.type.deepwatersolo) types.push("deepwatersolo")
  if (climb.type.snow) types.push("snow")

  return {
    external_id: climb.uuid,
    name: climb.name,
    grade,
    type: types,
    length: climb.length > 0 ? climb.length : null,
    description: climb.content?.description || null,
    protection: climb.content?.protection || null,
    fa: climb.fa || null,
    source: "openbeta",
  }
}

/**
 * Batch normalize climbs, filtering out incomplete records.
 */
export function normalizeClimbs(climbs: OpenBetaClimb[]): OpenBetaRouteInsert[] {
  return climbs
    .map(normalizeClimb)
    .filter((r): r is OpenBetaRouteInsert => r !== null)
}
