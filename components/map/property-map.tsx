"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { Property } from "@/types/property"

interface PropertyMapProps {
  properties: Property[]
  selectedProperty: Property | null
  onPropertySelect: (property: Property | null) => void
  center?: { lat: number; lng: number }
  zoom?: number
}

export function PropertyMap({
  properties,
  selectedProperty,
  onPropertySelect,
  center = { lat: 39.7285, lng: -121.8375 },
  zoom = 11,
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  const getMarkerColor = useCallback((property: Property) => {
    if (property.is_available) return "#22c55e" // Green for available
    if (property.is_post_fire_rebuild) return "#f97316" // Orange for rebuilds
    return "#6b7280" // Grey for occupied
  }, [])

  useEffect(() => {
    // Simple canvas-based map visualization
    if (!mapRef.current) return

    const canvas = document.createElement("canvas")
    canvas.width = mapRef.current.clientWidth
    canvas.height = mapRef.current.clientHeight
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    mapRef.current.innerHTML = ""
    mapRef.current.appendChild(canvas)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw background
    ctx.fillStyle = "#1a1a2e"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid lines
    ctx.strokeStyle = "#2a2a4e"
    ctx.lineWidth = 1
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    // Calculate bounds
    const latMin = Math.min(...properties.map((p) => p.latitude))
    const latMax = Math.max(...properties.map((p) => p.latitude))
    const lngMin = Math.min(...properties.map((p) => p.longitude))
    const lngMax = Math.max(...properties.map((p) => p.longitude))

    const padding = 40
    const mapWidth = canvas.width - padding * 2
    const mapHeight = canvas.height - padding * 2

    // Draw city labels
    const cities = [...new Set(properties.map((p) => p.city))]
    ctx.font = "12px sans-serif"
    ctx.fillStyle = "#64748b"

    cities.forEach((city) => {
      const cityProps = properties.filter((p) => p.city === city)
      const avgLat = cityProps.reduce((sum, p) => sum + p.latitude, 0) / cityProps.length
      const avgLng = cityProps.reduce((sum, p) => sum + p.longitude, 0) / cityProps.length

      const x = padding + ((avgLng - lngMin) / (lngMax - lngMin)) * mapWidth
      const y = padding + ((latMax - avgLat) / (latMax - latMin)) * mapHeight

      ctx.fillText(city, x - 20, y - 15)
    })

    // Draw property markers
    properties.forEach((property) => {
      const x = padding + ((property.longitude - lngMin) / (lngMax - lngMin)) * mapWidth
      const y = padding + ((latMax - property.latitude) / (latMax - latMin)) * mapHeight

      const isSelected = selectedProperty?.id === property.id
      const radius = isSelected ? 10 : property.is_available ? 7 : 5

      // Draw glow for available properties
      if (property.is_available) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius + 8)
        gradient.addColorStop(0, getMarkerColor(property) + "40")
        gradient.addColorStop(1, "transparent")
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, radius + 8, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw marker
      ctx.fillStyle = getMarkerColor(property)
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()

      // Draw selection ring
      if (isSelected) {
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(x, y, radius + 3, 0, Math.PI * 2)
        ctx.stroke()
      }
    })

    // Handle click events
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top

      // Find clicked property
      for (const property of properties) {
        const x = padding + ((property.longitude - lngMin) / (lngMax - lngMin)) * mapWidth
        const y = padding + ((latMax - property.latitude) / (latMax - latMin)) * mapHeight
        const radius = property.is_available ? 7 : 5

        const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2)
        if (distance <= radius + 5) {
          onPropertySelect(property)
          return
        }
      }
      onPropertySelect(null)
    }

    canvas.addEventListener("click", handleClick)
    setMapLoaded(true)

    return () => {
      canvas.removeEventListener("click", handleClick)
    }
  }, [properties, selectedProperty, getMarkerColor, onPropertySelect])

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full rounded-lg" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 rounded-lg bg-card/90 p-3 backdrop-blur-sm">
        <h4 className="mb-2 text-xs font-semibold text-card-foreground">Legend</h4>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
            <span className="text-xs text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#6b7280]" />
            <span className="text-xs text-muted-foreground">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#f97316]" />
            <span className="text-xs text-muted-foreground">Post-Fire Rebuild</span>
          </div>
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute right-4 top-4 rounded-lg bg-card/90 p-3 backdrop-blur-sm">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-card-foreground">{properties.length.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Properties</div>
          </div>
          <div>
            <div className="text-xl font-bold text-[#22c55e]">{properties.filter((p) => p.is_available).length}</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
        </div>
      </div>

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-muted-foreground">Loading map...</div>
        </div>
      )}
    </div>
  )
}
