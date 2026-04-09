"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { signout } from "@/app/(auth)/actions"
import type { User } from "@supabase/supabase-js"

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="h-9 w-20 animate-pulse bg-muted rounded-md" />
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
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
