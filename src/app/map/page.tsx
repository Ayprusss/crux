import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/landing/Footer"

export default function MapPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Navbar />
      <main className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Map Experience</h1>
          <p className="text-muted-foreground text-lg">
            This page will contain the full-viewport MapLibre experience.
          </p>
        </div>
      </main>
      {/* We may or may not want the footer on the full map page depending on layout needs, but we'll include it for now to test routing. */}
      <Footer />
    </div>
  )
}
