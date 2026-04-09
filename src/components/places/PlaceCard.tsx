"use client"

import { MapPin, Navigation, LayoutGrid, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Place } from "@/types/place"

interface PlaceCardProps {
  place: Place
  onJumpToMap?: (lat: number, lng: number) => void
  onRemove?: (id: string) => void
}

export default function PlaceCard({ place, onJumpToMap, onRemove }: PlaceCardProps) {
  return (
    <div className="bg-muted/30 border rounded-xl p-4 flex flex-col gap-3 relative group transition-colors hover:bg-muted/50">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-bold text-sm text-foreground truncate">{place.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {place.city}{place.region ? `, ${place.region}` : ""}
          </p>
        </div>
        {onRemove && (
          <button 
            onClick={() => onRemove(place.id)}
            className="p-1.5 shrink-0 text-red-500 bg-red-500/10 rounded-md hover:bg-red-500/20 transition-colors"
            aria-label="Remove favorite"
          >
            <Heart className="h-4 w-4" fill="currentColor" />
          </button>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary">
          {place.type}
        </span>
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-accent text-accent-foreground">
          {place.environment}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-1">
        {onJumpToMap && (
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 h-8 text-xs rounded-lg"
            onClick={() => onJumpToMap(place.latitude, place.longitude)}
          >
            <LayoutGrid className="mr-1.5 h-3 w-3" />
            View
          </Button>
        )}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg px-3">
            <Navigation className="h-3 w-3" />
          </Button>
        </a>
      </div>
    </div>
  )
}
