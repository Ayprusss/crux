"use client"

import { useState, useRef, useEffect } from "react"
import { X, Upload, Loader2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Place } from "@/types/place"
import { createClient } from "@/lib/supabase/client"
import { uploadPlacePhoto } from "@/lib/supabase/storage"
import type { User } from "@supabase/supabase-js"
import Link from "next/link"

interface SuggestionFormPanelProps {
  mode: "add" | "edit"
  place?: Place
  coordinates?: { lat: number; lng: number }
  onClose: () => void
  onSuccess?: () => void
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
}: SuggestionFormPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [user, setUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  
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
  
  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setIsAuthLoading(false)
    })
  }, [])

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
    if (!name.trim()) {
      setError("Place name is required.")
      return
    }

    if (mode === "add" && !coordinates) {
      setError("Coordinates are missing.")
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
      const proposedData: Record<string, any> = {
        name: name.trim(),
        type,
        environment,
        disciplines,
        description: description.trim() || null,
      }

      // In add mode, we need coordinates too
      if (mode === "add" && coordinates) {
        proposedData.latitude = coordinates.lat
        proposedData.longitude = coordinates.lng
        proposedData.source = "user"
      }

      const supabase = createClient()
      
      const payload: any = {
        user_id: user.id,
        action: mode,
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
        <div className="flex items-center justify-between p-5 border-b">
        <h2 className="text-xl font-bold text-foreground">
          {mode === "add" ? "Suggest a Place" : "Propose Edit"}
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
          <form id="suggestion-form" onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {mode === "add" && coordinates && (
              <div className="p-3 bg-muted rounded-lg border flex justify-between text-xs font-mono text-muted-foreground">
                <span>Lat: {coordinates.lat.toFixed(5)}</span>
                <span>Lng: {coordinates.lng.toFixed(5)}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold">Place Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full sm:text-sm border rounded-lg px-3 py-2 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. Secret Crag"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full sm:text-sm border rounded-lg px-3 py-2 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {PLACE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Environment</label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="w-full sm:text-sm border rounded-lg px-3 py-2 bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
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
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
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
                className="w-full sm:text-sm border rounded-lg px-3 py-2 bg-transparent outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Describe the area..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Notes for Reviewer (optional)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full sm:text-sm border border-dashed rounded-lg px-3 py-2 bg-transparent outline-none focus:ring-2 focus:ring-primary/50 resize-none"
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
                  <div className="relative h-20 w-32 rounded-lg border overflow-hidden group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                      className="absolute inset-0 bg-background/50 text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-dashed flex-1 h-20 flex flex-col items-center justify-center gap-1 text-muted-foreground"
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
        <div className="p-4 border-t bg-muted/30 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="suggestion-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {mode === "add" ? "Submit Place" : "Submit Edit"}
          </Button>
        </div>
      )}
      </div>
    </div>
  )
}
