import Navbar from "@/components/layout/Navbar"
import Hero from "@/components/landing/Hero"
import FeatureGrid from "@/components/landing/FeatureGrid"
import HowItWorks from "@/components/landing/HowItWorks"
import MapPreview from "@/components/landing/MapPreview"
import CommunityFeed from "@/components/landing/CommunityFeed"
import Footer from "@/components/landing/Footer"
import { AnimatedSection } from "@/components/landing/AnimatedSection"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Navbar />
      <main className="flex-1 text-foreground">

        {/* Hero has its own CSS load animations — no scroll trigger needed */}
        <Hero />

        <AnimatedSection>
          <FeatureGrid />
        </AnimatedSection>

        <AnimatedSection delay={50}>
          <HowItWorks />
        </AnimatedSection>

        <AnimatedSection delay={50}>
          <MapPreview />
        </AnimatedSection>

        <AnimatedSection delay={50}>
          <CommunityFeed />
        </AnimatedSection>

        {/* Final CTA */}
        <AnimatedSection delay={50}>
          <section className="w-full py-28 bg-primary">
            <div className="container mx-auto px-4 sm:px-8 text-center">
              <p className="text-[11px] font-bold tracking-[0.18em] uppercase mb-4 text-primary-foreground/60">
                Ready to Send?
              </p>
              <h2 className="font-display text-5xl sm:text-7xl font-black uppercase leading-none tracking-tight text-primary-foreground mb-6">
                Find Your<br />Next Project.
              </h2>
              <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto mb-10">
                Join thousands of climbers discovering gyms, boulders, and crags on the community-driven map.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="/map"
                  className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-background text-primary text-sm font-bold hover:bg-background/90 transition-colors"
                >
                  Start Exploring — It&apos;s Free
                </a>
                <a
                  href="/#features"
                  className="inline-flex items-center justify-center h-12 px-8 rounded-lg border border-primary-foreground/25 text-primary-foreground text-sm font-bold hover:bg-primary-foreground/10 transition-colors"
                >
                  See Features
                </a>
              </div>
            </div>
          </section>
        </AnimatedSection>

      </main>
      <Footer />
    </div>
  )
}
