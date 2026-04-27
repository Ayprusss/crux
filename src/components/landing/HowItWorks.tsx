import { Search, MapPin, Navigation } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Search Your Area",
    description:
      "Find an indoor gym for a weeknight session or hunt down that hidden crag for the weekend. Search by location, type, or discipline.",
    icon: Search,
  },
  {
    number: "02",
    title: "Discover What's There",
    description:
      "See disciplines, amenities, and community condition reports at a glance. Filter the noise, focus on the rock.",
    icon: MapPin,
  },
  {
    number: "03",
    title: "Get Directions",
    description:
      "One tap launches Google Maps or your preferred navigation app. From screen to summit in seconds.",
    icon: Navigation,
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="text-center mb-20">
          <p className="text-primary font-bold tracking-[0.15em] uppercase text-xs mb-3">Process</p>
          <h2 className="font-display text-5xl sm:text-6xl font-black uppercase leading-none tracking-tight">
            Three Steps.<br />One Summit.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-[3.25rem] left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-border z-0" />

          {steps.map((step, idx) => (
            <div key={step.number} className="relative flex flex-col items-center text-center px-6 md:px-8 pb-10 md:pb-0 group">
              {/* Step icon bubble */}
              <div className="relative z-10 mb-8 flex flex-col items-center gap-3">
                <div className="h-[6.5rem] w-[6.5rem] rounded-full bg-background border-2 border-border flex items-center justify-center shadow-sm transition-all duration-300 group-hover:border-primary group-hover:shadow-md group-hover:shadow-primary/10">
                  <step.icon className="h-8 w-8 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                </div>
              </div>

              {/* Step number + title */}
              <div className="mb-3 flex items-center gap-2">
                <span className="font-display text-xs font-black text-primary tracking-widest uppercase">{step.number}</span>
                <div className="h-px w-4 bg-primary/40" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px] mx-auto">
                {step.description}
              </p>

              {/* Mobile connector */}
              {idx < steps.length - 1 && (
                <div className="md:hidden mt-10 mb-2 w-px h-8 bg-border mx-auto" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
