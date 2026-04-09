export interface Place {
  id: string
  name: string
  slug: string | null
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
  submitted_by: string | null
  source: "osm" | "user" | "curated"
  verified: boolean
  created_at: string
  updated_at: string
}

/** Bounds used for viewport-based fetching */
export interface MapBounds {
  west: number
  south: number
  east: number
  north: number
}
