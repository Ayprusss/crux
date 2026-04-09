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
        <h3 className="font-bold text-sm text-foreground leading-tight flex items-center gap-1.5">
          {place.name}
          {place.verified && (
            <span className="shrink-0 flex items-center justify-center bg-blue-500 rounded-full w-4 h-4" title="Admin Verified">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          )}
        </h3>
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
