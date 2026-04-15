"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { Place } from "@/types/place"
import type { Suggestion, SuggestionUpdatePayload } from "@/types/suggestion"

export async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  return data?.role === "admin" || data?.role === "moderator"
}

export async function checkSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  return data?.role === "admin"
}

export async function rejectSuggestion(suggestionId: string, reviewerNotes?: string) {
  if (!(await checkAdmin())) throw new Error("Unauthorized")

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not logged in")

  const payload: SuggestionUpdatePayload = {
    status: "rejected",
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString()
  }

  if (reviewerNotes) {
    payload.notes = reviewerNotes
  }

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from("suggestions")
    .update(payload)
    .eq("id", suggestionId)

  if (error) throw error
  revalidatePath("/admin", "layout")
  redirect("/admin/suggestions")
}

export async function approveSuggestion(suggestionId: string, reviewerNotes?: string) {
  if (!(await checkAdmin())) throw new Error("Unauthorized")

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not logged in")

  const adminClient = createAdminClient()

  // 1. Fetch the suggestion
  const { data, error: fetchError } = await adminClient
    .from("suggestions")
    .select("*")
    .eq("id", suggestionId)
    .single()

  if (fetchError || !data) throw new Error("Suggestion not found")

  const suggestion = data as Suggestion
  if (suggestion.status !== "pending") throw new Error("Suggestion already processed")

  let newPlaceId = suggestion.place_id
  const proposedData = suggestion.data as Partial<Place> & { isDelete?: boolean }

  // 2. Apply to DB
  if (suggestion.action === "add") {
    const { data: newPlace, error: insertError } = await adminClient
      .from("places")
      .insert({
        name: proposedData.name,
        type: proposedData.type,
        environment: proposedData.environment,
        latitude: proposedData.latitude,
        longitude: proposedData.longitude,
        location: `SRID=4326;POINT(${proposedData.longitude} ${proposedData.latitude})`,
        description: proposedData.description,
        disciplines: proposedData.disciplines || [],
        amenities: proposedData.amenities || [],
        source: "user",
        submitted_by: suggestion.user_id,
        verified: true, // Auto verify since admin is approving
      })
      .select("id")
      .single()

    if (insertError) throw insertError
    newPlaceId = newPlace.id
  } else if (suggestion.action === "edit" && suggestion.place_id) {
    if (proposedData.isDelete) {
      const { error: deleteError } = await adminClient
        .from("places")
        .delete()
        .eq("id", suggestion.place_id)

      if (deleteError) throw deleteError
    } else {
      const updatePayload: Partial<Place> & { location?: string } = {
        name: proposedData.name,
        type: proposedData.type,
        environment: proposedData.environment,
        description: proposedData.description,
        disciplines: proposedData.disciplines || [],
        amenities: proposedData.amenities || [],
        verified: true // Marking verified since admin touched it
      }

      if (proposedData.latitude && proposedData.longitude) {
        updatePayload.latitude = proposedData.latitude
        updatePayload.longitude = proposedData.longitude
        updatePayload.location = `SRID=4326;POINT(${proposedData.longitude} ${proposedData.latitude})`
      }

      const { error: updateError } = await adminClient
        .from("places")
        .update(updatePayload)
        .eq("id", suggestion.place_id)

      if (updateError) throw updateError
    }
  }

  // 3. Mark suggestion approved
  const payload: SuggestionUpdatePayload = {
    status: "approved",
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString()
  }

  if (reviewerNotes) payload.notes = reviewerNotes
  if (suggestion.action === "add") payload.place_id = newPlaceId as string // link new place

  const { data: updatedSuggestion, error: finalError } = await adminClient
    .from("suggestions")
    .update(payload)
    .eq("id", suggestionId)
    .select()

  if (finalError) throw finalError
  
  if (!updatedSuggestion || updatedSuggestion.length === 0) {
    console.error("CRITICAL: Failed to update suggestion status. RLS policy might be blocking the UPDATE for admin users.")
  }

  revalidatePath("/admin", "layout")
  revalidatePath("/map")
  redirect("/admin/suggestions")
}

// ==========================================
// ROLE ESCALATION (DUAL-APPROVAL)
// ==========================================

export async function nominateUser(targetId: string) {
  if (!(await checkSuperAdmin())) throw new Error("Unauthorized")

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not logged in")

  // Target user check
  const { data: targetProfile, error: profileErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", targetId)
    .single()

  if (profileErr || !targetProfile) throw new Error("User not found")
  if (targetProfile.role === "admin") throw new Error("User is already an Admin")

  // Ensure no pending request exists
  const { data: existing } = await supabase
    .from("role_escalations")
    .select("id")
    .eq("target_user_id", targetId)
    .eq("status", "pending")
    .maybeSingle()

  if (existing) throw new Error("An active nomination already exists for this user")

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from("role_escalations")
    .insert({
      target_user_id: targetId,
      requested_role: "admin",
      nominated_by: user.id
    })

  if (error) throw error
  revalidatePath("/admin", "layout")
}

export async function approveEscalation(escalationId: string) {
  if (!(await checkSuperAdmin())) throw new Error("Unauthorized")

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not logged in")

  // Fetch escalation
  const { data: escalation, error: escErr } = await supabase
    .from("role_escalations")
    .select("*")
    .eq("id", escalationId)
    .single()

  if (escErr || !escalation) throw new Error("Nomination not found")
  if (escalation.status !== "pending") throw new Error("Nomination already processed")

  // Dual approval math
  if (escalation.nominated_by === user.id) {
    throw new Error("You cannot approve your own nomination.")
  }

  const adminClient = createAdminClient()

  // Update profile
  const { error: upgradeErr } = await adminClient
    .from("profiles")
    .update({
      role: escalation.requested_role
    })
    .eq("id", escalation.target_user_id)

  if (upgradeErr) throw upgradeErr

  // Close escalation
  const { error: closeErr } = await adminClient
    .from("role_escalations")
    .update({
      status: "approved",
      approved_by: user.id
    })
    .eq("id", escalationId)

  if (closeErr) throw closeErr

  revalidatePath("/admin", "layout")
}

export async function rejectEscalation(escalationId: string) {
  if (!(await checkSuperAdmin())) throw new Error("Unauthorized")

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not logged in")

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from("role_escalations")
    .update({ status: "rejected" })
    .eq("id", escalationId)
    .eq("status", "pending")

  if (error) throw error

  revalidatePath("/admin", "layout")
}

// ==========================================
// PLACE VERIFICATION
// ==========================================

export async function verifyPlace(placeId: string) {
  if (!(await checkAdmin())) throw new Error("Unauthorized")

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from("places")
    .update({ verified: true })
    .eq("id", placeId)

  if (error) throw error

  revalidatePath("/map", "page")
  revalidatePath("/admin", "layout")
}

// ==========================================
// PLACE CURATION
// ==========================================

export interface CurationPayload {
  operating_hours?: Record<string, string> | null
  photos?: string[] | null
  amenities?: string[]
}

export async function curatePlace(placeId: string, payload: CurationPayload) {
  if (!(await checkAdmin())) throw new Error("Unauthorized")

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from("places")
    .update({ 
      ...payload,
      source: "curated",
      verified: true // Usually if we curate it, it's also verified
    })
    .eq("id", placeId)

  if (error) throw error

  revalidatePath("/map")
  revalidatePath("/admin", "layout")
}
