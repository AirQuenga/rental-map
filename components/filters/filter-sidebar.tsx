"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import type { PropertyFilters } from "@/types/property"
import { Search, X, SlidersHorizontal } from "lucide-react"

interface FilterSidebarProps {
  filters: PropertyFilters
  onFiltersChange: (filters: PropertyFilters) => void
  cities: string[]
  managementCompanies: string[]
}

export function FilterSidebar({ filters, onFiltersChange, cities, managementCompanies }: FilterSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const updateFilter = <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({})
    setSearchQuery("")
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== "")

  return (
    <div className="flex h-full w-80 flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-card-foreground">Filters</h2>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
              <X className="mr-1 h-3 w-3" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search address or APN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Availability Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="available-only" className="text-sm font-medium">
            Available Only
          </Label>
          <Switch
            id="available-only"
            checked={filters.isAvailable ?? false}
            onCheckedChange={(checked) => updateFilter("isAvailable", checked || undefined)}
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">City</Label>
          <Select
            value={filters.city ?? "all"}
            onValueChange={(value) => updateFilter("city", value === "all" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Property Type</Label>
          <Select
            value={filters.propertyType ?? "all"}
            onValueChange={(value) => updateFilter("propertyType", value === "all" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="single-family">Single Family</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="duplex">Duplex</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="multi-family">Multi-Family</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bedrooms */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Minimum Bedrooms: {filters.minBedrooms ?? "Any"}</Label>
          <Slider
            value={[filters.minBedrooms ?? 0]}
            onValueChange={([value]) => updateFilter("minBedrooms", value === 0 ? undefined : value)}
            max={5}
            step={1}
            className="py-2"
          />
        </div>

        {/* Max Rent */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Max Rent: {filters.maxRent ? `$${filters.maxRent.toLocaleString()}` : "Any"}
          </Label>
          <Slider
            value={[filters.maxRent ?? 5000]}
            onValueChange={([value]) => updateFilter("maxRent", value === 5000 ? undefined : value)}
            min={500}
            max={5000}
            step={100}
            className="py-2"
          />
        </div>

        {/* Management Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Management Type</Label>
          <Select
            value={filters.managementType ?? "all"}
            onValueChange={(value) => updateFilter("managementType", value === "all" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="private">Private Landlord</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Management Company */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Management Company</Label>
          <Select
            value={filters.managementCompany ?? "all"}
            onValueChange={(value) => updateFilter("managementCompany", value === "all" ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All companies</SelectItem>
              {managementCompanies.map((company) => (
                <SelectItem key={company} value={company}>
                  {company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Special Filters */}
        <div className="space-y-3 rounded-lg bg-muted/50 p-3">
          <h3 className="text-sm font-semibold text-card-foreground">Butte County Specializations</h3>

          <div className="flex items-center justify-between">
            <Label htmlFor="post-fire" className="text-sm">
              Post-2018 Rebuilds
            </Label>
            <Switch
              id="post-fire"
              checked={filters.isPostFireRebuild ?? false}
              onCheckedChange={(checked) => updateFilter("isPostFireRebuild", checked || undefined)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="student" className="text-sm">
              Student Housing
            </Label>
            <Switch
              id="student"
              checked={filters.isStudentHousing ?? false}
              onCheckedChange={(checked) => updateFilter("isStudentHousing", checked || undefined)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
