import dotenv from "dotenv"
import path from "path"

// Load .env.local (Next.js convention)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

import { createClient } from "@supabase/supabase-js"
import { buildClimbingQuery, fetchOverpassData, REGIONS } from "../src/lib/overpass/fetcher"
import { normalizeElements } from "../src/lib/overpass/normalizer"
import type { PlaceInsert } from "../src/lib/overpass/normalizer"

// ── Validate env vars ────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ── Select which regions to seed ─────────────────────────────────
const SEED_REGIONS = ["PEI"]

// ── Helpers ──────────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function upsertPlaces(places: PlaceInsert[]): Promise<{ inserted: number; skipped: number }> {
  const BATCH_SIZE = 50
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

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log("🧗 Crux — OSM Seed Script (Multi-Region)")
  console.log("=".repeat(50))
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

    // 1. Fetch from Overpass
    const query = buildClimbingQuery(bbox.south, bbox.west, bbox.north, bbox.east)
    const elements = await fetchOverpassData(query)

    // 2. Normalize
    const places = normalizeElements(elements)
    console.log(`   🔄 Normalized ${places.length} valid places from ${elements.length} raw elements`)

    if (places.length === 0) {
      console.log(`   ⚠️  No places found for ${regionName}`)
      continue
    }

    // 3. Preview
    for (const place of places.slice(0, 2)) {
      console.log(`      • ${place.name} (${place.type}, ${place.environment})`)
    }
    if (places.length > 2) console.log(`      … and ${places.length - 2} more`)

    // 4. Upsert
    const { inserted, skipped } = await upsertPlaces(places)
    totalInserted += inserted
    totalSkipped += skipped
    console.log(`   ✅ ${regionName}: ${inserted} inserted/updated, ${skipped} errors`)

    // 5. Rate-limit pause between regions (Overpass API courtesy)
    if (r < SEED_REGIONS.length - 1) {
      console.log(`   ⏳ Waiting 5s before next region…`)
      await sleep(5000)
    }
  }

  console.log(`\n${"=".repeat(50)}`)
  console.log(`🏁 All done! Total inserted/updated: ${totalInserted}, Total errors: ${totalSkipped}`)
}

main().catch((err) => {
  console.error("💥 Unexpected error:", err)
  process.exit(1)
})

