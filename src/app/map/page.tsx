"use client"

import dynamic from "next/dynamic"
import Navbar from "@/components/layout/Navbar"

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
  return (
    <div className="flex flex-col h-screen bg-background font-sans">
      <Navbar />
      <main className="flex-1 relative overflow-hidden">
        <MapContainer />
      </main>
    </div>
  )
}
