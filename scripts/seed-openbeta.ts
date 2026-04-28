import dotenv from "dotenv"
import path from "path"

// Load .env.local (Next.js convention)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

import { createClient } from "@supabase/supabase-js"
import { fetchAllLeafAreas, fetchClimbsForArea } from "../src/lib/openbeta/fetcher"
import { normalizeArea, normalizeClimbs } from "../src/lib/openbeta/normalizer"
import type { OpenBetaPlaceInsert, OpenBetaRouteInsert } from "../src/lib/openbeta/normalizer"

// ── Validate env vars ────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ── Config ───────────────────────────────────────────────────────
const DRY_RUN = process.argv.includes("--dry-run")
const ROUTES_ONLY = process.argv.includes("--routes-only")
const MATCH_RADIUS_M = 150
const MIN_NAME_SIMILARITY = 0.3
const BATCH_SIZE = 50
const RATE_DELAY_MS = 1000

// ── Helpers ──────────────────────────────────────────────────────
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function findExistingMatch(
  lat: number,
  lng: number,
  name: string
): Promise<{ id: string; name: string; distance_m: number; name_similarity: number } | null> {
  const { data, error } = await supabase.rpc("match_place_to_openbeta", {
    p_lat: lat,
    p_lng: lng,
    p_name: name,
    p_radius_m: MATCH_RADIUS_M,
  })

  if (error) {
    if (error.message.includes("does not exist")) {
      console.warn("   ⚠️  match_place_to_openbeta RPC not found — skipping spatial matching")
      return null
    }
    console.error(`   ❌ RPC error:`, error.message)
    return null
  }

  if (!data || data.length === 0) return null

  const best = data[0]
  if (best.name_similarity >= MIN_NAME_SIMILARITY) return best
  if (best.distance_m < 30) return best
  return null
}

async function linkExistingPlace(
  placeId: string,
  openbetaId: string,
  enrichData: Partial<{ description: string; disciplines: string[] }>
): Promise<boolean> {
  const update: Record<string, unknown> = { openbeta_id: openbetaId }
  if (enrichData.description) update.description = enrichData.description

  const { error } = await supabase
    .from("places")
    .update(update)
    .eq("id", placeId)
    .is("openbeta_id", null)

  if (error) {
    console.error(`   ❌ Failed to link place ${placeId}:`, error.message)
    return false
  }
  return true
}

