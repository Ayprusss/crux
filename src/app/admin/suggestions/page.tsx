import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { AlertCircle, ChevronRight, FileEdit, MapPinPlus } from "lucide-react"

export default async function AdminSuggestionsQueue() {
  const supabase = await createClient()

  // Fetch pending suggestions and neatly join with profiles for the submitter's name
  const { data: suggestions, error } = await supabase
    .from("suggestions")
    .select(`
      *,
      profiles!user_id(display_name, email)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    return <div className="p-8 text-red-500 font-bold">Failed to load suggestions queue.</div>
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Review Queue</h1>
          <p className="text-muted-foreground mt-1 font-medium">Evaluate community submissions.</p>
        </div>
        <div className="bg-background border rounded-full px-4 py-1.5 text-sm font-semibold text-muted-foreground shadow-sm">
          {suggestions?.length || 0} pending item{(suggestions?.length || 0) !== 1 && 's'}
        </div>
      </div>

      <div className="bg-background border rounded-2xl shadow-sm overflow-hidden">
        {(!suggestions || suggestions.length === 0) ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <AlertCircle className="w-12 h-12 text-muted/50 mb-4" />
            <h3 className="text-xl font-bold text-foreground">You&apos;re all caught up!</h3>
            <p className="text-muted-foreground font-medium mt-1">There are no pending submissions in the queue right now.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {suggestions.map((suggestion) => {
              const isAdd = suggestion.action === "add"
              const Icon = isAdd ? MapPinPlus : FileEdit
              const suggestedData = suggestion.data as any
              const profile = Array.isArray(suggestion.profiles) ? suggestion.profiles[0] : suggestion.profiles
              const submittedBy = profile?.display_name || profile?.email || "Unknown User"

              return (
                <li key={suggestion.id} className="group hover:bg-muted/30 transition-colors">
                  <Link href={`/admin/suggestions/${suggestion.id}`} className="flex items-center p-4 sm:p-6 gap-4">
                    
                    <div className={`p-3 rounded-xl shrink-0 ${isAdd ? 'bg-indigo-50 text-indigo-600' : 'bg-fuchsia-50 text-fuchsia-600'}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${isAdd ? 'bg-indigo-100 text-indigo-700' : 'bg-fuchsia-100 text-fuchsia-700'}`}>
                          {suggestion.action}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground truncate">
                          by {submittedBy}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-foreground truncate">
                        {suggestedData?.name || "Unnamed Location"}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate font-medium">
                        {new Date(suggestion.created_at).toLocaleString()}
                        {suggestion.notes && ` · Includes notes`}
                        {suggestion.photos?.length > 0 && ` · Includes ${suggestion.photos.length} photo(s)`}
                      </p>
                    </div>

                    <div className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors pl-4">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
