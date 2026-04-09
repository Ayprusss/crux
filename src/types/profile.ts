export type UserRole = "user" | "moderator" | "admin"

export interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  role: UserRole
  is_admin: boolean
  bio: string | null
  favorite_disciplines: string[]
  location_city: string | null
  location_region: string | null
  suggestions_count: number
  created_at: string
  updated_at: string
}
