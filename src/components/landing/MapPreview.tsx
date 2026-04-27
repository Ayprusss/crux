import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Layers, RefreshCw } from "lucide-react"

const bullets = [
  { icon: Zap, text: "Blazing-fast geospatial querying with PostGIS" },
  { icon: Layers, text: "Filter by discipline, environment, and amenities" },
  { icon: RefreshCw, text: "Real-time viewport-based data loading" },
]

export default function MapPreview() {
  return (
    <section className="w-full py-24 bg-background border-y border-border">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Copy */}
          <div className="space-y-8">
            <div>
              <p className="text-primary font-bold tracking-[0.15em] uppercase text-xs mb-3">The Map</p>
              <h2 className="font-display text-5xl sm:text-6xl font-black uppercase leading-[0.9] tracking-tight">
                Your New<br />
                <span className="text-primary">Climbing HQ.</span>
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Built on MapLibre and seeded by OpenStreetMap, Crux delivers
              unmatched speed and coverage when you&apos;re hunting for your next project.
            </p>
            <ul className="space-y-4">
              {bullets.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-4 group">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{text}</span>
                </li>
              ))}
            </ul>
            <div>
              <Link href="/map">
                <Button size="lg" className="h-11 px-7 text-sm font-bold rounded-lg group">
                  Try the Map
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Map mockup */}
          <div className="w-full">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border bg-muted/40 shadow-2xl shadow-black/10 group cursor-pointer">
              {/* Fake map background — topographic grid */}
              <div className="absolute inset-0 opacity-30">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="mapgrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#mapgrid)" />
                </svg>
              </div>

              {/* Fake road/terrain lines */}
              <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
                <path d="M0,150 Q100,80 200,140 T400,120" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted-foreground" strokeLinecap="round" />
                <path d="M0,200 Q80,160 160,190 T300,175 T400,180" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" strokeLinecap="round" />
                <path d="M100,0 Q120,80 110,150 T130,300" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" strokeLinecap="round" />
                <path d="M250,0 Q260,60 255,150 T270,300" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" strokeLinecap="round" />
              </svg>

              {/* Cluster pin — large */}
              <div className="absolute top-[38%] left-[28%] z-10 transition-transform duration-500 group-hover:-translate-y-2">
                <div className="relative flex items-center justify-center h-10 w-10 rounded-full bg-primary shadow-lg shadow-primary/40 border-2 border-background">
                  <span className="text-[10px] font-black text-primary-foreground">14</span>
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rotate-45" />
                </div>
              </div>

              {/* Single pin */}
              <div className="absolute top-[55%] right-[30%] z-10 transition-transform duration-500 group-hover:-translate-y-1.5">
                <div className="relative flex items-center justify-center h-7 w-7 rounded-full bg-primary/80 shadow-md border-2 border-background">
                  <span className="text-[8px] font-black text-primary-foreground">3</span>
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary/80 rotate-45" />
                </div>
              </div>

              {/* Small isolated pin */}
              <div className="absolute top-[22%] right-[20%] z-10 transition-transform duration-500 group-hover:translate-y-0.5">
                <div className="h-5 w-5 rounded-full bg-accent border-2 border-background shadow-sm" />
              </div>

              {/* Search bar */}
              <div className="absolute top-4 left-4 right-4 z-10">
                <div className="h-9 bg-background/90 backdrop-blur-sm rounded-lg border border-border shadow-sm flex items-center px-3 gap-2 transition-transform duration-500 group-hover:-translate-y-0.5">
                  <div className="h-3 w-3 rounded-full bg-primary/50 shrink-0" />
                  <div className="flex-1 h-2 rounded-full bg-muted" />
                </div>
              </div>

              {/* Zoom controls */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-10 transition-transform duration-500 group-hover:translate-x-0.5">
                <div className="h-7 w-7 bg-background/90 backdrop-blur-sm border border-border rounded-md shadow-sm flex items-center justify-center">
                  <span className="text-xs font-bold text-foreground/70">+</span>
                </div>
                <div className="h-7 w-7 bg-background/90 backdrop-blur-sm border border-border rounded-md shadow-sm flex items-center justify-center">
                  <span className="text-xs font-bold text-foreground/70">−</span>
                </div>
              </div>

              {/* Overlay label on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-background/80 backdrop-blur-sm rounded-xl px-5 py-3 border border-border shadow-lg text-center">
                  <p className="text-sm font-bold text-foreground">Live map in the app →</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
