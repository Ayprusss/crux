"use client"

import { useState, useTransition } from "react"
import { ShieldCheck, Activity, Pin } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Place } from "@/types/place"

interface AdminToolbeltProps {
  place: Place
  onVerify: () => void
  onCurate: () => void
  isPending?: boolean
}

export default function AdminToolbelt({ place, onVerify, onCurate, isPending }: AdminToolbeltProps) {
  const [isAdminPinned, setIsAdminPinned] = useState(false)
  const [isAdminHovered, setIsAdminHovered] = useState(false)

  return (
    <div 
      className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ease-in-out
        ${(isAdminHovered || isAdminPinned) ? 'opacity-100 translate-y-0 scale-100' : 'opacity-40 translate-y-2 scale-95'}
      `}
      onMouseEnter={() => setIsAdminHovered(true)}
      onMouseLeave={() => setIsAdminHovered(false)}
    >
      {/* Mobile FAB (Hidden on desktop) */}
      <div className="sm:hidden flex flex-col gap-2 items-end">
        <Button
          size="icon"
          className="rounded-full h-14 w-14 shadow-2xl bg-gradient-to-tr from-primary to-primary/80 border-4 border-background"
          onClick={() => setIsAdminPinned(!isAdminPinned)}
        >
          <ShieldCheck className="h-6 w-6 text-white" />
        </Button>
        {isAdminPinned && (
          <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-4 duration-200">
            {!place.verified && (
              <Button size="icon" className="rounded-full bg-green-600 text-white shadow-xl" onClick={onVerify} disabled={isPending}>
                <ShieldCheck className="h-5 w-5" />
              </Button>
            )}
            <Button size="icon" className="rounded-full bg-blue-600 text-white shadow-xl" onClick={onCurate}>
              <Activity className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Desktop Toolbelt (Hidden on mobile) */}
      <div className="hidden sm:flex items-center gap-1.5 p-1.5 bg-background/80 backdrop-blur-xl border rounded-2xl shadow-2xl ring-1 ring-black/5">
        <div className="px-3 py-1 mr-1 border-r">
           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mgmt</span>
        </div>
        
        {!place.verified && (
          <Button 
            size="sm" 
            className="rounded-xl font-bold bg-green-600 text-white px-4 h-9 shadow-sm"
            onClick={onVerify}
            disabled={isPending}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Verify
          </Button>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-xl font-bold border-2 h-9 text-primary border-primary/20 hover:border-primary/40 px-4"
          onClick={onCurate}
        >
          <Activity className="mr-2 h-4 w-4" />
          Curate
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className={`rounded-xl h-9 w-9 transition-colors ${isAdminPinned ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
          onClick={() => setIsAdminPinned(!isAdminPinned)}
          title={isAdminPinned ? "Unpin toolbar" : "Pin toolbar"}
        >
          <Pin className={`h-4 w-4 ${isAdminPinned ? 'fill-current' : ''}`} />
        </Button>
      </div>
    </div>
  )
}
