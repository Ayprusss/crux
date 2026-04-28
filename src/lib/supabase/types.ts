export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      conditions: {
        Row: {
          created_at: string | null
          crowd_level: string | null
          id: string
          notes: string | null
          place_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          crowd_level?: string | null
          id?: string
          notes?: string | null
          place_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          crowd_level?: string | null
          id?: string
          notes?: string | null
          place_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conditions_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          address: string | null
          amenities: string[] | null
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          disciplines: string[] | null
          environment: string
          id: string
          latitude: number
          location: unknown
          longitude: number
          name: string
          openbeta_id: string | null
          operating_hours: Json | null
          osm_id: number | null
          photos: string[] | null
          region: string | null
          search_vector: unknown
          slug: string | null
          source: string | null
          submitted_by: string | null
          type: string
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          disciplines?: string[] | null
          environment: string
          id?: string
          latitude: number
          location: unknown
          longitude: number
          name: string
          openbeta_id?: string | null
          operating_hours?: Json | null
          osm_id?: number | null
          photos?: string[] | null
          region?: string | null
          search_vector?: unknown
          slug?: string | null
          source?: string | null
          submitted_by?: string | null
          type: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          disciplines?: string[] | null
          environment?: string
          id?: string
          latitude?: number
          location?: unknown
          longitude?: number
          name?: string
          openbeta_id?: string | null
          operating_hours?: Json | null
          osm_id?: number | null
          photos?: string[] | null
          region?: string | null
          search_vector?: unknown
          slug?: string | null
          source?: string | null
          submitted_by?: string | null
          type?: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "places_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          email: string
          favorite_disciplines: string[] | null
          id: string
          is_admin: boolean | null
          location_city: string | null
          location_region: string | null
          role: string
          suggestions_count: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          favorite_disciplines?: string[] | null
          id: string
          is_admin?: boolean | null
          location_city?: string | null
          location_region?: string | null
          role?: string
          suggestions_count?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          favorite_disciplines?: string[] | null
          id?: string
          is_admin?: boolean | null
          location_city?: string | null
          location_region?: string | null
          role?: string
          suggestions_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      role_escalations: {
        Row: {
          approved_by: string | null
          created_at: string | null
          id: string
          nominated_by: string
          requested_role: string
          status: string | null
          target_user_id: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          id?: string
          nominated_by: string
          requested_role: string
          status?: string | null
          target_user_id: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          id?: string
          nominated_by?: string
          requested_role?: string
          status?: string | null
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_escalations_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_escalations_nominated_by_fkey"
            columns: ["nominated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_escalations_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          created_at: string | null
          description: string | null
          external_id: string | null
          fa: string | null
          grade: Json | null
          id: string
          length: number | null
          name: string
          place_id: string
          protection: string | null
          source: string
          type: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          external_id?: string | null
          fa?: string | null
          grade?: Json | null
          id?: string
          length?: number | null
          name: string
          place_id: string
          protection?: string | null
          source?: string
          type?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          external_id?: string | null
          fa?: string | null
          grade?: Json | null
          id?: string
          length?: number | null
          name?: string
          place_id?: string
          protection?: string | null
          source?: string
          type?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      suggestions: {
        Row: {
          action: string
          created_at: string | null
          data: Json
          id: string
          notes: string | null
          photos: string[] | null
          place_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          data: Json
          id?: string
          notes?: string | null
          photos?: string[] | null
          place_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          data?: Json
          id?: string
          notes?: string | null
          photos?: string[] | null
          place_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestions_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_saved_places: {
        Row: {
          created_at: string | null
          place_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          place_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          place_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_saved_places_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_saved_places_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_places_within_radius: {
        Args: { lat: number; lng: number; radius_meters: number }
        Returns: number
      }
      match_place_to_openbeta: {
        Args: { p_lat: number; p_lng: number; p_name: string; p_radius_m?: number }
        Returns: {
          distance_m: number
          id: string
          name: string
          name_similarity: number
        }[]
      }
      places_in_bounds: {
        Args: { east: number; north: number; south: number; west: number }
        Returns: {
          address: string | null
          amenities: string[] | null
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          disciplines: string[] | null
          environment: string
          id: string
          latitude: number
          location: unknown
          longitude: number
          name: string
          openbeta_id: string | null
          operating_hours: Json | null
          osm_id: number | null
          photos: string[] | null
          region: string | null
          search_vector: unknown
          slug: string | null
          source: string | null
          submitted_by: string | null
          type: string
          updated_at: string | null
          verified: boolean | null
        }[]
      }
      search_places: {
        Args: { search_query: string }
        Returns: {
          address: string | null
          amenities: string[] | null
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          disciplines: string[] | null
          environment: string
          id: string
          latitude: number
          location: unknown
          longitude: number
          name: string
          openbeta_id: string | null
          operating_hours: Json | null
          osm_id: number | null
          photos: string[] | null
          region: string | null
          search_vector: unknown
          slug: string | null
          source: string | null
          submitted_by: string | null
          type: string
          updated_at: string | null
          verified: boolean | null
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
