"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { signout } from "@/app/(auth)/actions"
import { useAuth } from "./AuthProvider"

export function AuthButton() {
  const { user, isAdmin, loading } = useAuth()

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
