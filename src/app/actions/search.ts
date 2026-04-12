"use server"

import { createClient } from "@/lib/supabase/server"
import type { Place } from "@/types/place"

/**
 * Perform a full-text search against the local 'places' table.
 * Uses the custom RPC function created in the SQL migration.
 */
export async function searchClimbingPlaces(query: string) {
  if (query.length < 3) return []

  const supabase = await createClient()

  const { data, error } = await supabase
    .rpc("search_places", { 
       search_query: query 
    })

  if (error) {
    console.error("Local search failed:", error)
    return []
  }

  return (data || []) as Place[]
}
