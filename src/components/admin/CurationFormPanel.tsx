"use client"

import { useState, useRef } from "react"
import { X, Upload, Loader2, Image as ImageIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Place } from "@/types/place"
import { useAuth } from "@/components/auth/AuthProvider"
import { uploadPlacePhoto } from "@/lib/supabase/storage"
import { curatePlace } from "@/app/actions/admin"

interface CurationFormPanelProps {
  place: Place
  onClose: () => void
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

// Pre-defined set of top amenities
const AMENITIES_LIST = [
  "Showers",
  "Café",
  "Kilter Board",
  "Moon Board",
  "Tension Board",
  "Weight Room",
  "Yoga Studio",
  "WiFi",
  "Locker Room",
  "Water Station"
]

export default function CurationFormPanel({ place, onClose }: CurationFormPanelProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Operating Hours State
  const initialHours = place.operating_hours || {}
  const [hours, setHours] = useState<Record<string, string>>(initialHours)

  // Amenities State
  const [amenities, setAmenities] = useState<string[]>(place.amenities || [])
  const [customAmenity, setCustomAmenity] = useState("")

  // Photo State - MVP allows setting the 1st photo
  const hasExistingPhotos = place.photos && place.photos.length > 0;
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    hasExistingPhotos ? place.photos![0] : null
  )

  const handleHourChange = (day: string, value: string) => {
    setHours((prev) => ({ ...prev, [day]: value }))
  }

  const toggleAmenity = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter(a => a !== amenity))
    } else {
      setAmenities([...amenities, amenity])
    }
  }

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !amenities.includes(customAmenity.trim())) {
      setAmenities([...amenities, customAmenity.trim()])
    }
    setCustomAmenity("")
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

  const removePhoto = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    setError(null)

    try {
      let finalPhotos = hasExistingPhotos ? place.photos : []

      // Upload new photo if selected
      if (selectedFile) {
        const url = await uploadPlacePhoto(selectedFile, user.id)
        finalPhotos = [url] // For MVP, replace existing or set new
      } else if (!previewUrl) {
        finalPhotos = [] // They cleared it
      }

      // Build payload
      const payload = {
        operating_hours: hours,
        amenities: amenities,
        photos: finalPhotos
      }

      await curatePlace(place.id, payload)
      setSuccess(true)
      
      setTimeout(() => {
        onClose()
      }, 2000)

    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to curate place.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="absolute inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-background border-l shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mb-2 shadow-sm">
            ✓
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Curated!</h2>
          <p className="text-muted-foreground font-medium">
            "{place.name}" is now a verified curated listing.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-background border-l shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      
      <div className="flex items-center justify-between p-5 border-b shrink-0 bg-background/95 backdrop-blur z-10 sticky top-0">
        <div>
          <h2 className="text-lg font-black text-foreground">Curate Place</h2>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">Admin Workflow</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
          aria-label="Close panel"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <form id="curation-form" onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 font-medium">
              {error}
            </div>
          )}

          {/* Place Info Context */}
          <div className="bg-muted/40 p-4 rounded-xl border space-y-1 text-sm">
            <p className="font-bold text-foreground truncate">{place.name}</p>
            <p className="text-muted-foreground">Type: <span className="uppercase text-xs font-bold">{place.type}</span></p>
          </div>

          {/* Cover Photo */}
          <section className="space-y-4 pt-2">
            <div>
              <h3 className="font-bold text-sm text-foreground">Cover Photo (MVP)</h3>
              <p className="text-xs text-muted-foreground">Upload a high resolution banner image.</p>
            </div>
            
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            {previewUrl ? (
              <div className="relative h-44 w-full rounded-2xl border overflow-hidden group shadow-sm bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm gap-4">
                  <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} className="rounded-xl font-semibold">
                    Change
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={removePhoto} className="rounded-xl font-semibold">
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/50 hover:border-primary/50 hover:text-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="p-3 bg-background rounded-full shadow-sm border">
                  <Upload className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold">Upload Photo</span>
              </button>
            )}
          </section>

          {/* Amenities */}
          <section className="space-y-4 pt-4 border-t">
            <div>
              <h3 className="font-bold text-sm text-foreground">Amenities</h3>
              <p className="text-xs text-muted-foreground">Select facilities available at this location.</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {AMENITIES_LIST.map((a) => {
                const isActive = amenities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
                      isActive 
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                        : 'bg-background text-muted-foreground hover:bg-muted border-border'
                    }`}
                  >
                    {a}
                  </button>
                )
              })}
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Custom amenity..." 
                className="flex-1 text-sm border rounded-xl px-3 py-2 bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                value={customAmenity}
                onChange={e => setCustomAmenity(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomAmenity())}
              />
              <Button type="button" variant="outline" className="rounded-xl px-3" onClick={addCustomAmenity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </section>

          {/* Operating Hours */}
          <section className="space-y-4 pt-4 border-t">
            <div>
              <h3 className="font-bold text-sm text-foreground">Operating Hours</h3>
              <p className="text-xs text-muted-foreground">Use a standard format (e.g. "6:00 AM - 11:00 PM", "Closed").</p>
            </div>
            
            <div className="space-y-2.5">
              {DAYS.map(day => (
                <div key={day} className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-muted-foreground w-24 shrink-0">{day}</span>
                  <input
                    type="text"
                    value={hours[day] || ""}
                    onChange={(e) => handleHourChange(day, e.target.value)}
                    placeholder="e.g. 6:00 AM - 10:00 PM"
                    className="flex-1 text-sm border font-medium rounded-lg px-3 py-2 bg-background focus:ring-2 focus:ring-primary/50 outline-none transition-shadow"
                  />
                </div>
              ))}
            </div>
          </section>
          
        </form>
      </div>

      <div className="p-5 border-t bg-muted/20 shrink-0 sticky bottom-0 z-10 backdrop-blur-sm">
        <Button 
          type="submit" 
          form="curation-form" 
          disabled={isSubmitting} 
          className="w-full rounded-xl h-11 font-bold shadow-md"
        >
          {isSubmitting ? (
             <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
             <Upload className="w-5 h-5 mr-2" />
          )}
          {isSubmitting ? "Saving..." : "Save Curation Data"}
        </Button>
      </div>
    </div>
  )
}
