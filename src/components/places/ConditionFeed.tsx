"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/AuthProvider"
import { submitConditionReport, getRecentConditions } from "@/app/actions/conditions"
import type { ConditionStatus, CrowdLevel, ConditionReport } from "@/types/condition"
import { CloudRain, CloudSun, Users, Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ConditionFeed({ placeId }: { placeId: string }) {
  const { user } = useAuth()
  
  const [conditions, setConditions] = useState<ConditionReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [showForm, setShowForm] = useState(false)
  const [status, setStatus] = useState<ConditionStatus | null>(null)
  const [crowdLevel, setCrowdLevel] = useState<CrowdLevel | null>(null)
  const [notes, setNotes] = useState("")

  useEffect(() => {
    let active = true
    async function load() {
      setIsLoading(true)
      const data = await getRecentConditions(placeId)
      if (active) setConditions(data as ConditionReport[])
      setIsLoading(false)
    }
    load()
    return () => { active = false }
  }, [placeId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !status || !crowdLevel) return

    setIsSubmitting(true)
    setError(null)

    try {
      await submitConditionReport(placeId, {
        status, crowd_level: crowdLevel, notes
      })
      
      // Reload feed
      const data = await getRecentConditions(placeId)
      setConditions(data as ConditionReport[])
      
      // Reset form
      setShowForm(false)
      setStatus(null)
      setCrowdLevel(null)
      setNotes("")
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to submit condition")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = (s: string) => {
    switch(s) {
      case "dry": return <CloudSun className="w-4 h-4 text-orange-500" />
      case "wet": return <CloudRain className="w-4 h-4 text-blue-500" />
      case "snow": return <CloudRain className="w-4 h-4 text-cyan-300" />
      default: return <CloudSun className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getCrowdColor = (c: string) => {
    switch(c) {
      case "empty": return "text-green-500 bg-green-50"
      case "moderate": return "text-yellow-600 bg-yellow-50"
      case "crowded": return "text-red-500 bg-red-50"
      default: return "text-muted-foreground bg-muted"
    }
  }

  return (
    <div className="pt-4 border-t space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-foreground">Condition Reports</h3>
          <p className="text-xs text-muted-foreground">Recent weather and crowd levels</p>
        </div>
        {user && !showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="rounded-xl h-8 px-3 text-xs">
            Report
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-muted/40 rounded-xl border space-y-4 animate-in fade-in slide-in-from-top-2">
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          
          <div className="space-y-2">
            <p className="text-xs font-bold text-foreground">Rock Condition</p>
            <div className="flex gap-2">
              {(["dry", "wet", "mixed", "snow"] as ConditionStatus[]).map(s => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-lg border transition-colors ${
                    status === s ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-background text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-foreground">Crowd Level</p>
            <div className="flex gap-2">
              {(["empty", "moderate", "crowded"] as CrowdLevel[]).map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCrowdLevel(c)}
                  className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-lg border transition-colors ${
                    crowdLevel === c ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-background text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-foreground">Notes (Optional)</p>
            <input 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Buggy, muddy base area..."
              className="w-full text-xs font-medium bg-background px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)} className="flex-1 rounded-lg text-xs" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!status || !crowdLevel || isSubmitting} className="flex-1 rounded-lg text-xs font-bold shadow-sm">
              {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : <><Send className="w-3 h-3 mr-1.5" /> Submit</>}
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="py-6 flex justify-center"><Loader2 className="w-5 h-5 text-muted-foreground animate-spin" /></div>
      ) : conditions.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-2 text-center bg-muted/20 rounded-xl border border-dashed">No recent reports.</p>
      ) : (
        <div className="space-y-2">
          {conditions.map(report => (
            <div key={report.id} className="p-3 bg-muted/20 border rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold capitalize">
                    {getStatusIcon(report.status)}
                    {report.status}
                  </div>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getCrowdColor(report.crowd_level)}`}>
                    {report.crowd_level}
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {new Date(report.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
              {report.notes && (
                <p className="text-xs font-medium text-muted-foreground pl-1 border-l-2 border-border/50">
                  "{report.notes}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
