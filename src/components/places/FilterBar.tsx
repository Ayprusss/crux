"use client"

import { FilterState } from "@/types/filters"
import { Filter, X } from "lucide-react"

interface FilterBarProps {
  filters: FilterState
  updateFilters: (updates: Partial<FilterState>) => void
  toggleDiscipline: (discipline: string) => void
  resetFilters: () => void
}

const DISCIPLINES = ["Bouldering", "Sport", "Trad", "Top Rope", "Auto Belay", "Lead"]

export default function FilterBar({ filters, updateFilters, toggleDiscipline, resetFilters }: FilterBarProps) {
  const isFiltered = filters.environment !== "all" || filters.type !== "all" || filters.disciplines.length > 0
  const isFavoritesOnly = filters.favoritesOnly || false

  return (
    <div className="flex items-center gap-2 bg-background/95 backdrop-blur border rounded-xl p-1.5 shadow-sm overflow-x-auto no-scrollbar pointer-events-auto">
      
      {/* Environment Toggle */}
      <div className="flex items-center bg-muted/50 rounded-lg p-0.5 shrink-0">
        <button
          onClick={() => updateFilters({ environment: "all" })}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
            filters.environment === "all" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        <button
          onClick={() => updateFilters({ environment: "indoor" })}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
            filters.environment === "indoor" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Indoor
        </button>
        <button
          onClick={() => updateFilters({ environment: "outdoor" })}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
            filters.environment === "outdoor" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Outdoor
        </button>
      </div>

      <div className="w-px h-6 bg-border mx-1 shrink-0" />

      {/* Disciplines Chips */}
      <div className="flex items-center gap-1.5 shrink-0">
        {DISCIPLINES.map((disc) => {
          const isActive = filters.disciplines.includes(disc)
          return (
            <button
              key={disc}
              onClick={() => toggleDiscipline(disc)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                isActive 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-background text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground"
              }`}
            >
              {disc}
            </button>
          )
        })}
      </div>

      {/* Clear Filters */}
      {isFiltered && (
        <>
          <div className="w-px h-6 bg-border mx-1 shrink-0" />
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors shrink-0"
          >
            <X className="h-3 w-3" />
            Reset
          </button>
        </>
      )}

    </div>
  )
}
