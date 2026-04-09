import type { MapBounds } from "@/types/place"

/**
 * Extract bounds from a MapLibre map instance.
 */
export function getBoundsFromMap(map: maplibregl.Map): MapBounds {
  const bounds = map.getBounds()
  return {
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
  }
}
