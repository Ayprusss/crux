"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase/client"
import type { Place, MapBounds } from "@/types/place"

const PAGE_SIZE = 1000

/**
 * Fetch ALL places from Supabase by paginating through the results.
 * This loads the entire dataset into memory once on mount.
 */
async function fetchAllPlaces(): Promise<Place[]> {
  const allPlaces: Place[] = []
  let page = 0
  let hasMore = true

  while (hasMore) {
    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error } = await supabase
      .from("places")
      .select("*")
      .range(from, to)

    if (error) {
      console.error("Failed to fetch places:", error.message)
      break
    }

    if (data && data.length > 0) {
      allPlaces.push(...(data as Place[]))
      hasMore = data.length === PAGE_SIZE // if we got a full page, there might be more
      page++
    } else {
      hasMore = false
    }
  }

  return allPlaces
}

/**
 * Check if a place falls within the given map bounds.
 */
function isInBounds(place: Place, bounds: MapBounds): boolean {
  return (
    place.latitude >= bounds.south &&
    place.latitude <= bounds.north &&
    place.longitude >= bounds.west &&
    place.longitude <= bounds.east
  )
}

/**
 * Hook that loads ALL places once on mount and filters them
 * client-side based on the current viewport bounds.
 *
 * This is fast and avoids repeated network requests on every pan/zoom.
 */
export function usePlaces(bounds: MapBounds | null) {
  const [allPlaces, setAllPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load all places once on mount
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const places = await fetchAllPlaces()
        if (!cancelled) {
          setAllPlaces(places)
          console.log(`📦 Cached ${places.length} places in memory`)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load places")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  // Filter by current viewport bounds (instant, no network call)
  const places = useMemo(() => {
    if (!bounds || allPlaces.length === 0) return allPlaces
    return allPlaces.filter((p) => isInBounds(p, bounds))
  }, [allPlaces, bounds])

  return { places, loading, error, totalCached: allPlaces.length }
}
