import { Card, CardContent, CardFooter } from "@/components/ui/card"

export default function Testimonials() {
  const testimonials = [
    {
      quote: "Exactly what the climbing community needed. I can finally see all the outdoor boulders mapped properly without jumping between three different apps.",
      author: "Alex C.",
      role: "Boulderer"
    },
    {
      quote: "The filtering system is amazing. Being able to toggle between indoor gyms for weeknight training and crags for the weekend saves so much time.",
      author: "Sarah J.",
      role: "Sport Climber"
    },
    {
      quote: "I love that it hooks directly into Google Maps for navigation. Finding new, obscure crags has never been easier.",
      author: "David M.",
      role: "Trad Climber"
    }
  ]

  return (
    <section className="w-full py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Built for Climbers</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See what the community is saying about Crux.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <Card key={idx} className="bg-muted/30 border-muted relative hover:-translate-y-2 hover:shadow-lg hover:bg-muted/50 transition-all duration-300 group cursor-default">
              <CardContent className="pt-8">
                <div className="mb-4 text-4xl text-primary font-serif absolute top-4 left-4 opacity-20 transition-opacity duration-300 group-hover:opacity-40">&quot;</div>
                <p className="relative z-10 text-base leading-relaxed text-foreground/80 italic group-hover:text-foreground transition-colors">
                  &quot;{t.quote}&quot;
                </p>
              </CardContent>
              <CardFooter className="flex flex-col items-start px-6 pb-8">
                <div className="font-semibold">{t.author}</div>
                <div className="text-sm text-primary font-medium">{t.role}</div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
