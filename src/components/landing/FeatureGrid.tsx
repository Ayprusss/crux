import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Map, Search, Edit3, Navigation } from "lucide-react"

export default function FeatureGrid() {
  const features = [
    {
      title: "Live Interactive Map",
      description: "Explore clustered markers across the globe, focusing heavily on accurate and up-to-date data.",
      icon: Map,
    },
    {
      title: "Search & Filters",
      description: "Filter by indoor gyms, outdoor boulders, crags, and specific climbing disciplines.",
      icon: Search,
    },
    {
      title: "Community Submissions",
      description: "Suggest new spots or edit existing ones. A trusted moderation pipeline ensures quality.",
      icon: Edit3,
    },
    {
      title: "Navigation Handoff",
      description: "Get seamless directions straight to your favorite navigation app with a single click.",
      icon: Navigation,
    },
  ]

  return (
    <section id="features" className="w-full py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need to find the send</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built from the ground up to give climbers a fast, accurate, and community-curated directory of places to climb.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <Card key={i} className="border-muted bg-background hover:-translate-y-2 hover:shadow-xl hover:border-primary/20 transition-all duration-300 group cursor-default">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="transition-colors group-hover:text-primary">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
