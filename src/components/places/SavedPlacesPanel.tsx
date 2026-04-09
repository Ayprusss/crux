"use client"

import { useEffect, useState } from "react"
import { X, HeartCrack, Loader2 } from "lucide-react"
import type { Place } from "@/types/place"
import { useFavorites } from "@/hooks/useFavorites"
import { createClient } from "@/lib/supabase/client"
import PlaceCard from "./PlaceCard"

interface SavedPlacesPanelProps {
  onClose: () => void
  onJumpToMap: (lat: number, lng: number) => void
}

export default function SavedPlacesPanel({ onClose, onJumpToMap }: SavedPlacesPanelProps) {
  const { savedIds, toggleFavorite, isLoaded: favoritesLoaded } = useFavorites()
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch saved places data
  useEffect(() => {
    let cancelled = false
    
    async function fetchSavedPlaces() {
      if (!favoritesLoaded) return
      
      if (savedIds.length === 0) {
        if (!cancelled) {
          setPlaces([])
          setLoading(false)
        }
        return
      }

      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .in("id", savedIds)

      if (!cancelled) {
        if (!error && data) {
          setPlaces(data as Place[])
        }
        setLoading(false)
      }
    }

    fetchSavedPlaces()

    return () => {
      cancelled = true
    }
  }, [favoritesLoaded, savedIds])

  return (
    <div className="absolute top-0 left-0 h-full w-full sm:w-[360px] bg-background border-r shadow-2xl z-50 flex flex-col animate-in slide-in-from-left duration-300 pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b shrink-0">
        <h2 className="text-xl font-bold text-foreground">Saved Places</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0"
          aria-label="Close saved panel"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading mapped places...</p>
          </div>
        ) : places.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4 px-6 text-center">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
              <HeartCrack className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm">You haven't saved any places yet. Click the heart icon on any place to find it here later!</p>
          </div>
        ) : (
          places.map((place) => (
            <PlaceCard 
              key={place.id} 
              place={place} 
              onJumpToMap={(lat, lng) => {
                onJumpToMap(lat, lng)
                // Optional: For mobile, auto-close the drawer when jumping
                if (window.innerWidth < 640) {
                  onClose()
                }
              }}
              onRemove={toggleFavorite} 
            />
          ))
        )}
      </div>
    </div>
  )
}
