"use client"

import { useState, useCallback } from "react"
import { FilterState, DEFAULT_FILTERS } from "@/types/filters"

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const toggleDiscipline = useCallback((discipline: string) => {
    setFilters((prev) => {
      const exists = prev.disciplines.includes(discipline)
      if (exists) {
        return {
          ...prev,
          disciplines: prev.disciplines.filter((d) => d !== discipline),
        }
      } else {
        return {
          ...prev,
          disciplines: [...prev.disciplines, discipline],
        }
      }
    })
  }, [])

  return {
    filters,
    updateFilters,
    resetFilters,
    toggleDiscipline,
  }
}
