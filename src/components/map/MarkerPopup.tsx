"use client"

import type { Place } from "@/types/place"

interface MarkerPopupProps {
  place: Place
  onClose: () => void
  onViewDetails: (place: Place) => void
  isClosing?: boolean
}

export default function MarkerPopup({ place, onClose, onViewDetails, isClosing = false }: MarkerPopupProps) {
  return (
    <div className={`bg-background border rounded-xl shadow-xl p-4 min-w-[220px] max-w-[280px] duration-200 ${isClosing ? "animate-out fade-out zoom-out-95 fill-mode-forwards" : "animate-in fade-in zoom-in-95"}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-sm text-foreground leading-tight">{place.name}</h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0 text-lg leading-none"
          aria-label="Close popup"
        >
          ×
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary">
          {place.type}
        </span>
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-accent text-accent-foreground">
          {place.environment}
        </span>
      </div>

      {place.city && (
        <p className="text-xs text-muted-foreground mb-3">{place.city}{place.region ? `, ${place.region}` : ""}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(place)}
          className="flex-1 text-xs font-semibold rounded-lg px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          View Details
        </button>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold rounded-lg px-3 py-1.5 border hover:bg-muted transition-colors"
        >
          Navigate
        </a>
      </div>
    </div>
  )
}
