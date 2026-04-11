"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false
})

export function AuthProvider({ 
  children,
  initialUser,
  initialIsAdmin
}: { 
  children: React.ReactNode
  initialUser: User | null
  initialIsAdmin: boolean
}) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin)
  const [loading, setLoading] = useState(false)

  // Sync state if server passes distinct new props (e.g. Server Action revalidatePath)
  useEffect(() => {
    setUser(initialUser)
    setIsAdmin(initialIsAdmin)
  }, [initialUser, initialIsAdmin])

  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      const currentUser = session?.user || null
      // Use local ID check to skip unneeded state dispatches
      if (currentUser?.id !== user?.id) {
        setUser(currentUser)
        if (currentUser) {
          const { data } = await supabase.from("profiles").select("role").eq("id", currentUser.id).single()
          setIsAdmin(data?.role === "admin" || data?.role === "moderator")
        } else {
          setIsAdmin(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [user?.id])

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
