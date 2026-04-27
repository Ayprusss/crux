import { Heart, Plus, RefreshCw, Flag } from "lucide-react"

const tickerItems = [
  "Alex C. flashed V9 at Bishop Boulders",
  "Sarah J. sent 5.13b at Smith Rock",
  "David M. added 3 new routes at Yosemite",
  "Mike T. updated conditions at Red Rock",
  "Lisa K. logged a day at Hueco Tanks",
  "Jordan P. sent 7c at Fontainebleau",
  "Riley S. added a new crag near Moab",
  "Casey W. flashed V6 at Tramway",
]

type Activity = {
  type: "send" | "add" | "update" | "flag"
  grade: string
  route: string
  location: string
  user: string
  discipline: string
  time: string
  likes: number
  accent: string
}

const activities: Activity[] = [
  {
    type: "send",
    grade: "V9",
    route: "Mandala",
    location: "Bishop Boulders, CA",
    user: "Alex C.",
    discipline: "Boulderer",
    time: "2h ago",
    likes: 34,
    accent: "#f97316",
  },
  {
    type: "send",
    grade: "5.13b",
    route: "To Bolt or Not to Be",
    location: "Smith Rock, OR",
    user: "Sarah J.",
    discipline: "Sport Climber",
    time: "5h ago",
    likes: 21,
    accent: "#3b82f6",
  },
  {
    type: "add",
    grade: "5.11d",
    route: "Separate Reality",
    location: "Yosemite, CA",
    user: "David M.",
    discipline: "Trad Climber",
    time: "1d ago",
    likes: 18,
    accent: "#a16207",
  },
  {
    type: "send",
    grade: "V6",
    route: "Practice Roof",
    location: "Hueco Tanks, TX",
    user: "Mike T.",
    discipline: "Boulderer",
    time: "1d ago",
    likes: 11,
    accent: "#f97316",
  },
  {
    type: "update",
    grade: "5.12a",
    route: "Crimson Chrysalis",
    location: "Red Rock, NV",
    user: "Lisa K.",
    discipline: "Sport Climber",
    time: "2d ago",
    likes: 9,
    accent: "#3b82f6",
  },
  {
    type: "add",
    grade: "7c+",
    route: "Gecko",
    location: "Fontainebleau, FR",
    user: "Jordan P.",
    discipline: "Boulderer",
    time: "3d ago",
    likes: 27,
    accent: "#f97316",
  },
]

const activityIcon = {
  send:   { icon: Flag,      label: "Sent"    },
  add:    { icon: Plus,      label: "Added"   },
  update: { icon: RefreshCw, label: "Updated" },
  flag:   { icon: Flag,      label: "Flagged" },
}

const doubled = [...tickerItems, ...tickerItems]

export default function CommunityFeed() {
  return (
    <section className="w-full py-24 overflow-hidden" style={{ backgroundColor: "#0c120b" }}>
      {/* ── Header ── */}
      <div className="container mx-auto px-4 sm:px-8 mb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h2
            className="font-display text-5xl sm:text-6xl font-black uppercase leading-none tracking-tight text-white"
          >
            Community<br />
            <span className="text-primary">Feed.</span>
          </h2>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold tracking-[0.15em] uppercase text-primary">
              Live
            </span>
            <span className="text-xs text-white/30 ml-2">Updated moments ago</span>
          </div>
        </div>
      </div>

      {/* ── Marquee ticker ── */}
      <div
        className="w-full border-y py-3 mb-14 overflow-hidden"
        style={{ borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.03)" }}
      >
        <div
          style={{
            display: "flex",
            width: "max-content",
            animation: "marquee 35s linear infinite",
          }}
        >
          {doubled.map((item, i) => (
            <span key={i} className="flex items-center gap-3 px-6 text-sm font-medium whitespace-nowrap" style={{ color: "rgba(255,255,255,0.5)" }}>
              <span className="h-1 w-1 rounded-full bg-primary/60 shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Activity cards grid ── */}
      <div className="container mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((a, i) => {
            const { icon: Icon, label } = activityIcon[a.type]
            const initials = a.user.split(" ").map(w => w[0]).join("")

            return (
              <div
                key={i}
                className="relative rounded-xl p-6 flex flex-col gap-4 group cursor-default transition-all duration-300 hover:-translate-y-1"
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {/* Left accent border */}
                <div
                  className="absolute left-0 top-6 bottom-6 w-0.5 rounded-full"
                  style={{ backgroundColor: a.accent }}
                />

                {/* Grade + activity label */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-black tracking-widest font-mono border rounded-full px-2.5 py-1"
                    style={{ color: a.accent, borderColor: `${a.accent}40`, backgroundColor: `${a.accent}10` }}
                  >
                    {a.grade}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>
                    <Icon className="h-3 w-3" />
                    {label}
                  </div>
                </div>

                {/* Route info */}
                <div>
                  <p className="font-bold text-white text-base leading-snug">{a.route}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{a.location}</p>
                </div>

                {/* User + time + likes */}
                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                      style={{ backgroundColor: `${a.accent}20`, color: a.accent }}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white/70">{a.user}</p>
                      <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{a.discipline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>{a.time}</span>
                    <button className="flex items-center gap-1 group/like" aria-label="Like">
                      <Heart className="h-3.5 w-3.5 transition-colors" style={{ color: "rgba(255,255,255,0.25)" }} />
                      <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{a.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
