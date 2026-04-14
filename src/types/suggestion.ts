import type { Place } from "./place"

export type SuggestionStatus = "pending" | "approved" | "rejected"
export type SuggestionAction = "add" | "edit"

export interface Suggestion {
  id: string
  status: SuggestionStatus
  action: SuggestionAction
  data: Partial<Place> & { isDelete?: boolean }
  user_id: string
  place_id: string | null
  notes: string | null
  photos: string[] | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export interface SuggestionUpdatePayload {
  status?: SuggestionStatus
  reviewed_by?: string
  reviewed_at?: string
  notes?: string
  place_id?: string
}
