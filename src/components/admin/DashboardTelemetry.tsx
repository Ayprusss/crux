"use client"

import { useMemo, useState } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface CompactPlace {
  source: string
  type: string
  environment: string
}

interface DashboardTelemetryProps {
  data: CompactPlace[]
}

const PLACE_TYPES = ["all", "gym", "boulder", "crag", "wall", "other"] as const
const ENVIRONMENTS = ["all", "indoor", "outdoor"] as const

const COLORS = {
  osm: "#3b82f6",     // blue-500
  user: "#10b981",    // emerald-500
}

export default function DashboardTelemetry({ data }: DashboardTelemetryProps) {
  const [filterEnv, setFilterEnv] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")

  // Generate chart data based on selected filters
  const chartData = useMemo(() => {
    let osmCount = 0
    let userCount = 0

    for (const place of data) {
      if (filterEnv !== "all" && place.environment !== filterEnv) continue
      if (filterType !== "all" && place.type !== filterType) continue

      if (place.source === "user") {
        userCount++
      } else {
        // null source or 'osm' falls to osm for metric purposes
        osmCount++
      }
    }

    return [
      { name: "OSM Network", value: osmCount, fill: COLORS.osm },
      { name: "Community Uploads", value: userCount, fill: COLORS.user }
    ]
  }, [data, filterEnv, filterType])

  const total = chartData[0].value + chartData[1].value

  return (
    <div className="bg-background border rounded-2xl shadow-sm p-6 flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:flex-wrap lg:items-end justify-between gap-6 border-b pb-4">
        <div>
          <h3 className="font-bold text-lg text-foreground">Data Telemetry</h3>
          <p className="text-sm text-muted-foreground font-medium">Analyze real-time map coverage splits.</p>
        </div>
        
        {/* Metric Toggles */}
        <div className="flex flex-wrap gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Environment</label>
            <div className="flex flex-wrap bg-muted/40 p-1 rounded-xl gap-1">
              {ENVIRONMENTS.map((env) => (
                <button
                  key={env}
                  onClick={() => setFilterEnv(env)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${
                    filterEnv === env 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Type</label>
            <div className="flex flex-wrap bg-muted/40 p-1 rounded-xl gap-1">
              {PLACE_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${
                    filterType === t 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center justify-items-center pt-8">
        {/* The Recharts Pie */}
        <div className="relative w-full max-w-[300px] min-h-[250px] aspect-square flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                itemStyle={{ fontWeight: 600, color: 'black' }}
                formatter={(value: any) => [value, "Locations"]}
              />
              <Legend 
                verticalAlign="bottom" 
                align="center" 
                iconType="circle"
                wrapperStyle={{ paddingTop: '15px' }}
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="65%"
                outerRadius="85%"
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} className="hover:opacity-80 transition-opacity outline-none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Centered Donut Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-[28px]">
             <span className="text-4xl font-black text-foreground">{total}</span>
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Total</span>
          </div>
        </div>

        {/* Metric Summaries Context */}
        <div className="w-full max-w-sm space-y-4">
           {total === 0 ? (
             <div className="text-center p-6 border border-dashed rounded-xl text-muted-foreground font-medium bg-muted/10">
               No matching locations found for these filters.
             </div>
           ) : (
              <div className="flex flex-col gap-4">
                <div className="p-5 border rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden bg-white dark:bg-black">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500" />
                  <div className="pl-2">
                     <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">OSM Pipeline</p>
                     <p className="text-2xl font-black mt-1 text-foreground">{chartData[0].value}</p>
                  </div>
                  <div className="text-right">
                     <div className="text-3xl font-black text-blue-500/20">{Math.round((chartData[0].value / total) * 100)}%</div>
                  </div>
                </div>

                <div className="p-5 border rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden bg-emerald-50/50 dark:bg-emerald-950/20">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
                  <div className="pl-2">
                     <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">Community Verification</p>
                     <p className="text-2xl font-black text-emerald-950 dark:text-emerald-50 mt-1">{chartData[1].value}</p>
                  </div>
                  <div className="text-right">
                     <div className="text-3xl font-black text-emerald-500/30">{Math.round((chartData[1].value / total) * 100)}%</div>
                  </div>
                </div>
              </div>
           )}
        </div>
      </div>
    </div>
  )
}
