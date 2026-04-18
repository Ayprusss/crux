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
const MATCH_RADIUS_M = 150 // meters for spatial matching
const MIN_NAME_SIMILARITY = 0.3
const BATCH_SIZE = 50
const RATE_DELAY_MS = 1000

// ── Helpers ──────────────────────────────────────────────────────
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Try to match an OpenBeta area to an existing place using PostGIS proximity
 * and pg_trgm fuzzy name matching via the `match_place_to_openbeta` RPC.
 */
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
    // If RPC doesn't exist, fall back to no matching
    if (error.message.includes("does not exist")) {
      console.warn("   ⚠️  match_place_to_openbeta RPC not found — skipping spatial matching")
      return null
    }
    console.error(`   ❌ RPC error:`, error.message)
    return null
  }

  if (!data || data.length === 0) return null

  // Take the best match that meets our similarity threshold
  const best = data[0]
  if (best.name_similarity >= MIN_NAME_SIMILARITY) {
    return best
  }

  // If name similarity is low but distance is very close (<30m), still consider it
  if (best.distance_m < 30) {
    return best
  }

  return null
}

/**
 * Link an existing place to an OpenBeta area by setting openbeta_id.
 * Optionally enrich missing fields (description, disciplines).
 */
async function linkExistingPlace(
  placeId: string,
  openbetaId: string,
  enrichData: Partial<{ description: string; disciplines: string[] }>
): Promise<boolean> {
  const update: Record<string, unknown> = { openbeta_id: openbetaId }

  if (enrichData.description) {
    // Only set description if existing place has none
    update.description = enrichData.description
  }

  const { error } = await supabase
    .from("places")
    .update(update)
    .eq("id", placeId)
    .is("openbeta_id", null) // Don't overwrite existing links

  if (error) {
    console.error(`   ❌ Failed to link place ${placeId}:`, error.message)
    return false
  }

  return true
}

/**
 * Insert a new place from OpenBeta data.
 */
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
    // Duplicate slug or other constraint violation
    if (error.code === "23505") {
      // Try to fetch existing
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
 * Bulk insert routes for a given place.
 */
async function insertRoutes(
  placeId: string,
  routes: OpenBetaRouteInsert[]
): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0
  let skipped = 0

  for (let i = 0; i < routes.length; i += BATCH_SIZE) {
    const batch = routes.slice(i, i + BATCH_SIZE).map((r) => ({
      ...r,
      place_id: placeId,
    }))

    const { data, error } = await supabase
      .from("routes")
      .upsert(batch, { onConflict: "external_id", ignoreDuplicates: true })
      .select("id")

    if (error) {
      console.error(`   ❌ Route batch failed:`, error.message)
      skipped += batch.length
    } else {
      inserted += data?.length ?? batch.length
    }
  }

  return { inserted, skipped }
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log("🧗 Crux — OpenBeta Seed Script (Canada)")
  console.log("=".repeat(55))

  if (DRY_RUN) {
    console.log("🏜️  DRY RUN MODE — no database writes\n")
  }

  // Step 1: Fetch all Canadian leaf areas
  console.log("\n📡 Phase 1: Fetching Canadian leaf areas from OpenBeta…")
  const leafAreas = await fetchAllLeafAreas(["Canada"], RATE_DELAY_MS)
  console.log(`\n✅ Found ${leafAreas.length} leaf areas\n`)

  if (leafAreas.length === 0) {
    console.log("⚠️  No areas found. Exiting.")
    return
  }

  // Stats tracking
  let matched = 0
  let newPlaces = 0
  let totalRoutes = 0
  let routeErrors = 0
  let skippedAreas = 0

  // Step 2: Process each leaf area
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

    // Step 2a: Try to match to existing place
    let placeId: string | null = null
    const existingMatch = await findExistingMatch(
      normalized.latitude,
      normalized.longitude,
      normalized.name
    )

    if (existingMatch) {
      // Link existing place
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
      // Insert as new place
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

    // Step 2b: Fetch and insert routes
    if (placeId && area.totalClimbs > 0) {
      await sleep(RATE_DELAY_MS)
      const climbs = await fetchClimbsForArea(area.uuid)
      const normalizedRoutes = normalizeClimbs(climbs)

      if (normalizedRoutes.length > 0) {
        const { inserted, skipped } = await insertRoutes(placeId, normalizedRoutes)
        totalRoutes += inserted
        routeErrors += skipped
        process.stdout.write(`   📋 ${inserted} routes inserted`)
        if (skipped > 0) process.stdout.write(`, ${skipped} errors`)
        console.log()
      }
    }

    // Rate limit between areas
    await sleep(500)
  }

  // Step 3: Summary
  console.log()
  console.log("=".repeat(55))
  console.log("🏁 OpenBeta Seed Complete!")
  console.log(`   📍 Areas processed:  ${leafAreas.length}`)
  console.log(`   🔗 Matched to OSM:   ${matched}`)
  console.log(`   ✨ New places:       ${newPlaces}`)
  console.log(`   📋 Routes inserted:  ${totalRoutes}`)
  console.log(`   ⚠️  Skipped areas:   ${skippedAreas}`)
  console.log(`   ❌ Route errors:     ${routeErrors}`)
}

main().catch((err) => {
  console.error("💥 Unexpected error:", err)
  process.exit(1)
})
