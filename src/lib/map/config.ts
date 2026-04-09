/** Map configuration defaults */

export const MAP_CONFIG = {
  /** Free CartoCDN basemap style */
  style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",

  /** Default center: Ottawa, Ontario */
  defaultCenter: {
    longitude: -75.6972,
    latitude: 45.4215,
  },

  /** Default zoom level (city-level view) */
  defaultZoom: 10,

  /** Min/max zoom bounds */
  minZoom: 3,
  maxZoom: 18,

  /** Debounce delay for viewport changes (ms) */
  viewportDebounceMs: 400,

  /** Clustering radius in pixels */
  clusterRadius: 50,

  /** Max zoom at which clusters are generated */
  clusterMaxZoom: 14,
}