async function insertNewPlace(place: OpenBetaPlaceInsert): Promise<string | null> {
  const row = {
    ...place,
    location: `SRID=4326;POINT(${place.longitude} ${place.latitude})`,
  }

  const { data, error } = await supabase
    .from("places")
    .upsert(row, { onConflict: "openbeta_id", ignoreDuplicates: true })
    .select("id")
    .single()

  if (error) {
    if (error.code === "23505") {
      const { data: existing } = await supabase
        .from("places")
        .select("id")
        .eq("openbeta_id", place.openbeta_id)
        .single()
      return existing?.id ?? null
    }
    console.error(`   ❌ Failed to insert ${place.name}:`, error.message)
    return null
  }

  return data?.id ?? null
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

// ── Routes-only mode ─────────────────────────────────────────────

/**
 * Re-sync grades for every place already linked to OpenBeta.
 * Skips place matching entirely — useful for refreshing difficulty data
 * without re-processing the full area list.
 */
async function syncAllLinkedRoutes(): Promise<void> {
  console.log("📋 Routes-only mode — syncing grades for all linked places")
  console.log("─".repeat(55))

  const { data: places, error } = await supabase
    .from("places")
    .select("id, name, openbeta_id")
    .not("openbeta_id", "is", null)

  if (error) {
    console.error("❌ Failed to fetch linked places:", error.message)
    return
  }

  if (!places || places.length === 0) {
    console.log("⚠️  No places linked to OpenBeta — run without --routes-only first")
    return
  }

  console.log(`Found ${places.length} linked places\n`)

  let totalUpserted = 0
  let totalErrors = 0

  for (let i = 0; i < places.length; i++) {
    const place = places[i]
    process.stdout.write(`[${i + 1}/${places.length}] ${place.name} — `)

    await sleep(RATE_DELAY_MS)

    const climbs = await fetchClimbsForArea(place.openbeta_id!)
    const routes = normalizeClimbs(climbs)

    if (routes.length === 0) {
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
  console.log("=".repeat(55))
  console.log("🏁 Route sync complete!")
  console.log(`   📋 Routes upserted: ${totalUpserted}`)
  console.log(`   ❌ Errors:          ${totalErrors}`)
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log("🧗 Crux — OpenBeta Seed Script (Canada)")
  console.log("=".repeat(55))

  if (ROUTES_ONLY) {
    await syncAllLinkedRoutes()
    return
  }

  if (DRY_RUN) {
    console.log("🏜️  DRY RUN MODE — no database writes\n")
  }

  console.log("\n📡 Phase 1: Fetching Canadian leaf areas from OpenBeta…")
  const leafAreas = await fetchAllLeafAreas(["Canada"], RATE_DELAY_MS)
  console.log(`\n✅ Found ${leafAreas.length} leaf areas\n`)

  if (leafAreas.length === 0) {
    console.log("⚠️  No areas found. Exiting.")
    return
  }

  let matched = 0
  let newPlaces = 0
  let totalRoutes = 0
  let routeErrors = 0
  let skippedAreas = 0

  console.log("📡 Phase 2: Matching & inserting…")
  console.log("─".repeat(55))

  for (let i = 0; i < leafAreas.length; i++) {
    const area = leafAreas[i]
    const normalized = normalizeArea(area)

    if (!normalized) {
      skippedAreas++
      continue
    }

    const progress = `[${i + 1}/${leafAreas.length}]`
    process.stdout.write(`${progress} ${normalized.name} — `)

    if (DRY_RUN) {
      console.log(
        `would insert (${normalized.type}, ${normalized.latitude.toFixed(4)}, ${normalized.longitude.toFixed(4)}, ${area.totalClimbs} climbs)`
      )
      continue
    }

    let placeId: string | null = null
    const existingMatch = await findExistingMatch(
      normalized.latitude,
      normalized.longitude,
      normalized.name
    )

    if (existingMatch) {
      await linkExistingPlace(existingMatch.id, area.uuid, {
        description: normalized.description ?? undefined,
        disciplines: normalized.disciplines,
      })
      placeId = existingMatch.id
      matched++
      console.log(
        `🔗 matched → "${existingMatch.name}" (${existingMatch.distance_m.toFixed(0)}m, ${(existingMatch.name_similarity * 100).toFixed(0)}% sim)`
      )
    } else {
      placeId = await insertNewPlace(normalized)
      if (placeId) {
        newPlaces++
        console.log(`✨ new place inserted`)
      } else {
        skippedAreas++
        console.log(`⚠️  skipped (insert failed)`)
        continue
      }
    }

    if (placeId && area.totalClimbs > 0) {
      await sleep(RATE_DELAY_MS)
      const climbs = await fetchClimbsForArea(area.uuid)
      const normalizedRoutes = normalizeClimbs(climbs)

      if (normalizedRoutes.length > 0) {
        const { upserted, skipped } = await upsertRoutes(placeId, normalizedRoutes)
        totalRoutes += upserted
        routeErrors += skipped
        process.stdout.write(`   📋 ${upserted} routes upserted`)
        if (skipped > 0) process.stdout.write(`, ${skipped} errors`)
        console.log()
      }
    }

    await sleep(500)
  }

  console.log()
  console.log("=".repeat(55))
  console.log("🏁 OpenBeta Seed Complete!")
  console.log(`   📍 Areas processed:  ${leafAreas.length}`)
  console.log(`   🔗 Matched to OSM:   ${matched}`)
  console.log(`   ✨ New places:       ${newPlaces}`)
  console.log(`   📋 Routes upserted:  ${totalRoutes}`)
  console.log(`   ⚠️  Skipped areas:   ${skippedAreas}`)
  console.log(`   ❌ Route errors:     ${routeErrors}`)
}

main().catch((err) => {
  console.error("💥 Unexpected error:", err)
  process.exit(1)
})
