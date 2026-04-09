"use client"

import { useState, useEffect, useCallback } from "react"

const FAVORITES_KEY = "crux_favorites"

export function useFavorites() {
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY)
      if (stored) {
        setSavedIds(JSON.parse(stored))
      }
    } catch (e) {
      console.error("Failed to parse favorites from local storage", e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save to local storage whenever savedIds change (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(savedIds))
    }
  }, [savedIds, isLoaded])

  const toggleFavorite = useCallback((id: string) => {
    setSavedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((savedId) => savedId !== id)
      } else {
        return [...prev, id]
      }
    })
  }, [])

  const isFavorite = useCallback(
    (id: string) => {
      return savedIds.includes(id)
    },
    [savedIds]
  )

  return {
    savedIds,
    toggleFavorite,
    isFavorite,
    isLoaded,
  }
}
