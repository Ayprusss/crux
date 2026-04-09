"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import Navbar from "@/components/layout/Navbar"
import SavedPlacesPanel from "@/components/places/SavedPlacesPanel"

// Dynamically import MapContainer with SSR disabled (MapLibre needs the browser)
const MapContainer = dynamic(() => import("@/components/map/MapContainer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted/20">
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 rounded-full bg-primary animate-pulse" />
        <span className="text-sm font-medium text-muted-foreground">Loading map…</span>
      </div>
    </div>
  ),
})

export default function MapPage() {
  const [isSavedOpen, setIsSavedOpen] = useState(false)
  const [jumpCoords, setJumpCoords] = useState<{lat: number, lng: number} | null>(null)

  return (
    <div className="flex flex-col h-screen bg-background font-sans">
      <Navbar showMapButton={false} onToggleSaved={() => setIsSavedOpen(!isSavedOpen)} />
      <main className="flex-1 relative overflow-hidden">
        <MapContainer jumpCoords={jumpCoords} />
        
        {isSavedOpen && (
          <SavedPlacesPanel 
            onClose={() => setIsSavedOpen(false)}
            onJumpToMap={(lat, lng) => setJumpCoords({ lat, lng })}
          />
        )}
      </main>
    </div>
  )
}
