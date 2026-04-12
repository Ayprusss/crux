"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ConditionStatus, CrowdLevel } from "@/types/condition"
import { createAdminClient } from "@/lib/supabase/server"

export interface ConditionPayload {
  status: ConditionStatus
  crowd_level: CrowdLevel
  notes?: string
}

export async function submitConditionReport(placeId: string, payload: ConditionPayload) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("You must be logged in to submit a condition report.")
  }

  // 1. Validate the Place is an Outdoor Place
  // Admin client bypasses RLS just to quickly check place metadata
  const adminClient = createAdminClient()
  const { data: place, error: placeError } = await adminClient
    .from("places")
    .select("environment")
    .eq("id", placeId)
    .single()

  if (placeError || !place) {
    throw new Error("Could not fetch the location.")
  }

  if (place.environment === "indoor") {
    throw new Error("Condition reports are not supported for indoor locations.")
  }

  // 2. Submit the report
  const { error } = await supabase
    .from("conditions")
    .insert({
      place_id: placeId,
      user_id: user.id,
      status: payload.status,
      crowd_level: payload.crowd_level,
      notes: payload.notes || null,
    })

  if (error) {
    console.error("Condition submit error:", error)
    throw new Error("Failed to submit condition report.")
  }

  revalidatePath("/map")
}

export async function getRecentConditions(placeId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("conditions")
    .select("*")
    .eq("place_id", placeId)
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) {
    console.error("Failed to fetch conditions", error)
    return []
  }

  return data
}
