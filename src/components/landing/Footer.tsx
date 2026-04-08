import Link from "next/link"
import { MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-muted/40 py-12">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6 px-4 sm:px-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link href="/" className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold tracking-tight">Crux</span>
          </Link>
          <p className="text-sm text-muted-foreground text-center md:text-left">
            A community-driven climbing map. Discover spots, suggest edits.
          </p>
        </div>
        <div className="flex gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/#features" className="hover:text-foreground">
            Features
          </Link>
          <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
            GitHub
          </Link>
          <Link href="#" className="hover:text-foreground">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  )
}
