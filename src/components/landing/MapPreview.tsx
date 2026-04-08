import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function MapPreview() {
  return (
    <section className="w-full py-24 bg-muted/20 border-y">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">The ultimate interactive map.</h2>
            <p className="text-lg text-muted-foreground">
              Built on MapLibre and seeded by OpenStreetMap data, Crux guarantees 
              unmatched speed and accuracy when you&apos;re looking for global climbing spots.
            </p>
            <ul className="space-y-4 pt-4">
              {["Blazing fast geospatial querying with PostGIS", "Filter by Discipline, Environment, and Amenities", "Real-time viewport-based loading"].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
            <div className="pt-6">
              <Link href="/map">
                <Button size="lg" className="px-8">
                  Try the Map Now
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full relative">
            {/* Mockup Map Frame */}
            <div className="aspect-[4/3] rounded-xl overflow-hidden border shadow-2xl bg-muted/40 relative group cursor-pointer hover:shadow-primary/20 transition-all duration-500">
              <div className="absolute inset-0 flex items-center justify-center p-8 transition-transform duration-500 group-hover:scale-105">
                <div className="text-center space-y-4 p-8 rounded-xl bg-background/80 backdrop-blur border shadow-sm max-w-sm transition-colors duration-300 group-hover:bg-background/95">
                  <h3 className="font-semibold text-lg text-primary">Interactive Map Preview</h3>
                  <p className="text-sm text-muted-foreground">The actual map renders via MapLibre GL in the full application.</p>
                </div>
              </div>
              {/* Fake Map Elements */}
              <div className="absolute top-4 left-4 h-10 w-48 bg-background border rounded-md shadow-sm transition-transform duration-500 group-hover:-translate-y-1" />
              <div className="absolute top-4 right-4 h-10 w-10 bg-background border rounded-md shadow-sm transition-transform duration-500 group-hover:rotate-12" />
              <div className="absolute top-2/3 left-1/4 h-8 w-8 bg-primary rounded-full shadow-lg flex items-center justify-center border-2 border-background transition-all duration-500 group-hover:-translate-y-4 group-hover:scale-110">
                <span className="absolute -bottom-1 w-2 h-2 bg-primary rotate-45 -z-10" />
                <span className="text-[10px] text-primary-foreground font-bold">12</span>
              </div>
              <div className="absolute top-1/3 right-1/4 h-6 w-6 bg-accent rounded-full blur-[1px] shadow-lg border-2 border-background transition-transform duration-500 group-hover:scale-150" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
