"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Place } from "@/types/place"

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

export async function rejectSuggestion(suggestionId: string, reviewerNotes?: string) {
  if (!(await checkAdmin())) throw new Error("Unauthorized")

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not logged in")

  const payload: any = {
    status: "rejected",
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString()
  }
  
  if (reviewerNotes) {
    payload.notes = reviewerNotes
  }

  const { error } = await supabase
    .from("suggestions")
    .update(payload)
    .eq("id", suggestionId)

  if (error) throw error
  revalidatePath("/admin/suggestions")
}

export async function approveSuggestion(suggestionId: string, reviewerNotes?: string) {
  if (!(await checkAdmin())) throw new Error("Unauthorized")

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not logged in")

  // 1. Fetch the suggestion
  const { data: suggestion, error: fetchError } = await supabase
    .from("suggestions")
    .select("*")
    .eq("id", suggestionId)
    .single()

  if (fetchError || !suggestion) throw new Error("Suggestion not found")
  if (suggestion.status !== "pending") throw new Error("Suggestion already processed")

  let newPlaceId = suggestion.place_id
  const proposedData = suggestion.data as Partial<Place>

  // 2. Apply to DB
  if (suggestion.action === "add") {
    const { data: newPlace, error: insertError } = await supabase
      .from("places")
      .insert({
        name: proposedData.name,
        type: proposedData.type,
        environment: proposedData.environment,
        latitude: proposedData.latitude,
        longitude: proposedData.longitude,
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
    const { error: updateError } = await supabase
      .from("places")
      .update({
        name: proposedData.name,
        type: proposedData.type,
        environment: proposedData.environment,
        description: proposedData.description,
        disciplines: proposedData.disciplines || [],
        amenities: proposedData.amenities || [],
        verified: true // Marking verified since admin touched it
      })
      .eq("id", suggestion.place_id)

    if (updateError) throw updateError
  }

  // 3. Mark suggestion approved
  const payload: any = {
    status: "approved",
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString()
  }
  
  if (reviewerNotes) payload.notes = reviewerNotes
  if (suggestion.action === "add") payload.place_id = newPlaceId // link new place

  const { error: finalError } = await supabase
    .from("suggestions")
    .update(payload)
    .eq("id", suggestionId)

  if (finalError) throw finalError

  revalidatePath("/admin/suggestions")
  revalidatePath("/map")
}

// ==========================================
// ROLE ESCALATION (DUAL-APPROVAL)
// ==========================================

export async function nominateUser(targetId: string) {
  if (!(await checkAdmin())) throw new Error("Unauthorized")

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

  const { error } = await supabase
    .from("role_escalations")
    .insert({
      target_user_id: targetId,
      requested_role: "admin",
      nominated_by: user.id
    })

  if (error) throw error
  revalidatePath("/admin/users")
}

export async function approveEscalation(escalationId: string) {
  if (!(await checkAdmin())) throw new Error("Unauthorized")

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

  // Update profile
  const { error: upgradeErr } = await supabase
    .from("profiles")
    .update({ 
      role: escalation.requested_role,
      is_admin: escalation.requested_role === "admin" 
    })
    .eq("id", escalation.target_user_id)

  if (upgradeErr) throw upgradeErr

  // Close escalation
  const { error: closeErr } = await supabase
    .from("role_escalations")
    .update({
      status: "approved",
      approved_by: user.id
    })
    .eq("id", escalationId)

  if (closeErr) throw closeErr
  
  revalidatePath("/admin/users")
}

export async function rejectEscalation(escalationId: string) {
  if (!(await checkAdmin())) throw new Error("Unauthorized")

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not logged in")

  const { error } = await supabase
    .from("role_escalations")
    .update({ status: "rejected" })
    .eq("id", escalationId)
    .eq("status", "pending")

  if (error) throw error

  revalidatePath("/admin/users")
}
