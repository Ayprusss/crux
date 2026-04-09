"use client"

import { useRef, useCallback, useState, useEffect } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import Map, { Source, Layer, Popup, NavigationControl, GeolocateControl } from "react-map-gl/maplibre"
import type { MapRef, MapLayerMouseEvent } from "react-map-gl/maplibre"
import type { Place } from "@/types/place"
import { MAP_CONFIG } from "@/lib/map/config"
import { getBoundsFromMap } from "@/lib/map/helpers"
import { useMapViewport } from "@/hooks/useMapViewport"
import { usePlaces } from "@/hooks/usePlaces"
import { useFilters } from "@/hooks/useFilters"
import { useFavorites } from "@/hooks/useFavorites"
import MarkerPopup from "@/components/map/MarkerPopup"
import DetailPanel from "@/components/places/DetailPanel"
import SearchBar from "@/components/search/SearchBar"
import FilterBar from "@/components/places/FilterBar"
import SuggestionFormPanel from "@/components/places/SuggestionFormPanel"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"

// Force maplibre-gl into the react-map-gl integration
// eslint-disable-next-line @typescript-eslint/no-require-imports
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).maplibregl = maplibregl
}

/**
 * Convert places array to GeoJSON FeatureCollection for clustering.
 */
function placesToGeoJSON(places: Place[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: places.map((place) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [place.longitude, place.latitude],
      },
      properties: {
        id: place.id,
        name: place.name,
        type: place.type,
        environment: place.environment,
        city: place.city,
        region: place.region,
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
        disciplines: JSON.stringify(place.disciplines),
        amenities: JSON.stringify(place.amenities),
        description: place.description,
        source: place.source,
        verified: place.verified,
        created_at: place.created_at,
        updated_at: place.updated_at,
        osm_id: place.osm_id,
        submitted_by: place.submitted_by,
        slug: place.slug,
        country: place.country,
      },
    })),
  }
}

/** Reconstruct a Place from GeoJSON feature properties */
function featureToPlace(properties: Record<string, unknown>): Place {
  return {
    id: properties.id as string,
    name: properties.name as string,
    slug: (properties.slug as string) || null,
    type: properties.type as Place["type"],
    environment: properties.environment as Place["environment"],
    latitude: properties.latitude as number,
    longitude: properties.longitude as number,
    address: (properties.address as string) || null,
    city: (properties.city as string) || null,
    region: (properties.region as string) || null,
    country: (properties.country as string) || "CA",
    disciplines: JSON.parse((properties.disciplines as string) || "[]"),
    amenities: JSON.parse((properties.amenities as string) || "[]"),
    description: (properties.description as string) || null,
    osm_id: (properties.osm_id as number) || null,
    submitted_by: (properties.submitted_by as string) || null,
    source: (properties.source as Place["source"]) || "osm",
    verified: (properties.verified as boolean) || false,
    created_at: (properties.created_at as string) || "",
    updated_at: (properties.updated_at as string) || "",
  }
}

interface MapContainerProps {
  jumpCoords?: { lat: number, lng: number } | null
  isSavedOpen?: boolean
}

