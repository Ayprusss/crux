export type ConditionStatus = "dry" | "wet" | "mixed" | "snow"
export type CrowdLevel = "empty" | "moderate" | "crowded"

export interface ConditionReport {
  id: string
  place_id: string
  user_id: string
  status: ConditionStatus
  crowd_level: CrowdLevel
  notes: string | null
  created_at: string
}
