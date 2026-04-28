import dotenv from "dotenv"
import path from "path"

// Load .env.local (Next.js convention)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

import { createClient } from "@supabase/supabase-js"
import { buildClimbingQuery, fetchOverpassData, REGIONS } from "../src/lib/overpass/fetcher"
import { normalizeElements } from "../src/lib/overpass/normalizer"
import type { PlaceInsert } from "../src/lib/overpass/normalizer"
import { fetchClimbsForArea } from "../src/lib/openbeta/fetcher"
import { normalizeClimbs } from "../src/lib/openbeta/normalizer"
import type { OpenBetaRouteInsert } from "../src/lib/openbeta/normalizer"

// ── Validate env vars ────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ── Config ───────────────────────────────────────────────────────
const SKIP_ROUTES = process.argv.includes("--skip-routes")
const SEED_REGIONS = [
  "Ontario", "Quebec", "British Columbia", "Alberta",
  "Nova Scotia", "New Brunswick", "Manitoba", "Saskatchewan",
  "Newfoundland and Labrador", "Prince Edward Island",
]
const BATCH_SIZE = 50
const ROUTE_RATE_DELAY_MS = 800

// ── Helpers ──────────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function upsertPlaces(places: PlaceInsert[]): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0
  let skipped = 0

  for (let i = 0; i < places.length; i += BATCH_SIZE) {
    const batch = places.slice(i, i + BATCH_SIZE)

    const rows = batch.map((p: PlaceInsert) => ({
      ...p,
      location: `SRID=4326;POINT(${p.longitude} ${p.latitude})`,
    }))

    const { data, error } = await supabase
      .from("places")
      .upsert(rows, { onConflict: "osm_id", ignoreDuplicates: false })
      .select("id")

    if (error) {
      console.error(`   ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error.message)
      skipped += batch.length
    } else {
      inserted += data?.length ?? batch.length
    }
  }

  return { inserted, skipped }
}

/**
 * Upsert routes for a place. Always updates on conflict so that grade data
 * stays current across re-runs — ignoreDuplicates is intentionally omitted.
 */
async function upsertRoutes(
  placeId: string,
  routes: OpenBetaRouteInsert[]
): Promise<{ upserted: number; skipped: number }> {
  let upserted = 0
  let skipped = 0

  for (let i = 0; i < routes.length; i += BATCH_SIZE) {
    const batch = routes.slice(i, i + BATCH_SIZE).map((r) => ({
      ...r,
      place_id: placeId,
    }))

    const { data, error } = await supabase
      .from("routes")
      .upsert(batch, { onConflict: "external_id" })
      .select("id")

    if (error) {
      console.error(`   ❌ Route batch failed:`, error.message)
      skipped += batch.length
    } else {
      upserted += data?.length ?? batch.length
    }
  }

  return { upserted, skipped }
}

// ── Phase 1: OSM seeding ─────────────────────────────────────────
async function seedOSM(): Promise<void> {
  console.log(`📍 Regions: ${SEED_REGIONS.join(", ")}\n`)

  let totalInserted = 0
  let totalSkipped = 0

  for (let r = 0; r < SEED_REGIONS.length; r++) {
    const regionName = SEED_REGIONS[r]
    const bbox = REGIONS[regionName]

    if (!bbox) {
      console.error(`❌ Unknown region: ${regionName}`)
      continue
    }

    console.log(`\n${"─".repeat(50)}`)
    console.log(`📍 [${r + 1}/${SEED_REGIONS.length}] ${regionName}`)
    console.log(`   Bounding box: (${bbox.south}, ${bbox.west}) → (${bbox.north}, ${bbox.east})`)

    const query = buildClimbingQuery(bbox.south, bbox.west, bbox.north, bbox.east)
    const elements = await fetchOverpassData(query)

    const places = normalizeElements(elements)
    console.log(`   🔄 Normalized ${places.length} valid places from ${elements.length} raw elements`)

    if (places.length === 0) {
      console.log(`   ⚠️  No places found for ${regionName}`)
      continue
    }

    for (const place of places.slice(0, 2)) {
      console.log(`      • ${place.name} (${place.type}, ${place.environment})`)
    }
    if (places.length > 2) console.log(`      … and ${places.length - 2} more`)

    const { inserted, skipped } = await upsertPlaces(places)
    totalInserted += inserted
    totalSkipped += skipped
    console.log(`   ✅ ${regionName}: ${inserted} inserted/updated, ${skipped} errors`)

    if (r < SEED_REGIONS.length - 1) {
      console.log(`   ⏳ Waiting 5s before next region…`)
      await sleep(5000)
    }
  }

  console.log(`\n${"=".repeat(50)}`)
  console.log(`✅ OSM phase done — inserted/updated: ${totalInserted}, errors: ${totalSkipped}`)
}

// ── Phase 2: Route sync ──────────────────────────────────────────

/**
 * Fetch and upsert routes for every place already linked to OpenBeta.
 * Running this after the OSM phase ensures difficulty/grade data is always
 * current, regardless of whether a place was newly inserted or pre-existing.
 */
async function syncRoutes(): Promise<void> {
  console.log("\n📡 Phase 2: Syncing route grades for OpenBeta-linked places…")
  console.log("─".repeat(50))

  const { data: places, error } = await supabase
    .from("places")
    .select("id, name, openbeta_id")
    .not("openbeta_id", "is", null)

  if (error) {
    console.error("❌ Failed to query linked places:", error.message)
    return
  }

  if (!places || places.length === 0) {
    console.log("   No places linked to OpenBeta yet.")
    console.log("   Run seed-openbeta.ts first to link places, then re-run this script.")
    return
  }

  console.log(`   Found ${places.length} linked places\n`)

  let totalUpserted = 0
  let totalErrors = 0
  let noRoutes = 0

  for (let i = 0; i < places.length; i++) {
    const place = places[i]
    process.stdout.write(`[${i + 1}/${places.length}] ${place.name} — `)

    await sleep(ROUTE_RATE_DELAY_MS)

    const climbs = await fetchClimbsForArea(place.openbeta_id!)
    const routes = normalizeClimbs(climbs)

    if (routes.length === 0) {
      noRoutes++
      console.log("no routes")
      continue
    }

    const { upserted, skipped } = await upsertRoutes(place.id, routes)
    totalUpserted += upserted
    totalErrors += skipped
    process.stdout.write(`${upserted} routes synced`)
    if (skipped > 0) process.stdout.write(`, ${skipped} errors`)
    console.log()
  }

  console.log()
  console.log(`   📋 Routes upserted: ${totalUpserted}`)
  console.log(`   🗂️  No routes:      ${noRoutes}`)
  console.log(`   ❌ Errors:          ${totalErrors}`)
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log("🧗 Crux — OSM Seed Script (Multi-Region)")
  console.log("=".repeat(50))

  await seedOSM()

  if (SKIP_ROUTES) {
    console.log("\n⏭️  --skip-routes set, skipping Phase 2")
  } else {
    await syncRoutes()
  }

  console.log(`\n${"=".repeat(50)}`)
  console.log("🏁 All done!")
}

main().catch((err) => {
  console.error("💥 Unexpected error:", err)
  process.exit(1)
})
