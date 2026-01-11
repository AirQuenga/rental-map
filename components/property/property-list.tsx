"use client"

import { PropertyCard } from "./property-card"
import type { Property } from "@/types/property"
import { Building2 } from "lucide-react"

interface PropertyListProps {
  properties: Property[]
  selectedProperty: Property | null
  onPropertySelect: (property: Property) => void
  onWatch: (property: Property) => void
}

export function PropertyList({ properties, selectedProperty, onPropertySelect, onWatch }: PropertyListProps) {
  // Sort properties: available first, then by city
  const sortedProperties = [...properties].sort((a, b) => {
    if (a.is_available !== b.is_available) {
      return a.is_available ? -1 : 1
    }
    return a.city.localeCompare(b.city)
  })

  if (properties.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <Building2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="mb-2 font-semibold text-card-foreground">No properties found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your filters to see more results.</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {properties.length} {properties.length === 1 ? "property" : "properties"}
        </span>
        <span className="text-sm font-medium text-green-500">
          {properties.filter((p) => p.is_available).length} available
        </span>
      </div>
      <div className="space-y-3">
        {sortedProperties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            isSelected={selectedProperty?.id === property.id}
            onSelect={() => onPropertySelect(property)}
            onWatch={() => onWatch(property)}
          />
        ))}
      </div>
    </div>
  )
}
