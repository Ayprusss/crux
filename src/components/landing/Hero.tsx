import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { MountainIcon } from "@/components/ui/MountainIcon"

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-background py-24 md:py-32">
      <div className="container mx-auto px-4 sm:px-8 relative z-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold mb-6 bg-primary/10 text-primary border-primary/20">
          <MountainIcon className="mr-2 h-4 w-4" />
          The community-driven climbing directory
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground max-w-4xl mb-6 leading-[1.1]">
          Find your next route with <span className="text-primary italic">Crux</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 font-medium">
          A live, interactive map of gyms, boulders, and crags seeded with open data and enriched by climbers like you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/map" className="w-full sm:w-auto">
            <Button size="lg" className="w-full h-12 px-8 text-base font-bold group rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
              Explore the Map
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/#how-it-works" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full h-12 px-8 text-base font-bold rounded-xl hover:bg-muted/50 transition-all">
              Learn More
            </Button>
          </Link>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 w-full h-full pointer-events-none flex items-end justify-center overflow-hidden">
        <MountainIcon className="w-full h-auto text-accent opacity-30 translate-y-1/4" strokeWidth="0.5" />
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] opacity-25 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/30 rounded-full blur-[140px]" />
      </div>
    </section>
  )
}
