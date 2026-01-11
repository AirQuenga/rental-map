"use client"

import { useState, useMemo } from "react"
import { PropertyMap } from "@/components/map/property-map"
import { FilterSidebar } from "@/components/filters/filter-sidebar"
import { PropertyList } from "@/components/property/property-list"
import { PropertyDetailPanel } from "@/components/property/property-detail-panel"
import type { Property, PropertyFilters } from "@/types/property"
import { Button } from "@/components/ui/button"
import { Map, List, Menu } from "lucide-react"

interface RentalAtlasProps {
  initialProperties: Property[]
}

export function RentalAtlas({ initialProperties }: RentalAtlasProps) {
  const [properties] = useState<Property[]>(initialProperties)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [filters, setFilters] = useState<PropertyFilters>({})
  const [viewMode, setViewMode] = useState<"map" | "list">("map")
  const [showFilters, setShowFilters] = useState(true)

  // Get unique cities and management companies for filters
  const cities = useMemo(() => [...new Set(properties.map((p) => p.city))].sort(), [properties])

  const managementCompanies = useMemo(
    () => [...new Set(properties.filter((p) => p.management_company).map((p) => p.management_company!))].sort(),
    [properties],
  )

  // Apply filters
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (filters.city && property.city !== filters.city) return false
      if (filters.propertyType && property.property_type !== filters.propertyType) return false
      if (filters.minBedrooms && (property.bedrooms ?? 0) < filters.minBedrooms) return false
      if (filters.maxRent && property.is_available && (property.current_rent ?? 0) > filters.maxRent) return false
      if (filters.managementType && property.management_type !== filters.managementType) return false
      if (filters.managementCompany && property.management_company !== filters.managementCompany) return false
      if (filters.isAvailable && !property.is_available) return false
      if (filters.isPostFireRebuild && !property.is_post_fire_rebuild) return false
      if (filters.isStudentHousing && !property.is_student_housing) return false
      return true
    })
  }, [properties, filters])

  const handleWatch = (property: Property) => {
    setSelectedProperty(property)
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Map className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-card-foreground">Butte County Rental Atlas</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-border bg-muted p-1">
            <Button
              variant={viewMode === "map" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("map")}
              className="h-7"
            >
              <Map className="mr-1 h-4 w-4" />
              Map
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-7"
            >
              <List className="mr-1 h-4 w-4" />
              List
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Filter Sidebar */}
        {showFilters && (
          <FilterSidebar
            filters={filters}
            onFiltersChange={setFilters}
            cities={cities}
            managementCompanies={managementCompanies}
          />
        )}

        {/* Map or List View */}
        <div className="flex flex-1 overflow-hidden">
          {viewMode === "map" ? (
            <div className="flex-1">
              <PropertyMap
                properties={filteredProperties}
                selectedProperty={selectedProperty}
                onPropertySelect={setSelectedProperty}
              />
            </div>
          ) : (
            <div className="flex-1">
              <PropertyList
                properties={filteredProperties}
                selectedProperty={selectedProperty}
                onPropertySelect={setSelectedProperty}
                onWatch={handleWatch}
              />
            </div>
          )}

          {/* Property Detail Panel */}
          {selectedProperty && (
            <PropertyDetailPanel property={selectedProperty} onClose={() => setSelectedProperty(null)} />
          )}
        </div>
      </div>
    </div>
  )
}
