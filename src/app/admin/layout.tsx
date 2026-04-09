import { redirect } from "next/navigation"
import { checkAdmin } from "@/app/actions/admin"
import Link from "next/link"
import { LayoutDashboard, Inbox, Users } from "lucide-react"
import Navbar from "@/components/layout/Navbar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAdmin = await checkAdmin()
  
  if (!isAdmin) {
    redirect("/") // Kick out unauthorized users
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-background border-r flex flex-col p-4 shadow-sm z-10">
          <div className="mb-8 px-2">
            <h2 className="text-xl font-black text-primary tracking-tight">Crux Admin</h2>
            <p className="text-xs text-muted-foreground font-medium">Moderation & Quality</p>
          </div>
          
          <nav className="space-y-1 flex-1">
            <Link 
              href="/admin" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </Link>
            <Link 
              href="/admin/suggestions" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Inbox className="h-4 w-4" />
              Suggestion Queue
            </Link>
            <Link 
              href="/admin/users" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Users className="h-4 w-4" />
              User Roles
            </Link>
          </nav>
        </aside>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
