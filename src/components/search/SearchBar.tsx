"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Search, X, MapPin, Loader2, Mountain, Activity, Map as MapIcon } from "lucide-react"
import { searchClimbingPlaces } from "@/app/actions/search"
import type { Place } from "@/types/place"

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  type: string
}

interface UnifiedResult {
  id: string
  name: string
  secondary?: string
  lat: number
  lng: number
  type: "place" | "address"
  category?: string // gym, crag, etc
  placeData?: Place
}

interface SearchBarProps {
  onSelect: (lat: number, lng: number, name: string, place?: Place) => void
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<UnifiedResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cacheRef = useRef<Record<string, UnifiedResult[]>>({})

  const hybridSearch = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([])
      setIsOpen(false)
      return
    }

    if (cacheRef.current[q]) {
      setResults(cacheRef.current[q])
      setIsOpen(cacheRef.current[q].length > 0)
      return
    }

    setLoading(true)

    try {
      // Parallelize local DB search and global Nominatim geocoding
      const [localData, nominatimResponse] = await Promise.all([
        searchClimbingPlaces(q),
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&countrycodes=ca,us`,
          { headers: { "User-Agent": "CruxClimbingMap/1.0" } }
        ).then(res => res.json() as Promise<NominatimResult[]>)
      ])

      const unified: UnifiedResult[] = [];

      // 1. Process Local Climbing Places (High Priority)
      if (Array.isArray(localData)) {
        localData.forEach(place => {
          unified.push({
            id: place.id,
            name: place.name,
            secondary: `${place.city || ''}${place.region ? `, ${place.region}` : ''}`,
            lat: place.latitude,
            lng: place.longitude,
            type: "place",
            category: place.type,
            placeData: place
          })
        })
      }

      // 2. Process Nominatim Results (Avoid duplicates where possible)
      if (Array.isArray(nominatimResponse)) {
        nominatimResponse.forEach(res => {
          const parts = res.display_name.split(",")
          unified.push({
            id: `osm-${res.place_id}`,
            name: parts.slice(0, 2).join(",").trim(),
            secondary: parts.slice(2, 4).join(",").trim(),
            lat: parseFloat(res.lat),
            lng: parseFloat(res.lon),
            type: "address"
          })
        })
      }

      cacheRef.current[q] = unified
      setResults(unified)
      setIsOpen(unified.length > 0)
    } catch (err) {
      console.error("Search failed:", err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const onInputChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      hybridSearch(value)
    }, 350)
  }

  const handleSelect = (result: UnifiedResult) => {
    setQuery(result.name)
    setIsOpen(false)
    setResults([])
    onSelect(result.lat, result.lng, result.name, result.placeData)
  }

  const handleClear = () => {
    setQuery("")
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative w-full max-w-sm z-50">
      <div
        className={`flex items-center gap-2 bg-background border rounded-xl px-3 h-10 shadow-sm transition-all duration-200 ${
          focused ? "ring-2 ring-primary/30 border-primary/50 shadow-md" : "hover:border-foreground/20"
        }`}
      >
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onInputChange(e.target.value)}
          onFocus={() => {
            setFocused(true)
            if (results.length > 0) setIsOpen(true)
          }}
          placeholder="Gyms, crags, or cities…"
          className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none"
        />
        {loading && <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />}
        {query && !loading && (
          <button onClick={handleClear} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-background border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 py-1">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => handleSelect(result)}
              className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-muted/60 transition-colors group"
            >
              <div className="mt-0.5 shrink-0">
                {result.type === "place" ? (
                  result.category === "gym" ? (
                    <Activity className="h-4 w-4 text-primary" />
                  ) : (
                    <Mountain className="h-4 w-4 text-primary" />
                  )
                ) : (
                  <MapPin className="h-4 w-4 text-muted-foreground opacity-60 group-hover:opacity-100" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-foreground truncate">{result.name}</p>
                  {result.type === "place" && (
                    <span className="text-[10px] font-black uppercase tracking-tighter bg-primary/10 text-primary px-1.5 py-0.5 rounded leading-none">
                      Climbing
                    </span>
                  )}
                </div>
                {result.secondary && (
                  <p className="text-xs text-muted-foreground truncate font-medium">{result.secondary}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

