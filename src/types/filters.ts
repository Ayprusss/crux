export interface FilterState {
  environment: "all" | "indoor" | "outdoor"
  type: "all" | "gym" | "boulder" | "crag" | "wall" | "other"
  disciplines: string[]
}

export const DEFAULT_FILTERS: FilterState = {
  environment: "all",
  type: "all",
  disciplines: [],
}