export default function MapContainer({ jumpCoords, isSavedOpen = false }: MapContainerProps) {
  const mapRef = useRef<MapRef>(null)
  const { bounds, updateBounds } = useMapViewport()
  const { filters, updateFilters, resetFilters, toggleDiscipline } = useFilters()
  const { savedIds } = useFavorites()
  const { places, loading, totalCached } = usePlaces(bounds, filters, savedIds)

  const [popupPlace, setPopupPlace] = useState<Place | null>(null)
  const [detailPlace, setDetailPlace] = useState<Place | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  const [isPickingLocation, setIsPickingLocation] = useState(false)
  const [suggestionMode, setSuggestionMode] = useState<"add" | "edit" | null>(null)
  const [suggestionCoords, setSuggestionCoords] = useState<{ lat: number; lng: number } | undefined>()

  const [cursor, setCursor] = useState("grab")
  const onMouseEnter = useCallback(() => setCursor("pointer"), [])
  const onMouseLeave = useCallback(() => setCursor("grab"), [])

  const geojson = placesToGeoJSON(places)

  /** Handle map load — trigger initial data fetch */
  const onMapLoad = useCallback(() => {
    setIsMapLoaded(true)
    const map = mapRef.current?.getMap()
    if (map) {
      updateBounds(getBoundsFromMap(map))
    }
  }, [updateBounds])

  /** Handle map move — debounced viewport update */
  const onMoveEnd = useCallback(() => {
    const map = mapRef.current?.getMap()
    if (map) {
      updateBounds(getBoundsFromMap(map))
    }
  }, [updateBounds])

  /** Handle map click — route to cluster zoom or marker popup */
  const onMapClick = useCallback((e: MapLayerMouseEvent) => {
    if (isPickingLocation) {
      setSuggestionCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng })
      setIsPickingLocation(false)
      setSuggestionMode("add")
      return
    }

    const feature = e.features?.[0]
    if (!feature || !mapRef.current) {
      setPopupPlace(null)
      return
    }

    const mapInstance = mapRef.current.getMap()

    // Cluster click → zoom in
    if (feature.properties?.cluster_id) {
      const clusterId = feature.properties.cluster_id as number
      const source = mapInstance.getSource("places") as maplibregl.GeoJSONSource

      source.getClusterExpansionZoom(clusterId).then((zoom) => {
        const geometry = feature.geometry as GeoJSON.Point
        mapInstance.easeTo({
          center: geometry.coordinates as [number, number],
          zoom,
          duration: 500,
        })
      })
      return
    }

    // Individual marker click → show popup
    const place = featureToPlace(
      feature.properties as Record<string, unknown>
    )
    setPopupPlace(place)
  }, [isPickingLocation])

  /** Open detail panel */
  const onViewDetails = useCallback((place: Place) => {
    setPopupPlace(null)
    setDetailPlace(place)
  }, [])

  /** Fly map to a searched location */
  const onSearchSelect = useCallback((lat: number, lng: number) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: 14,
      duration: 1500,
    })
  }, [])

  /** Effect to handle jumpCoords from parent */
  useEffect(() => {
    if (jumpCoords && mapRef.current && isMapLoaded) {
      mapRef.current.flyTo({
        center: [jumpCoords.lng, jumpCoords.lat],
        zoom: 15,
        duration: 1200,
      })
    }
  }, [jumpCoords, isMapLoaded])

  /** Effect to automatically filter Map when Saved places panel opens */
  useEffect(() => {
    updateFilters({ favoritesOnly: isSavedOpen })
  }, [isSavedOpen, updateFilters])

  return (
    <div className="relative w-full h-full">
      {/* Top Controls UI Layer (pointer-events-none so map is clickable through empty space) */}
      <div className="absolute top-4 left-4 z-40 pointer-events-none flex flex-col items-start gap-3">
        <div className="pointer-events-auto">
          <SearchBar onSelect={onSearchSelect} />
        </div>
        <FilterBar
          filters={filters}
          updateFilters={updateFilters}
          toggleDiscipline={toggleDiscipline}
          resetFilters={resetFilters}
        />
        
        {/* Add Place Button */}
        <div className="pointer-events-auto">
          <Button 
            className={`rounded-xl shadow-md border gap-2 transition-all duration-300 ${isPickingLocation ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-background hover:bg-background/90 text-foreground'}`}
            onClick={() => {
              if (isPickingLocation) {
                setIsPickingLocation(false)
              } else {
                setIsPickingLocation(true)
                setPopupPlace(null)
                setDetailPlace(null)
              }
            }}
          >
            {isPickingLocation ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span className="hidden sm:inline font-semibold">
              {isPickingLocation ? "Cancel" : "Suggest Place"}
            </span>
          </Button>
        </div>
      </div>
      <Map
        ref={mapRef}
        mapLib={maplibregl}
        mapStyle={MAP_CONFIG.style}
        initialViewState={{
          longitude: MAP_CONFIG.defaultCenter.longitude,
          latitude: MAP_CONFIG.defaultCenter.latitude,
          zoom: MAP_CONFIG.defaultZoom,
        }}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        onLoad={onMapLoad}
        onMoveEnd={onMoveEnd}
        onClick={onMapClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        interactiveLayerIds={["clusters", "unclustered-point"]}
        cursor={isPickingLocation ? "crosshair" : cursor}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Navigation controls */}
        <NavigationControl position="top-right" showCompass={false} />
        <GeolocateControl position="top-right" />

        {/* Clustered places source - Only render when map is loaded */}
        {isMapLoaded && (
          <Source
            id="places"
            type="geojson"
            data={geojson}
            cluster={true}
            clusterMaxZoom={MAP_CONFIG.clusterMaxZoom}
            clusterRadius={MAP_CONFIG.clusterRadius}
          >
          {/* Cluster circles */}
          <Layer
            id="clusters"
            type="circle"
            filter={["has", "point_count"]}
            paint={{
              "circle-color": [
                "step",
                ["get", "point_count"],
                "#51cf66",  // green for small clusters
                10,
                "#37b24d",  // darker green for medium
                50,
                "#2b8a3e",  // darkest green for large
              ],
              "circle-radius": [
                "step",
                ["get", "point_count"],
                18,   // small clusters
                10,
                24,   // medium clusters
                50,
                32,   // large clusters
              ],
              "circle-stroke-width": 3,
              "circle-stroke-color": "#fff",
              "circle-opacity": 0.9,
            }}
          />

          {/* Cluster count labels */}
          <Layer
            id="cluster-count"
            type="symbol"
            filter={["has", "point_count"]}
            layout={{
              "text-field": "{point_count_abbreviated}",
              "text-font": ["Open Sans Bold"],
              "text-size": 13,
            }}
            paint={{
              "text-color": "#ffffff",
            }}
          />

          {/* Individual place markers */}
          <Layer
            id="unclustered-point"
            type="circle"
            filter={["!", ["has", "point_count"]]}
            paint={{
              "circle-color": [
                "match",
                ["get", "environment"],
                "indoor", "#51cf66",
                "outdoor", "#2b8a3e",
                "#868e96",
              ],
              "circle-radius": 8,
              "circle-stroke-width": 2.5,
              "circle-stroke-color": "#ffffff",
              "circle-opacity": 0.95,
            }}
          />
        </Source>
        )}

        {/* Marker Popup */}
        {popupPlace && (
          <Popup
            longitude={popupPlace.longitude}
            latitude={popupPlace.latitude}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={12}
            className="[&_.maplibregl-popup-content]:!p-0 [&_.maplibregl-popup-content]:!bg-transparent [&_.maplibregl-popup-content]:!shadow-none [&_.maplibregl-popup-tip]:!border-t-background"
          >
            <MarkerPopup
              place={popupPlace}
              onClose={() => setPopupPlace(null)}
              onViewDetails={onViewDetails}
            />
          </Popup>
        )}
      </Map>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-background/90 backdrop-blur border rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-semibold text-foreground">Loading places…</span>
        </div>
      )}

      {/* Place count badge */}
      {!loading && totalCached > 0 && (
        <div className="absolute bottom-6 left-4 z-40 bg-background/90 backdrop-blur border rounded-full px-3 py-1.5 shadow-md">
          <span className="text-xs font-semibold text-muted-foreground">{places.length} in view · {totalCached} total</span>
        </div>
      )}

      {/* Detail Panel (slides in from right) */}
      {detailPlace && (
        <DetailPanel
          place={detailPlace}
          onClose={() => setDetailPlace(null)}
          onEdit={() => setSuggestionMode("edit")}
        />
      )}

      {/* Suggestion Form Panel */}
      {suggestionMode && (
        <SuggestionFormPanel
          mode={suggestionMode}
          place={suggestionMode === "edit" && detailPlace ? detailPlace : undefined}
          coordinates={suggestionCoords}
          onClose={() => setSuggestionMode(null)}
          onSuccess={() => setSuggestionMode(null)}
        />
      )}
    </div>
  )
}
