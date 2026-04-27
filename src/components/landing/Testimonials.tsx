const testimonials = [
  {
    quote:
      "Exactly what the climbing community needed. I can finally see all the outdoor boulders mapped properly without jumping between three different apps.",
    author: "Alex C.",
    discipline: "Boulderer",
    grade: "V10",
  },
  {
    quote:
      "The filtering system is brilliant. Toggle between indoor gyms for weeknight training and crags for the weekend—saves so much time.",
    author: "Sarah J.",
    discipline: "Sport Climber",
    grade: "5.12b",
  },
  {
    quote:
      "Hooks directly into Google Maps for navigation. Finding obscure crags has never been this seamless.",
    author: "David M.",
    discipline: "Trad Climber",
    grade: "5.11c",
  },
]

export default function Testimonials() {
  return (
    <section className="w-full py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <h2 className="font-display text-5xl sm:text-6xl font-black uppercase leading-none tracking-tight">
            The Community<br />
            <span className="text-primary">Speaks.</span>
          </h2>
          <p className="text-muted-foreground sm:max-w-xs text-sm leading-relaxed">
            From weekend warriors to sponsored athletes—climbers of all levels are using Crux to find their next project.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="group relative bg-background rounded-2xl p-8 border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-default flex flex-col justify-between gap-8"
            >
              {/* Giant quote mark */}
              <span
                className="absolute top-5 right-6 font-display text-7xl font-black leading-none select-none text-foreground/[0.04] group-hover:text-primary/10 transition-colors duration-300"
                aria-hidden
              >
                &ldquo;
              </span>

              <p className="relative text-foreground/80 text-[15px] leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-foreground">{t.author}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t.discipline}</div>
                </div>
                <span className="text-[11px] font-black tracking-widest font-mono border rounded-full px-2.5 py-1 text-primary border-primary/30 bg-primary/5">
                  {t.grade}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
