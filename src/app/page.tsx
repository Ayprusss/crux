import Navbar from "@/components/layout/Navbar"
import Hero from "@/components/landing/Hero"
import FeatureGrid from "@/components/landing/FeatureGrid"
import HowItWorks from "@/components/landing/HowItWorks"
import MapPreview from "@/components/landing/MapPreview"
import Testimonials from "@/components/landing/Testimonials"
import Footer from "@/components/landing/Footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Navbar />
      <main className="flex-1 text-foreground">
        <Hero />
        <FeatureGrid />
        <HowItWorks />
        <MapPreview />
        <Testimonials />
        
        {/* Final CTA Section */}
        <section className="w-full py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-8 text-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Ready to find your next route?</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join the community and start exploring the definitive climbing map.
            </p>
            <div className="pt-4">
              <a href="/map" className="inline-flex items-center justify-center rounded-lg bg-background text-primary px-8 h-12 text-lg font-semibold hover:bg-background/90 transition-colors">
                Start Exploring For Free
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
