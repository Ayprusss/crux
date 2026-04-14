"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Search, X, MapPin, Loader2 } from "lucide-react"

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  type: string
}

interface SearchBarProps {
  onSelect: (lat: number, lng: number, name: string) => void
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<NominatimResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cacheRef = useRef<Record<string, NominatimResult[]>>({})

  /** Geocode the query via Nominatim */
  const geocode = useCallback(async (q: string) => {
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
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&countrycodes=ca,us`,
        {
          headers: { "User-Agent": "CruxClimbingMap/1.0" },
        }
      )
      const data: NominatimResult[] = await res.json()
      cacheRef.current[q] = data
      setResults(data)
      setIsOpen(data.length > 0)
    } catch (err) {
      console.error("Geocoding failed:", err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  /** Debounced input handler */
  const onInputChange = (value: string) => {
    setQuery(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      geocode(value)
    }, 350)
  }

  /** Handle result selection */
  const handleSelect = (result: NominatimResult) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)

    // Use a short display name (first two parts)
    const shortName = result.display_name.split(",").slice(0, 2).join(",").trim()
    setQuery(shortName)
    setIsOpen(false)
    setResults([])
    onSelect(lat, lng, shortName)
  }

  /** Clear input */
  const handleClear = () => {
    setQuery("")
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  /** Close dropdown on outside click */
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

  /** Cleanup debounce on unmount */
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative w-full max-w-sm z-50">
      {/* Input */}
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
          placeholder="Search locations…"
          className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none"
        />
        {loading && <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />}
        {query && !loading && (
          <button onClick={handleClear} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-background border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {results.map((result) => {
            const parts = result.display_name.split(",")
            const primary = parts.slice(0, 2).join(",").trim()
            const secondary = parts.slice(2, 4).join(",").trim()

            return (
              <button
                key={result.place_id}
                onClick={() => handleSelect(result)}
                className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-muted/60 transition-colors group"
              >
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{primary}</p>
                  {secondary && (
                    <p className="text-xs text-muted-foreground truncate">{secondary}</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
