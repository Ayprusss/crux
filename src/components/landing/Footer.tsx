import Link from "next/link"
import { MountainIcon } from "@/components/ui/MountainIcon"

const links = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Map", href: "/map" },
  { label: "GitHub", href: "https://github.com", external: true },
  { label: "Privacy", href: "#" },
]

export default function Footer() {
  return (
    <footer className="w-full" style={{ backgroundColor: "#0c120b" }}>
      <div className="container mx-auto px-4 sm:px-8 py-14">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <Link href="/" className="group flex items-center gap-2.5">
            <MountainIcon className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
            <span className="text-lg font-black tracking-tight text-white">Crux</span>
          </Link>

          {/* Nav */}
          <nav className="flex flex-wrap gap-x-8 gap-y-2">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                target={l.external ? "_blank" : undefined}
                rel={l.external ? "noopener noreferrer" : undefined}
                className="text-sm font-medium transition-colors"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 pt-8 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.25)" }}>
            © {new Date().getFullYear()} Crux. Community-driven climbing directory.
          </p>
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: "rgba(255,255,255,0.15)" }}>
            Open Source · Built with ♥ by climbers
          </p>
        </div>
      </div>
    </footer>
  )
}
