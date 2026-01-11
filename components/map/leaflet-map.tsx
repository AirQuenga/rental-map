"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { Property } from "@/types/property"

// Butte County center coordinates
const BUTTE_COUNTY_CENTER: [number, number] = [39.65, -121.6]
const DEFAULT_ZOOM = 10

interface LeafletMapProps {
  properties: Property[]
  selectedProperty: Property | null
  onPropertySelect: (property: Property | null) => void
  filters: {
    showAvailable: boolean
    showOccupied: boolean
    showPostFire: boolean
    showStudentHousing: boolean
    showSection8: boolean
  }
}

export function LeafletMap({ properties, selectedProperty, onPropertySelect, filters }: LeafletMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersLayerRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [leaflet, setLeaflet] = useState<any>(null)

  // Filter properties based on current filters
  const filteredProperties = properties.filter((p) => {
    if (p.is_available && !filters.showAvailable) return false
    if (!p.is_available && !filters.showOccupied) return false
    if (p.is_post_fire_rebuild && !filters.showPostFire) return false
    if (p.is_student_housing && !filters.showStudentHousing) return false
    if (p.is_section_8 && !filters.showSection8) return false
    return true
  })

  const getPropertyColor = useCallback((property: Property): string => {
    if (property.is_post_fire_rebuild) return "#f97316" // Orange
    if (property.is_section_8) return "#8b5cf6" // Purple
    if (property.is_student_housing) return "#3b82f6" // Blue
    if (property.is_available) return "#22c55e" // Green
    return "#6b7280" // Gray for occupied
  }, [])

  const getPropertyDisplayName = useCallback((property: Property): string => {
    if (property.property_name) return property.property_name
    const match = property.address.match(/$$([^)]+)$$/)
    if (match) return match[1]
    return property.address.split("(")[0].trim()
  }, [])

  // Load Leaflet dynamically
  useEffect(() => {
    let cancelled = false

    async function loadLeaflet() {
      try {
        const L = await import("leaflet")
        await import("leaflet/dist/leaflet.css")

        if (cancelled) return

        setLeaflet(L.default || L)
        setIsLoading(false)
      } catch (err) {
        console.error("[v0] Failed to load Leaflet:", err)
        setIsLoading(false)
      }
    }

    loadLeaflet()

    return () => {
      cancelled = true
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current || !leaflet) return

    // Create map
    mapRef.current = leaflet.map(mapContainer.current, {
      center: BUTTE_COUNTY_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      scrollWheelZoom: true,
    })

    // Add OpenStreetMap tiles (free, no token required)
    leaflet
      .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      })
      .addTo(mapRef.current)

    // Create a layer group for markers
    markersLayerRef.current = leaflet.layerGroup().addTo(mapRef.current)

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [leaflet])

  // Add markers when properties or filters change
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current || !leaflet) return

    // Clear existing markers
    markersLayerRef.current.clearLayers()

    // Add markers for each filtered property
    filteredProperties.forEach((property) => {
      const color = getPropertyColor(property)
      const displayName = getPropertyDisplayName(property)
      const isSelected = selectedProperty?.id === property.id

      // Create custom icon using divIcon
      const icon = leaflet.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            width: ${isSelected ? "28px" : "22px"};
            height: ${isSelected ? "28px" : "22px"};
            background-color: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.35);
            cursor: pointer;
            transition: transform 0.15s ease;
          "></div>
        `,
        iconSize: [isSelected ? 28 : 22, isSelected ? 28 : 22],
        iconAnchor: [isSelected ? 14 : 11, isSelected ? 14 : 11],
      })

      const marker = leaflet
        .marker([Number(property.latitude), Number(property.longitude)], {
          icon,
        })
        .addTo(markersLayerRef.current)

      // Create popup content
      const popupContent = `
        <div style="padding: 4px; min-width: 160px;">
          <div style="font-weight: 600; font-size: 13px; margin-bottom: 4px; color: #1a1a1a;">${displayName}</div>
          <div style="font-size: 12px; color: #666;">${property.city}, CA ${property.zip_code || ""}</div>
          ${property.bedrooms !== null ? `<div style="font-size: 12px; color: #666;">${property.bedrooms} bed${property.bedrooms !== 1 ? "s" : ""} • ${property.property_type}</div>` : ""}
          ${
            property.current_rent
              ? `<div style="font-size: 13px; font-weight: 600; color: #22c55e; margin-top: 4px;">$${property.current_rent.toLocaleString()}/mo</div>`
              : `<div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Not currently listed</div>`
          }
        </div>
      `

      marker.bindPopup(popupContent, {
        closeButton: false,
        offset: [0, -10],
      })

      marker.on("mouseover", () => {
        marker.openPopup()
      })

      marker.on("mouseout", () => {
        marker.closePopup()
      })

      marker.on("click", () => {
        onPropertySelect(property)
      })
    })
  }, [leaflet, filteredProperties, selectedProperty, onPropertySelect, getPropertyColor, getPropertyDisplayName])

  // Pan to selected property
  useEffect(() => {
    if (!mapRef.current || !selectedProperty) return

    mapRef.current.flyTo([Number(selectedProperty.latitude), Number(selectedProperty.longitude)], 15, { duration: 1 })
  }, [selectedProperty])

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted/30">
        <div className="text-sm text-muted-foreground">Loading map...</div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-background/95 p-3 shadow-lg backdrop-blur-sm">
        <h4 className="mb-2 text-xs font-semibold text-foreground">Legend</h4>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#6b7280]" />
            <span className="text-muted-foreground">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#f97316]" />
            <span className="text-muted-foreground">Post-Fire Rebuild</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#8b5cf6]" />
            <span className="text-muted-foreground">Section 8</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#3b82f6]" />
            <span className="text-muted-foreground">Student Housing</span>
          </div>
        </div>
      </div>

      {/* Property count */}
      <div className="absolute right-4 top-4 z-[1000] rounded-lg bg-background/95 px-3 py-2 shadow-lg backdrop-blur-sm">
        <span className="text-sm font-medium text-foreground">{filteredProperties.length} properties</span>
      </div>
    </div>
  )
}
