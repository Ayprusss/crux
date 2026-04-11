"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { createClient } from "@/lib/supabase/client"

const FAVORITES_KEY = "crux_favorites"

export function useFavorites() {
  const { user, loading: authLoading } = useAuth()
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // System initialization & hydration
  useEffect(() => {
    if (authLoading) return // Wait for auth resolution
    let mounted = true
    const supabase = createClient()

    async function initializeFavorites() {
      if (!user) {
         // Offline mode: load from localStorage
         const stored = localStorage.getItem(FAVORITES_KEY)
         if (stored && mounted) {
           try {
             setSavedIds(JSON.parse(stored))
           } catch (e) {
             console.error("Failed to parse favorites", e)
           }
         }
         if (mounted) setIsLoaded(true)
      } else {
         // Online mode
         
         // 1. Sync any existing local favorites to the cloud instantly
         const stored = localStorage.getItem(FAVORITES_KEY)
         if (stored) {
            try {
               const localIds = JSON.parse(stored) as string[]
               if (localIds.length > 0) {
                  // Push to DB
                  const payload = localIds.map(place_id => ({ user_id: user.id, place_id }))
                  // Using upsert safely with unique composite key
                  await supabase.from("user_saved_places").upsert(payload, { onConflict: "user_id,place_id" })
               }
               // Wipe local storage so it doesn't leak or duplicate
               localStorage.removeItem(FAVORITES_KEY)
            } catch(e) {
               console.error("Failed to sync local favorites to cloud", e)
            }
         }

         // 2. Fetch authenticated favorites
         const { data, error } = await supabase
           .from("user_saved_places")
           .select("place_id")
           .eq("user_id", user.id)

         if (mounted && data && !error) {
           setSavedIds(data.map(d => d.place_id))
         }
         if (mounted) setIsLoaded(true)
      }
    }

    initializeFavorites()

    return () => { mounted = false }
  }, [user, authLoading])

  // Toggle Action
  const toggleFavorite = useCallback(async (id: string) => {
    // 1. Optimistic UI update instantly for blazing fast response
    setSavedIds(prev => {
        const isRemoving = prev.includes(id)
        const newIds = isRemoving 
           ? prev.filter(savedId => savedId !== id) 
           : [...prev, id]
        
        // 2. Determine where to write the persistent data
        if (!user) {
            // Write to localStorage if completely logged out
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(newIds))
        } else {
            // Write to remote database natively
            const supabase = createClient()
            if (isRemoving) {
               supabase
                 .from("user_saved_places")
                 .delete()
                 .eq("user_id", user.id)
                 .eq("place_id", id)
                 .then() // fire and forget
            } else {
               supabase
                 .from("user_saved_places")
                 .insert({ user_id: user.id, place_id: id })
                 .then() // fire and forget
            }
        }
        
        return newIds
    })
  }, [user])

  const isFavorite = useCallback(
    (id: string) => savedIds.includes(id),
    [savedIds]
  )

  return {
    savedIds,
    toggleFavorite,
    isFavorite,
    isLoaded,
  }
}
