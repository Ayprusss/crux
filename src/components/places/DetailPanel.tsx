"use client"

import { X, MapPin, Navigation, Clock, Tag, Heart, Share2, Info, ShieldCheck, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Place } from "@/types/place"
import { useFavorites } from "@/hooks/useFavorites"
import { useState, useTransition } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { verifyPlace } from "@/app/actions/admin"

function getConfidenceScore(place: Place) {
  if (place.verified) return 100;
  if (place.source === "curated") return 95;
  if (place.source === "user") return 75;
  return 40; // osm
}

function getConfidenceColor(score: number) {
  if (score >= 90) return "bg-green-500";
  if (score >= 70) return "bg-yellow-500";
  return "bg-orange-500";
}

interface DetailPanelProps {
  place: Place
  onClose: () => void
  onEdit?: () => void
  onDelete?: () => void
  onCurate?: () => void
}

export default function DetailPanel({ place, onClose, onEdit, onDelete, onCurate }: DetailPanelProps) {
  const { toggleFavorite, isFavorite, isLoaded } = useFavorites()
  const { isAdmin } = useAuth()
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  const confidenceScore = getConfidenceScore(place)
  const scoreColor = getConfidenceColor(confidenceScore)

  const handleVerify = () => {
    startTransition(async () => {
      try {
        await verifyPlace(place.id)
      } catch (e) {
        console.error("Failed to verify", e)
      }
    })
  }

  const handleShare = () => {
    const url = `${window.location.origin}/map?lat=${place.latitude}&lng=${place.longitude}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const favorite = isLoaded ? isFavorite(place.id) : false

  return (
    <div className="absolute top-0 right-0 h-full w-full sm:w-[400px] bg-background border-l shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300 pointer-events-auto">
      {/* Header with optional Cover Photo */}
      {place.photos && place.photos.length > 0 ? (
        <div className="relative h-48 sm:h-56 w-full shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={place.photos[0]} alt={place.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent" />
          
          <div className="absolute top-4 right-4 flex items-center gap-1 z-10">
            <button
              onClick={() => toggleFavorite(place.id)}
              className={`p-2 rounded-xl backdrop-blur-md transition-colors shadow-sm ${
                favorite ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-black/20 text-white hover:bg-black/40"
              }`}
            >
              <Heart className="h-5 w-5" fill={favorite ? "currentColor" : "none"} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-colors shadow-sm"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-2xl font-black text-foreground truncate drop-shadow-md">{place.name}</h2>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground shadow-sm">
                {place.type}
              </span>
              {place.verified && (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-500 text-white shadow-sm">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between p-6 border-b shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-foreground truncate">{place.name}</h2>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                {place.type}
              </span>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-accent text-accent-foreground">
                {place.environment}
              </span>
              {place.verified && (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-4">
            <button
              onClick={() => toggleFavorite(place.id)}
              className={`p-1.5 rounded-lg transition-colors ${
                favorite ? "text-red-500 hover:bg-red-500/10" : "text-muted-foreground hover:bg-muted"
              }`}
              aria-label="Toggle favorite"
            >
              <Heart className="h-5 w-5" fill={favorite ? "currentColor" : "none"} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              aria-label="Close detail panel"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Location */}
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Location</p>
            <p className="text-sm text-muted-foreground">
              {place.address || "Address not available"}
            </p>
            {place.city && (
              <p className="text-sm text-muted-foreground">
                {place.city}{place.region ? `, ${place.region}` : ""}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
            </p>
          </div>
        </div>

        {/* Disciplines */}
        {place.disciplines.length > 0 && (
          <div className="flex items-start gap-3">
            <Tag className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1.5">Disciplines</p>
              <div className="flex flex-wrap gap-1.5">
                {place.disciplines.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {place.description && (
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Description</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{place.description}</p>
          </div>
        )}

        {/* Amenities */}
        {place.amenities.length > 0 && (
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1.5">Amenities</p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                {place.amenities.map((amenity) => (
                  <li key={amenity} className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <span className="h-1 w-1 bg-primary rounded-full shrink-0" />
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Operating Hours */}
        {(place.operating_hours || place.environment === "indoor") && (
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-2">Hours</p>
              {place.operating_hours && Object.keys(place.operating_hours).length > 0 ? (
                <div className="grid grid-cols-1 gap-1.5">
                  {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => {
                    const hrs = place.operating_hours![day]
                    if (!hrs) return null
                    return (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{day}</span>
                        <span className="font-medium text-foreground">{hrs}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Hours not currently available.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Source info and Confidence Score */}
        <div className="flex items-start gap-3">
          <Activity className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-sm font-medium text-foreground">Data Confidence</p>
              <span className="text-xs font-bold">{confidenceScore}%</span>
            </div>
            {/* Custom Tailwind Progress Bar */}
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full ${scoreColor} transition-all duration-1000 ease-out`} 
                style={{ width: `${confidenceScore}%` }} 
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Source: {place.source.toUpperCase()} · Added {new Date(place.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="p-4 border-t bg-muted/30 flex flex-col gap-2">
        <div className="flex gap-2">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button className="w-full rounded-xl font-bold shadow-md shadow-primary/10 h-11">
              <Navigation className="mr-2 h-4 w-4" />
              Navigate
            </Button>
          </a>
          <Button 
            variant="outline" 
            className="rounded-xl h-11 px-4 text-muted-foreground hover:text-foreground"
            onClick={handleShare}
          >
            {copied ? "Copied!" : <Share2 className="h-4 w-4" />}
          </Button>
        </div>
        
        {isAdmin && !place.verified && (
          <Button 
            className="w-full rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white h-11"
            onClick={handleVerify}
            disabled={isPending}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            {isPending ? "Verifying..." : "Admin: Verify Place"}
          </Button>
        )}
        
        {isAdmin && onCurate && (
          <Button 
            variant="outline"
            className="w-full rounded-xl font-bold border-primary text-primary hover:bg-primary/5 h-11 border-2"
            onClick={onCurate}
          >
            Admin: Curate Place
          </Button>
        )}
        
        {onEdit && (
          <Button 
            variant="ghost" 
            className="w-full rounded-xl h-9 mt-1 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={onEdit}
          >
            Wrong info? Suggest an edit
          </Button>
        )}
        
        {onDelete && (
          <Button 
            variant="ghost" 
            className="w-full rounded-xl h-9 mt-1 text-xs font-semibold text-red-500/70 hover:text-red-500 hover:bg-red-50"
            onClick={onDelete}
          >
            Report place as closed or duplicate
          </Button>
        )}
      </div>
    </div>
  )
}
