"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Property } from "@/types/property"
import { Home, Building2, Bed, Bath, Square, Calendar, Eye, Bell, MapPin, Flame, GraduationCap } from "lucide-react"

interface PropertyCardProps {
  property: Property
  isSelected: boolean
  onSelect: () => void
  onWatch: () => void
}

const propertyTypeIcons: Record<string, typeof Home> = {
  "single-family": Home,
  apartment: Building2,
  duplex: Building2,
  condo: Building2,
  "multi-family": Building2,
}

export function PropertyCard({ property, isSelected, onSelect, onWatch }: PropertyCardProps) {
  const Icon = propertyTypeIcons[property.property_type] || Home

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary" : ""}`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`rounded-full p-1.5 ${
                property.is_available ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-tight text-card-foreground">{property.address}</h3>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {property.city}, CA {property.zip_code}
              </p>
            </div>
          </div>
          {property.is_available && property.current_rent && (
            <div className="text-right">
              <span className="text-lg font-bold text-green-500">${property.current_rent.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">/mo</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Property details */}
        <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {property.bedrooms && (
            <span className="flex items-center gap-1">
              <Bed className="h-3 w-3" />
              {property.bedrooms} bed
            </span>
          )}
          {property.bathrooms && (
            <span className="flex items-center gap-1">
              <Bath className="h-3 w-3" />
              {property.bathrooms} bath
            </span>
          )}
          {property.square_feet && (
            <span className="flex items-center gap-1">
              <Square className="h-3 w-3" />
              {property.square_feet.toLocaleString()} sqft
            </span>
          )}
          {property.year_built && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {property.year_built}
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          <Badge
            variant={property.is_available ? "default" : "secondary"}
            className={property.is_available ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : ""}
          >
            {property.is_available ? "Available" : "Occupied"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {property.property_type.replace("-", " ")}
          </Badge>
          {property.management_type === "professional" && (
            <Badge variant="outline" className="text-xs">
              {property.management_company || "Professional"}
            </Badge>
          )}
          {property.management_type === "private" && (
            <Badge variant="outline" className="text-xs">
              Private Landlord
            </Badge>
          )}
          {property.is_post_fire_rebuild && (
            <Badge variant="outline" className="border-orange-500/50 bg-orange-500/10 text-orange-600">
              <Flame className="mr-1 h-3 w-3" />
              Post-Fire Rebuild
            </Badge>
          )}
          {property.is_student_housing && (
            <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-600">
              <GraduationCap className="mr-1 h-3 w-3" />
              Student Housing
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={onSelect}>
            <Eye className="mr-1 h-3 w-3" />
            View Details
          </Button>
          {!property.is_available && (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onWatch()
              }}
            >
              <Bell className="mr-1 h-3 w-3" />
              Watch
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
