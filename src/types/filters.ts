export interface FilterState {
  environment: "all" | "indoor" | "outdoor"
  type: "all" | "gym" | "boulder" | "crag" | "wall" | "other"
  disciplines: string[]
  favoritesOnly: boolean
}

export const DEFAULT_FILTERS: FilterState = {
  environment: "all",
  type: "all",
  disciplines: [],
  favoritesOnly: false,
}
