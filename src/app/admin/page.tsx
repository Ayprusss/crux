import { createClient } from "@/lib/supabase/server"
import { Inbox, CheckCircle, Database } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardOverview() {
  const supabase = await createClient()

  // Get total pending
  const { count: pendingCount } = await supabase
    .from("suggestions")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending")

  // Get total approved
  const { count: approvedCount } = await supabase
    .from("suggestions")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved")

  // Get total verified places
  const { count: verifiedCount } = await supabase
    .from("places")
    .select("id", { count: "exact", head: true })
    .eq("verified", true)

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1 font-medium">Platform moderation overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Card */}
        <div className="bg-background rounded-2xl border shadow-sm p-6 flex flex-col justify-between h-40 group">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Needs Review</h3>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-foreground">{pendingCount || 0}</span>
            <span className="text-sm font-semibold text-muted-foreground">Pending</span>
          </div>
        </div>

        {/* Approved Card */}
        <div className="bg-background rounded-2xl border shadow-sm p-6 flex flex-col justify-between h-40 group">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Total Approved</h3>
            <div className="p-2 bg-green-50 text-green-600 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-foreground">{approvedCount || 0}</span>
            <span className="text-sm font-semibold text-muted-foreground">Processed</span>
          </div>
        </div>

        {/* Verified Places Card */}
        <div className="bg-background rounded-2xl border shadow-sm p-6 flex flex-col justify-between h-40 group">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Verified Places</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-foreground">{verifiedCount || 0}</span>
            <span className="text-sm font-semibold text-muted-foreground">in DB</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="bg-background border rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-2">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <Link 
              href="/admin/suggestions"
              className="px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors text-center"
            >
              Review Pending Queue
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
