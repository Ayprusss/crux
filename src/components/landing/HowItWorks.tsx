import { Search, MapPin, Navigation } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      title: "Search your area",
      description: "Find an indoor gym for training or an outdoor crag for the weekend.",
      icon: Search,
    },
    {
      title: "Discover what's there",
      description: "See the disciplines, amenities, and community condition reports in one glance.",
      icon: MapPin,
    },
    {
      title: "Get directions",
      description: "Click navigate to seamlessly jump into Google Maps or your preferred app.",
      icon: Navigation,
    },
  ]

  return (
    <section id="how-it-works" className="w-full py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">How it works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Three simple steps between you and the wall.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 justify-center items-center md:items-start relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-[2px] bg-muted -z-10" />
          
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center max-w-xs relative bg-background">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6 shadow-sm border-8 border-background">
                <step.icon className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                <span className="text-primary mr-2">{idx + 1}.</span>
                {step.title}
              </h3>
              <p className="text-muted-foreground text-base">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
