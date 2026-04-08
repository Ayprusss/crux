import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MountainIcon } from "@/components/ui/MountainIcon"

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <MountainIcon className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
          <span className="text-xl font-bold tracking-tight">Crux</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <Link href="/#features" className="transition-colors hover:text-foreground text-foreground/60">
            Features
          </Link>
          <Link href="/#how-it-works" className="transition-colors hover:text-foreground text-foreground/60">
            How It Works
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/map">
            <Button className="rounded-xl font-bold shadow-md shadow-primary/10">Open Map</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
