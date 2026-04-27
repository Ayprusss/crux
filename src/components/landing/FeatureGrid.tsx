import { Map, Search, Edit3, Navigation } from "lucide-react"

const features = [
  {
    number: "01",
    title: "Live Interactive Map",
    description:
      "Explore clustered markers across the globe, built on MapLibre and PostGIS for blazing-fast geospatial querying.",
    icon: Map,
  },
  {
    number: "02",
    title: "Search & Filter",
    description:
      "Filter by indoor gyms, outdoor boulders, crags, and specific climbing disciplines in seconds.",
    icon: Search,
  },
  {
    number: "03",
    title: "Community Submissions",
    description:
      "Suggest new spots or edit existing ones. A trusted moderation pipeline ensures data quality.",
    icon: Edit3,
  },
  {
    number: "04",
    title: "Navigation Handoff",
    description:
      "Launch seamless directions straight to your favorite navigation app with a single tap.",
    icon: Navigation,
  },
]

export default function FeatureGrid() {
  return (
    <section id="features" className="w-full py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16 pb-8 border-b border-border">
          <h2 className="font-display text-5xl sm:text-6xl font-black uppercase leading-none tracking-tight text-foreground">
            Built for<br />
            <span className="text-primary">the Wall.</span>
          </h2>
          <p className="text-muted-foreground sm:max-w-xs text-base leading-relaxed">
            Everything you need to find, log, and share your next climb—built from the ground up for the climbing community.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
          {features.map((feature) => (
            <div
              key={feature.number}
              className="group bg-background p-8 sm:p-10 flex flex-col gap-6 hover:bg-muted/40 transition-colors duration-300 cursor-default"
            >
              <div className="flex items-start justify-between">
                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105">
                  <feature.icon className="h-5 w-5" />
                </div>
                <span className="font-display text-6xl font-black leading-none text-foreground/[0.06] select-none group-hover:text-primary/15 transition-colors duration-300">
                  {feature.number}
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div className="w-0 h-0.5 bg-primary transition-all duration-500 group-hover:w-12" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
