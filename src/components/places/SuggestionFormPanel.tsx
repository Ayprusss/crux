"use client"

import { useState, useRef, useEffect } from "react"
import { X, Upload, Loader2, Image as ImageIcon, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Place } from "@/types/place"
import { createClient } from "@/lib/supabase/client"
import { uploadPlacePhoto } from "@/lib/supabase/storage"
import Link from "next/link"
import { useAuth } from "@/components/auth/AuthProvider"

interface SuggestionFormPanelProps {
  mode: "add" | "edit" | "delete"
  place?: Place
  coordinates?: { lat: number; lng: number }
  onClose: () => void
  onSuccess?: () => void
  onRequestMapPick?: () => void
}

const PLACE_TYPES = ["gym", "boulder", "crag", "wall", "other"] as const
const ENVIRONMENTS = ["indoor", "outdoor"] as const
const DISCIPLINES = ["sport", "trad", "bouldering", "top-rope", "lead", "ice"] as const

export default function SuggestionFormPanel({
  mode,
  place,
  coordinates,
  onClose,
  onSuccess,
  onRequestMapPick
}: SuggestionFormPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { user, loading: isAuthLoading } = useAuth()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  
  // Form State
  const [name, setName] = useState(place?.name || "")
  const [type, setType] = useState<string>(place?.type || "other")
  const [environment, setEnvironment] = useState<string>(place?.environment || "outdoor")
  const [disciplines, setDisciplines] = useState<string[]>(place?.disciplines || [])
  const [description, setDescription] = useState(place?.description || "")
  const [notes, setNotes] = useState("")
  
  // Location Handoff State
  const [internalCoords, setInternalCoords] = useState<{lat: number, lng: number} | null>(coordinates || null)
  
  // Sync if map coordinates re-enter the props
  useEffect(() => {
    if (coordinates) setInternalCoords(coordinates)
  }, [coordinates])

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchCacheRef = useRef<Record<string, any[]>>({})
  const [geoLoading, setGeoLoading] = useState(false)
  
  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleGeoSearch = (q: string) => {
    setSearchQuery(q)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    if (q.length < 3) {
      setSearchResults([])
      return
    }
    searchDebounceRef.current = setTimeout(async () => {
      if (searchCacheRef.current[q]) {
        setSearchResults(searchCacheRef.current[q])
        return
      }

      setIsSearching(true)
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&countrycodes=ca,us`, { headers: { "User-Agent": "CruxClimbingMap/1.0" } })
        const data = await res.json()
        searchCacheRef.current[q] = data
        setSearchResults(data)
      } catch (err) {
        console.error(err)
      } finally {
        setIsSearching(false)
      }
    }, 400)
  }

  const handleSelectNominatim = (result: any) => {
    setInternalCoords({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) })
    setSearchQuery(result.display_name.split(",").slice(0, 2).join(",").trim())
    setSearchResults([])
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }
    setGeoLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setInternalCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGeoLoading(false)
      },
      (err) => {
        setError("Failed to access location. Please check browser permissions.")
        setGeoLoading(false)
      },
      { timeout: 10000, maximumAge: 0 }
    )
  }

  const handleDisciplineToggle = (d: string) => {
    setDisciplines((prev) =>
      prev.includes(d) ? prev.filter((item) => item !== d) : [...prev, d]
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB")
        return
      }
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    // Validation
    if (mode !== "delete" && !name.trim()) {
      setError("Place name is required.")
      return
    }

    if (mode === "add" && !internalCoords) {
      setError("Location coordinates are missing. Please search or pick a location.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      let photoUrl = null
      if (selectedFile) {
        photoUrl = await uploadPlacePhoto(selectedFile, user.id)
      }

      // Build proposed data payload
      const proposedData: Record<string, any> = mode === "delete" ? {
        // Reduced payload for deletion
        name: place?.name || "Deleted Place",
        isDelete: true,
      } : {
        name: name.trim(),
        type,
        environment,
        disciplines,
        description: description.trim() || null,
      }

      // In add mode, we need coordinates too
      if (mode === "add" && internalCoords) {
        proposedData.latitude = internalCoords.lat
        proposedData.longitude = internalCoords.lng
        proposedData.source = "user"
      }

      const supabase = createClient()
      
      const payload: any = {
        user_id: user.id,
        action: mode === "delete" ? "edit" : mode,
        data: proposedData,
      }

      if (place?.id) {
        payload.place_id = place.id
      }
      
      if (notes.trim()) {
        payload.notes = notes.trim()
      }
      
      if (photoUrl) {
        payload.photos = [photoUrl]
      }

      const { error: insertError } = await supabase
        .from("suggestions")
        .insert(payload)

      if (insertError) throw insertError

      setSuccessMsg("Thanks! Your suggestion has been submitted for review.")
      if (onSuccess) {
        setTimeout(onSuccess, 2000)
      }
      
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to submit suggestion.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto">
      <div className="w-full max-w-[500px] max-h-[90vh] bg-background border rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b shrink-0">
        <h2 className="text-xl font-bold text-foreground">
          {mode === "add" ? "Suggest a Place" : mode === "delete" ? "Report Closed/Duplicate" : "Propose Edit"}
        </h2>
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isAuthLoading ? (
          <div className="flex items-center justify-center p-8 space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Checking session…</span>
          </div>
        ) : !user ? (
          <div className="text-center py-12 px-4">
            <p className="text-muted-foreground mb-4 font-medium">You need to be logged in to submit a suggestion.</p>
            <div className="flex justify-center gap-3">
              <Link href="/login">
                <Button>Log in</Button>
              </Link>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
            </div>
          </div>
        ) : successMsg ? (
          <div className="text-center py-12 px-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              ✓
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Success!</h3>
            <p className="text-muted-foreground">{successMsg}</p>
            <Button onClick={onClose} className="mt-6 w-full">Done</Button>
          </div>
        ) : (
          <form id="suggestion-form" onSubmit={handleSubmit} className="space-y-6 pb-4">
            
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {mode === "add" && (
              <div className="space-y-3 bg-muted/30 p-4 rounded-xl border">
                <label className="text-sm font-bold text-foreground">Location</label>
                
                {internalCoords ? (
                  <div className="flex items-center justify-between p-3 bg-background border rounded-lg shadow-sm">
                    <div className="text-xs font-mono text-muted-foreground flex flex-col gap-1">
                      <span>Lat: {internalCoords.lat.toFixed(5)}</span>
                      <span>Lng: {internalCoords.lng.toFixed(5)}</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setInternalCoords(null)} className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                      Clear
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Search Address */}
                    <div className="relative">
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => handleGeoSearch(e.target.value)}
                        placeholder="Search an address or landmark..."
                        className="w-full sm:text-sm border rounded-lg px-3 py-2.5 bg-background outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      {isSearching && <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-muted-foreground" />}
                      
                      {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-xl overflow-hidden z-[60] max-h-48 overflow-y-auto">
                          {searchResults.map(res => (
                            <button 
                              key={res.place_id} 
                              type="button"
                              onClick={() => handleSelectNominatim(res)}
                              className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted transition-colors border-b last:border-0"
                            >
                              <div className="font-medium text-foreground truncate">{res.display_name.split(",").slice(0, 2).join(",")}</div>
                              <div className="text-xs text-muted-foreground truncate">{res.display_name.split(",").slice(2).join(",")}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="h-px bg-border flex-1" />
                      <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">OR</span>
                      <div className="h-px bg-border flex-1" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <Button type="button" variant="outline" onClick={handleUseMyLocation} disabled={geoLoading} className="rounded-xl h-10 gap-2 text-xs">
                         {geoLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <MapPin className="w-4 h-4" />} Use GPS
                       </Button>
                       {onRequestMapPick && (
                         <Button type="button" variant="outline" onClick={onRequestMapPick} className="rounded-xl h-10 gap-2 text-xs bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary">
                           <MapPin className="w-4 h-4" /> Pick on Map
                         </Button>
                       )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode === "delete" && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 space-y-2 mb-4">
                <p className="text-sm font-semibold">You are suggesting to remove {place?.name} from the map.</p>
                <p className="text-xs">This will require moderator review. Please use the notes field below to explain why this place should be removed (e.g. permanently closed, duplicate entry).</p>
              </div>
            )}

            {mode !== "delete" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Place Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full sm:text-sm border rounded-lg px-3 py-2 bg-background outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g. Secret Crag"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full sm:text-sm border rounded-lg px-3 py-2 bg-background outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {PLACE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Environment</label>
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value)}
                      className="w-full sm:text-sm border rounded-lg px-3 py-2 bg-background outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {ENVIRONMENTS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Disciplines</label>
                  <div className="flex flex-wrap gap-2">
                    {DISCIPLINES.map((d) => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => handleDisciplineToggle(d)}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                          disciplines.includes(d) 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent hover:border-border"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Description (optional)</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full sm:text-sm border rounded-lg px-3 py-2 bg-background outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="Describe the area..."
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold">
                {mode === "delete" ? "Reason for Removal (required)" : "Notes for Reviewer (optional)"}
              </label>
              <textarea
                rows={mode === "delete" ? 4 : 2}
                value={notes}
                required={mode === "delete"}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full sm:text-sm border border-dashed rounded-lg px-3 py-2 bg-background outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Sources, context, why this matters..."
              />
            </div>

            <div className="space-y-2 pt-2 border-t">
              <label className="text-sm font-semibold">Photo (optional)</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                {previewUrl ? (
                  <div className="relative h-20 w-32 rounded-lg border overflow-hidden group shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                      className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-dashed flex-1 h-20 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-5 w-5 opacity-50" />
                    <span className="text-xs">Upload Photo</span>
                  </Button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Footer controls (only if logged in and not success) */}
      {!isAuthLoading && user && !successMsg && (
        <div className="p-4 border-t bg-muted/30 flex justify-end gap-3 shrink-0 rounded-b-2xl">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting} className="rounded-xl">
            Cancel
          </Button>
          <Button type="submit" form="suggestion-form" disabled={isSubmitting} className="rounded-xl">
            {isSubmitting ? (
               <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {mode === "add" ? "Submit Place" : mode === "delete" ? "Submit Deletion" : "Submit Edit"}
          </Button>
        </div>
      )}
      </div>
    </div>
  )
}
