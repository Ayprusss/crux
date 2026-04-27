import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronDown } from "lucide-react"

const grades = [
  { label: "V8",    top: "18%", left:  "4%",  delay: "0s",    dur: "6s"  },
  { label: "5.12a", top: "30%", right: "6%",  delay: "1.2s",  dur: "7s"  },
  { label: "7b+",   top: "55%", left:  "7%",  delay: "0.6s",  dur: "5.5s"},
  { label: "V3",    top: "68%", right: "5%",  delay: "1.8s",  dur: "8s"  },
  { label: "5.10d", top: "14%", right: "12%", delay: "2.2s",  dur: "6.5s"},
  { label: "6c",    top: "78%", left:  "13%", delay: "0.3s",  dur: "7.5s"},
]

const fu = (delay: string) =>
  `fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) ${delay} both`

export default function Hero() {
  return (
    <section
      className="relative w-full min-h-[94vh] overflow-hidden flex flex-col justify-center"
      style={{ backgroundColor: "#0c120b" }}
    >
      {/* ── Animated diagonal texture ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0, rgba(255,255,255,0.025) 1px, transparent 0, transparent 50%)",
          backgroundSize: "24px 24px",
          animation: "diagScroll 3s linear infinite",
        }}
      />

      {/* ── Animated glow blobs ── */}
      <div
        className="absolute top-[15%] left-[10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, oklch(0.65 0.16 150 / 0.18) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "blobDrift1 9s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[10%] right-[10%] w-[380px] h-[380px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, oklch(0.65 0.16 150 / 0.14) 0%, transparent 70%)",
          filter: "blur(70px)",
          animation: "blobDrift2 7s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-[50%] left-[50%] w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, oklch(0.65 0.16 150 / 0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "blobDrift3 11s ease-in-out infinite",
        }}
      />

      {/* ── Floating grade badges ── */}
      <div className="absolute inset-0 pointer-events-none">
        {grades.map((g) => (
          <span
            key={g.label}
            className="absolute text-[11px] font-black tracking-widest font-mono border rounded-full px-2 py-0.5"
            style={{
              top: g.top, left: g.left, right: g.right,
              color: "oklch(0.65 0.16 150 / 0.45)",
              borderColor: "oklch(0.65 0.16 150 / 0.22)",
              animation: `badgeFloat ${g.dur} ease-in-out ${g.delay} infinite`,
            }}
          >
            {g.label}
          </span>
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="container mx-auto px-4 sm:px-8 relative z-10 pt-20 pb-28">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold tracking-[0.15em] uppercase mb-10"
          style={{
            borderColor: "oklch(0.65 0.16 150 / 0.35)",
            color: "oklch(0.65 0.16 150)",
            backgroundColor: "oklch(0.65 0.16 150 / 0.08)",
            animation: fu("0.1s"),
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Community-Driven Rock Climbing Map
        </div>

        {/* Headline */}
        <h1
          className="font-display leading-[0.88] tracking-tight uppercase mb-10 text-white"
          style={{ fontSize: "clamp(3.8rem, 14vw, 13rem)", fontWeight: 900 }}
        >
          <span className="block" style={{ animation: fu("0.25s") }}>Find Your</span>
          <span className="block text-primary" style={{ animation: fu("0.42s") }}>Next Route.</span>
        </h1>

        {/* Divider + tagline */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-12"
          style={{ animation: fu("0.6s") }}
        >
          <div className="w-16 h-0.5 bg-primary shrink-0" />
          <p className="text-base sm:text-lg max-w-xl leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            A live, interactive map of gyms, boulders, and crags—seeded with open data
            and enriched by climbers like you.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3" style={{ animation: fu("0.72s") }}>
          <Link href="/map">
            <Button size="lg" className="h-12 px-8 text-sm font-bold tracking-wide rounded-lg group">
              Explore the Map
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/#features">
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-sm font-bold tracking-wide rounded-lg"
              style={{
                borderColor: "rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.8)",
                backgroundColor: "transparent",
              }}
            >
              See Features
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div
          className="flex flex-wrap gap-10 mt-20 pt-10 border-t"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            animation: fu("0.9s"),
          }}
        >
          {[
            { value: "10K+", label: "Routes & Locations" },
            { value: "500+", label: "Community Members" },
            { value: "40+",  label: "Countries Mapped" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="text-2xl font-black text-primary">{value}</span>
              <span className="text-[11px] uppercase tracking-[0.12em]" style={{ color: "rgba(255,255,255,0.35)" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div
        className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        style={{ color: "rgba(255,255,255,0.25)", animation: fu("1.1s") }}
      >
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Scroll</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </div>
    </section>
  )
}
