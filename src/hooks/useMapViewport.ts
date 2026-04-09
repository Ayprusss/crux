"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { MapBounds } from "@/types/place"
import { MAP_CONFIG } from "@/lib/map/config"

/**
 * Hook that tracks the current map viewport bounds with debouncing.
 * Returns the stable, debounced bounds and an update function to
 * call on every map move event.
 */
export function useMapViewport() {
  const [bounds, setBounds] = useState<MapBounds | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateBounds = useCallback((newBounds: MapBounds) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setBounds(newBounds)
    }, MAP_CONFIG.viewportDebounceMs)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return { bounds, updateBounds }
}
