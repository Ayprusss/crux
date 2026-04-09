"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { signout } from "@/app/(auth)/actions"
import type { User } from "@supabase/supabase-js"

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user)
      if (user) {
        const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single()
        setIsAdmin(data?.role === "admin" || data?.role === "moderator")
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null
      setUser(currentUser)
      if (currentUser) {
        const { data } = await supabase.from("profiles").select("role").eq("id", currentUser.id).single()
        setIsAdmin(data?.role === "admin" || data?.role === "moderator")
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="h-9 w-20 animate-pulse bg-muted rounded-md" />
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        {isAdmin && (
          <Link href="/admin" className="text-sm font-black text-primary hover:text-primary/80">
            Admin
          </Link>
        )}
        <Link href="/profile" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
          Profile
        </Link>
        <form action={signout}>
          <Button variant="outline" size="sm" type="submit" className="rounded-xl">
            Log out
          </Button>
        </form>
      </div>
    )
  }

  return (
    <Link href="/login">
      <Button variant="outline" size="sm" className="rounded-xl">
        Log in
      </Button>
    </Link>
  )
}
