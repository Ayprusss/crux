import { createAdminClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { approveSuggestion, rejectSuggestion } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, X, ShieldAlert } from "lucide-react"
import Link from "next/link"

export default async function AdminSuggestionReview({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  // 1. Fetch
  const { data: suggestion, error } = await supabase
    .from("suggestions")
    .select("*, profiles!user_id(display_name, email)")
    .eq("id", id)
    .single()

  if (error || !suggestion) notFound()

  // Already processed? Kick back to queue
  if (suggestion.status !== "pending") {
    redirect("/admin/suggestions")
  }

  // 2. Diff Logic
  let existingPlace = null
  let duplicateWarning = false

  if (suggestion.action === "edit" && suggestion.place_id) {
    const { data } = await supabase.from("places").select("*").eq("id", suggestion.place_id).single()
    existingPlace = data
  } else if (suggestion.action === "add" && suggestion.data?.latitude && suggestion.data?.longitude) {
    // 3. PostGIS Duplicate Detection
    // We utilize ST_DWithin to mathematically check for points within roughly 100 meters
    let count = 0
    const { data: rpcCount, error } = await supabase.rpc("count_places_within_radius", {
      lat: suggestion.data.latitude,
      lng: suggestion.data.longitude,
      radius_meters: 100
    })
    
    if (error) {
      if (error.code !== 'PGRST202') {
         console.error("RPC Error:", error)
      }
    } else if (typeof rpcCount === 'number') {
      count = rpcCount
    }
    
    // Fallback simple bounding box check if RPC fails
    const { data: possibleDups } = await supabase
      .from("places")
      .select("id")
      .gte("latitude", suggestion.data.latitude - 0.001)
      .lte("latitude", suggestion.data.latitude + 0.001)
      .gte("longitude", suggestion.data.longitude - 0.001)
      .lte("longitude", suggestion.data.longitude + 0.001)
      
    if ((possibleDups && possibleDups.length > 0) || (count && count > 0)) {
      duplicateWarning = true
    }
  }

  const proposedData = suggestion.data as any
  const profile = Array.isArray(suggestion.profiles) ? suggestion.profiles[0] : suggestion.profiles
  const isAdd = suggestion.action === "add"

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-24">
      <Link href="/admin/suggestions" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Queue
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">{isAdd ? "New Submission" : "Edit Proposal"}</h1>
          <p className="text-muted-foreground font-medium mt-1">Submitted by {profile?.display_name || profile?.email}</p>
        </div>
      </div>

      {duplicateWarning && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex gap-4 shadow-sm items-start">
          <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Possible Duplicate Detected</h4>
            <p className="text-sm opacity-90 mt-1">
              There is an existing location in the database within 100 meters of the submitted GPS coordinates. Ensure this is not a duplicate before approving.
            </p>
          </div>
        </div>
      )}

      {/* Primary Diff View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* EXISTING */}
        <div className="space-y-4">
          <h3 className="font-bold text-muted-foreground uppercase tracking-wider text-sm">
            {isAdd ? "Current DB Record" : "Original Record"}
          </h3>
          <div className="bg-muted/30 border rounded-2xl p-6 min-h-[400px]">
            {!existingPlace ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                 {isAdd ? "No previous record exists for Add actions." : "Original record could not be loaded."}
              </div>
            ) : (
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground mb-1">Name</dt>
                  <dd className="font-medium text-foreground">{existingPlace.name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground mb-1">Type & Environment</dt>
                  <dd className="font-medium text-foreground">{existingPlace.type} · {existingPlace.environment}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground mb-1">Coordinates</dt>
                  <dd className="font-medium text-foreground font-mono text-sm">{existingPlace.latitude}, {existingPlace.longitude}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground mb-1">Disciplines</dt>
                  <dd className="font-medium text-foreground text-sm">{existingPlace.disciplines?.join(", ") || "None"}</dd>
                </div>
                <div className="pb-4">
                  <dt className="text-xs font-semibold text-muted-foreground mb-1">Description</dt>
                  <dd className="font-medium text-foreground text-sm max-w-sm whitespace-pre-wrap">{existingPlace.description || "N/A"}</dd>
                </div>
              </dl>
            )}
          </div>
        </div>

        {/* PROPOSED */}
        <div className="space-y-4">
          <h3 className="font-bold text-primary uppercase tracking-wider text-sm">Proposed Changes</h3>
          <div className="bg-background border-2 border-primary/20 shadow-xl shadow-primary/5 rounded-2xl p-6 min-h-[400px]">
             <dl className="space-y-4">
                <div>
                  <dt className="text-xs font-semibold text-primary mb-1">Name</dt>
                  <dd className="font-medium text-foreground bg-primary/5 px-2 py-0.5 rounded-md inline-block">{proposedData.name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-primary mb-1">Type & Environment</dt>
                  <dd className="font-medium text-foreground bg-primary/5 px-2 py-0.5 rounded-md inline-block">{proposedData.type} · {proposedData.environment}</dd>
                </div>
                {isAdd && (
                  <div>
                    <dt className="text-xs font-semibold text-primary mb-1">Coordinates</dt>
                    <dd className="font-medium text-foreground bg-primary/5 px-2 py-0.5 rounded-md inline-block font-mono text-sm">{proposedData.latitude}, {proposedData.longitude}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-semibold text-primary mb-1">Disciplines</dt>
                  <dd className="font-medium text-foreground bg-primary/5 px-2 py-0.5 rounded-md inline-block text-sm">{proposedData.disciplines?.join(", ") || "None"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-primary mb-1">Description</dt>
                  <dd className="font-medium text-foreground bg-primary/5 p-2 rounded-md text-sm max-w-sm whitespace-pre-wrap">{proposedData.description || "N/A"}</dd>
                </div>

                {suggestion.notes && (
                  <div className="pt-4 mt-4 border-t">
                    <dt className="text-xs font-bold text-amber-600 mb-1">Submitter Notes</dt>
                    <dd className="font-medium text-amber-900 bg-amber-50 p-3 rounded-lg text-sm whitespace-pre-wrap border border-amber-100">{suggestion.notes}</dd>
                  </div>
                )}
              </dl>
          </div>
        </div>
      </div>

      {suggestion.photos && suggestion.photos.length > 0 && (
         <div className="mt-8 space-y-4">
            <h3 className="font-bold text-muted-foreground uppercase tracking-wider text-sm">Attached Media</h3>
            <div className="flex gap-4 overflow-x-auto pb-4">
               {suggestion.photos.map((url: string, i: number) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={url} alt="Attached photo" className="h-64 object-cover rounded-xl border shadow-sm" />
               ))}
            </div>
         </div>
      )}

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 right-6 left-6 md:left-72 z-50">
        <div className="bg-background/80 backdrop-blur-md border shadow-2xl rounded-2xl p-4 flex justify-between items-center max-w-4xl mx-auto">
          <p className="text-sm font-semibold opacity-70">Review carefully before processing.</p>
          <div className="flex items-center gap-3">
             <form action={async () => {
                "use server"
                await rejectSuggestion(suggestion.id)
             }}>
                <Button type="submit" variant="destructive" className="rounded-xl px-6 gap-2">
                  <X className="w-4 h-4" /> Reject
                </Button>
             </form>

             <form action={async () => {
                "use server"
                await approveSuggestion(suggestion.id)
             }}>
                <Button type="submit" variant="default" className="rounded-xl px-6 bg-green-600 hover:bg-green-700 text-white gap-2">
                  <Check className="w-4 h-4" /> Approve & Merge
                </Button>
             </form>
          </div>
        </div>
      </div>

    </div>
  )
}
