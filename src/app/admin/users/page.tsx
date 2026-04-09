import { createClient } from "@/lib/supabase/server"
import { ShieldAlert, Users, ShieldCheck, user, Check, X, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { nominateUser, approveEscalation, rejectEscalation } from "@/app/actions/admin"

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: { user: currentUser } } = await supabase.auth.getUser()

  // Fetch pending escalations
  const { data: activeNominations } = await supabase
    .from("role_escalations")
    .select(`
      *,
      target:profiles!role_escalations_target_user_id_fkey(display_name, email, role),
      nominator:profiles!role_escalations_nominated_by_fkey(display_name, email)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  // Fetch all users
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, email, role, created_at")
    .order("created_at", { ascending: false })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-foreground">User Roles & Security</h1>
        <p className="text-muted-foreground mt-1 font-medium">Dual-approval escalation framework.</p>
      </div>

      {activeNominations && activeNominations.length > 0 && (
        <div className="space-y-4 mb-12">
          <h2 className="text-lg font-bold flex items-center gap-2 text-amber-600">
            <ShieldAlert className="w-5 h-5" /> 
            Pending Admin Nominations
          </h2>
          <div className="bg-amber-50/50 border border-amber-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-amber-100">
            {activeNominations.map((nom) => {
              const target = nom.target as any
              const nominator = nom.nominator as any
              const iAmNominator = nom.nominated_by === currentUser?.id

              return (
                <div key={nom.id} className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-amber-950">
                      {target?.display_name || target?.email || "Unknown User"}
                    </h3>
                    <p className="text-sm font-medium text-amber-700 mt-1">
                      Nominated for <span className="uppercase font-black tracking-wider text-xs bg-amber-200/50 px-2 py-0.5 rounded-full">{nom.requested_role}</span> by {nominator?.display_name || nominator?.email}
                    </p>
                  </div>
                  
                  <div className="shrink-0 flex gap-2 w-full sm:w-auto">
                    {iAmNominator ? (
                       <Button variant="outline" disabled className="w-full sm:w-auto bg-amber-100/50 border-amber-200 text-amber-700 opacity-60">
                         Waiting for 2nd Admin
                       </Button>
                    ) : (
                      <>
                        <form action={async () => {
                          "use server"
                          await rejectEscalation(nom.id)
                        }}>
                          <Button variant="ghost" className="text-red-700 hover:text-red-800 hover:bg-red-100 w-full sm:w-auto">
                            <X className="w-4 h-4 mr-2" /> Reject
                          </Button>
                        </form>
                        <form action={async () => {
                          "use server"
                          await approveEscalation(nom.id)
                        }}>
                          <Button className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto">
                            <Check className="w-4 h-4 mr-2" /> Approve
                          </Button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Roster */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
          <Users className="w-5 h-5 text-muted-foreground" /> 
          Platform Directory
        </h2>
        <div className="bg-background border rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/50 text-muted-foreground font-semibold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {profiles?.map((profile) => {
                const isAdmin = profile.role === "admin"
                const isModerator = profile.role === "moderator"

                return (
                  <tr key={profile.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">{profile.display_name || "Unnamed"}</div>
                      <div className="text-muted-foreground text-xs">{profile.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                          <ShieldCheck className="w-3.5 h-3.5" /> Admin
                        </span>
                      ) : isModerator ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 font-bold text-xs uppercase tracking-wider">
                          <Shield className="w-3.5 h-3.5" /> Moderator
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       {!isAdmin && (
                         <form action={async () => {
                           "use server"
                           await nominateUser(profile.id)
                         }}>
                            <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              Nominate Admin
                            </Button>
                         </form>
                       )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
