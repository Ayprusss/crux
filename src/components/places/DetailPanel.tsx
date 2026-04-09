"use client"

import { X, MapPin, Navigation, Clock, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Place } from "@/types/place"

interface DetailPanelProps {
  place: Place
  onClose: () => void
}

export default function DetailPanel({ place, onClose }: DetailPanelProps) {
  return (
    <div className="absolute top-0 right-0 h-full w-full sm:w-[400px] bg-background border-l shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-foreground truncate">{place.name}</h2>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
              {place.type}
            </span>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-accent text-accent-foreground">
              {place.environment}
            </span>
            {place.verified && (
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700">
                ✓ Verified
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0 ml-4"
          aria-label="Close detail panel"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Location */}
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Location</p>
            <p className="text-sm text-muted-foreground">
              {place.address || "Address not available"}
            </p>
            {place.city && (
              <p className="text-sm text-muted-foreground">
                {place.city}{place.region ? `, ${place.region}` : ""}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
            </p>
          </div>
        </div>

        {/* Disciplines */}
        {place.disciplines.length > 0 && (
          <div className="flex items-start gap-3">
            <Tag className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1.5">Disciplines</p>
              <div className="flex flex-wrap gap-1.5">
                {place.disciplines.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {place.description && (
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Description</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{place.description}</p>
          </div>
        )}

        {/* Source info */}
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground">
              Source: {place.source.toUpperCase()} · Added {new Date(place.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="p-4 border-t bg-muted/30">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <Button className="w-full rounded-xl font-bold shadow-md shadow-primary/10 h-11">
            <Navigation className="mr-2 h-4 w-4" />
            Open in Google Maps
          </Button>
        </a>
      </div>
    </div>
  )
}
