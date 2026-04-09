/**
 * Overpass API client for fetching climbing locations from OpenStreetMap.
 */

const OVERPASS_API = "https://overpass-api.de/api/interpreter"

export interface OverpassElement {
  type: "node" | "way" | "relation"
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

interface OverpassResponse {
  elements: OverpassElement[]
}

/**
 * Named bounding boxes for Canadian climbing regions.
 */
export const REGIONS: Record<string, { south: number; west: number; north: number; east: number }> = {
  "Ontario":              { south: 41.6, west: -95.2, north: 56.9, east: -74.3 },
  "Quebec South":         { south: 44.9, west: -80.0, north: 50.0, east: -57.0 },
  "Quebec North":         { south: 50.0, west: -80.0, north: 62.6, east: -57.0 },
  "Alberta":              { south: 49.0, west: -120.0, north: 60.0, east: -110.0 },
  "British Columbia":     { south: 48.3, west: -139.1, north: 60.0, east: -114.0 },
  "Saskatchewan":         { south: 49.0, west: -110.0, north: 60.0, east: -101.4 },
  "Manitoba":             { south: 49.0, west: -102.0, north: 60.0, east: -88.9 },
  "New Brunswick":        { south: 44.6, west: -69.1, north: 48.1, east: -63.8 },
  "Nova Scotia":          { south: 43.4, west: -66.5, north: 47.1, east: -59.7 },
  "Newfoundland":         { south: 46.6, west: -59.5, north: 51.7, east: -52.6 },
  "PEI":                  { south: 45.9, west: -64.5, north: 47.1, east: -62.0 },
}

/**
 * Build an Overpass QL query for climbing spots within a bounding box.
 */
export function buildClimbingQuery(
  south: number,
  west: number,
  north: number,
  east: number
): string {
  return `
[out:json][timeout:120];
(
  node["sport"="climbing"](${south},${west},${north},${east});
  way["sport"="climbing"](${south},${west},${north},${east});
  node["leisure"="sports_centre"]["sport"="climbing"](${south},${west},${north},${east});
  node["natural"="cliff"]["climbing"="yes"](${south},${west},${north},${east});
);
out center;
`.trim()
}

/**
 * Fetch elements from the Overpass API with retry support.
 */
export async function fetchOverpassData(query: string, retries = 2): Promise<OverpassElement[]> {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    console.log(`📡 Querying Overpass API… (attempt ${attempt})`)

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 120_000) // 2 min timeout

      const response = await fetch(OVERPASS_API, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status} ${response.statusText}`)
      }

      const data: OverpassResponse = await response.json()
      console.log(`✅ Received ${data.elements.length} elements from Overpass`)
      return data.elements
    } catch (err) {
      if (attempt <= retries) {
        console.log(`⚠️  Attempt ${attempt} failed, retrying in 10s…`)
        await new Promise((r) => setTimeout(r, 10_000))
      } else {
        throw err
      }
    }
  }

  return [] // unreachable but satisfies TS
}
