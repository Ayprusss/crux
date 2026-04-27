import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MountainIcon } from "@/components/ui/MountainIcon"
import { Heart } from "lucide-react"
import { AuthButton } from "@/components/auth/AuthButton"
import { ThemeToggle } from "@/components/theme/ThemeToggle"

interface NavbarProps {
  onToggleSaved?: () => void
  showMapButton?: boolean
  showLinks?: boolean
}

export default function Navbar({ onToggleSaved, showMapButton = true, showLinks = true }: NavbarProps) {
  return (
    /*
     * Force dark-mode context on the navbar so all child tokens
     * (text-foreground, text-muted-foreground, border-border, etc.)
     * resolve to dark-theme values regardless of the user's active theme.
     */
    <header
      className="dark sticky top-0 z-50 w-full border-b"
      style={{ backgroundColor: "#0c120b", borderColor: "rgba(255,255,255,0.07)" }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <MountainIcon className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
          <span
            className="font-display text-xl font-black uppercase tracking-wide text-white"
          >
            Crux
          </span>
        </Link>

        {/* Nav links */}
        {showLinks && (
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold">
            <Link
              href="/#features"
              className="transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              How It Works
            </Link>
          </nav>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {onToggleSaved && (
            <Button
              variant="ghost"
              className="gap-2 font-semibold"
              style={{ color: "rgba(255,255,255,0.5)" }}
              onClick={onToggleSaved}
            >
              <Heart className="h-4 w-4" />
              Saved
            </Button>
          )}

          {showMapButton && (
            <Link href="/map">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold text-primary border-primary/50 hover:bg-primary/10 hover:border-primary"
                style={{ backgroundColor: "transparent" }}
              >
                Map
              </Button>
            </Link>
          )}

          <ThemeToggle />

          <div className="w-px h-5 mx-1" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />

          <AuthButton />
        </div>
      </div>
    </header>
  )
}
