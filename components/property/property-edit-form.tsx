"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, X } from "lucide-react"
import type { Property } from "@/types/property"
import { updateProperty, type PropertyUpdate } from "@/app/actions/update-property"

interface PropertyEditFormProps {
  property: Property
  onSave: (updatedProperty: Property) => void
  onCancel: () => void
}

export function PropertyEditForm({ property, onSave, onCancel }: PropertyEditFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    property_name: property.property_name || "",
    address: property.address || "",
    city: property.city || "",
    zip_code: property.zip_code || "",
    bedrooms: property.bedrooms?.toString() || "",
    bathrooms: property.bathrooms?.toString() || "",
    square_feet: property.square_feet?.toString() || "",
    year_built: property.year_built?.toString() || "",
    current_rent: property.current_rent?.toString() || "",
    management_company: property.management_company || "",
    phone_number: property.phone_number || "",
    office_hours: property.office_hours || "",
    website: property.website || "",
    pets_allowed: property.pets_allowed ?? true,
    pet_deposit: property.pet_deposit?.toString() || "",
    pet_rent: property.pet_rent?.toString() || "",
    pet_restrictions: property.pet_restrictions || "",
    is_available: property.is_available ?? false,
    is_section_8: property.is_section_8 ?? false,
    is_ada_accessible: property.is_ada_accessible ?? false,
    notes: property.notes || "",
    census_tract: property.census_tract || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    const update: PropertyUpdate = {
      id: property.id,
      property_name: formData.property_name || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      zip_code: formData.zip_code || undefined,
      bedrooms: formData.bedrooms ? Number.parseInt(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms ? Number.parseFloat(formData.bathrooms) : undefined,
      square_feet: formData.square_feet ? Number.parseInt(formData.square_feet) : undefined,
      year_built: formData.year_built ? Number.parseInt(formData.year_built) : undefined,
      current_rent: formData.current_rent ? Number.parseFloat(formData.current_rent) : undefined,
      management_company: formData.management_company || undefined,
      phone_number: formData.phone_number || undefined,
      office_hours: formData.office_hours || undefined,
      website: formData.website || undefined,
      pets_allowed: formData.pets_allowed,
      pet_deposit: formData.pet_deposit ? Number.parseFloat(formData.pet_deposit) : undefined,
      pet_rent: formData.pet_rent ? Number.parseFloat(formData.pet_rent) : undefined,
      pet_restrictions: formData.pet_restrictions || undefined,
      is_available: formData.is_available,
      is_section_8: formData.is_section_8,
      is_ada_accessible: formData.is_ada_accessible,
      notes: formData.notes || undefined,
      census_tract: formData.census_tract || undefined,
    }

    const result = await updateProperty(update)

    if (result.success) {
      onSave({
        ...property,
        ...update,
        updated_at: new Date().toISOString(),
      } as Property)
    } else {
      setError(result.error || "Failed to save changes")
    }

    setIsSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">{error}</div>}

      {/* Basic Info */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Basic Information</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label htmlFor="property_name">Property Name</Label>
            <Input
              id="property_name"
              value={formData.property_name}
              onChange={(e) => setFormData({ ...formData, property_name: e.target.value })}
              placeholder="e.g., Villa East Apartments"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Select value={formData.city} onValueChange={(v) => setFormData({ ...formData, city: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Chico">Chico</SelectItem>
                <SelectItem value="Paradise">Paradise</SelectItem>
                <SelectItem value="Oroville">Oroville</SelectItem>
                <SelectItem value="Gridley">Gridley</SelectItem>
                <SelectItem value="Biggs">Biggs</SelectItem>
                <SelectItem value="Durham">Durham</SelectItem>
                <SelectItem value="Magalia">Magalia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="zip_code">ZIP Code</Label>
            <Input
              id="zip_code"
              value={formData.zip_code}
              onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Unit Details */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Unit Details</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input
              id="bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input
              id="bathrooms"
              type="number"
              step="0.5"
              value={formData.bathrooms}
              onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="square_feet">Square Feet</Label>
            <Input
              id="square_feet"
              type="number"
              value={formData.square_feet}
              onChange={(e) => setFormData({ ...formData, square_feet: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="year_built">Year Built</Label>
            <Input
              id="year_built"
              type="number"
              value={formData.year_built}
              onChange={(e) => setFormData({ ...formData, year_built: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="current_rent">Monthly Rent ($)</Label>
            <Input
              id="current_rent"
              type="number"
              value={formData.current_rent}
              onChange={(e) => setFormData({ ...formData, current_rent: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="census_tract">Census Tract</Label>
            <Input
              id="census_tract"
              value={formData.census_tract}
              onChange={(e) => setFormData({ ...formData, census_tract: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Contact Information</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label htmlFor="management_company">Management Company</Label>
            <Input
              id="management_company"
              value={formData.management_company}
              onChange={(e) => setFormData({ ...formData, management_company: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="office_hours">Office Hours</Label>
            <Input
              id="office_hours"
              value={formData.office_hours}
              onChange={(e) => setFormData({ ...formData, office_hours: e.target.value })}
              placeholder="Mon-Fri 9-5"
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Pet Policy */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Pet Policy</h4>
        <div className="flex items-center gap-4">
          <Switch
            checked={formData.pets_allowed}
            onCheckedChange={(v) => setFormData({ ...formData, pets_allowed: v })}
          />
          <Label>Pets Allowed</Label>
        </div>
        {formData.pets_allowed && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pet_deposit">Pet Deposit ($)</Label>
              <Input
                id="pet_deposit"
                type="number"
                value={formData.pet_deposit}
                onChange={(e) => setFormData({ ...formData, pet_deposit: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="pet_rent">Pet Rent ($/mo)</Label>
              <Input
                id="pet_rent"
                type="number"
                value={formData.pet_rent}
                onChange={(e) => setFormData({ ...formData, pet_rent: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="pet_restrictions">Pet Restrictions</Label>
              <Input
                id="pet_restrictions"
                value={formData.pet_restrictions}
                onChange={(e) => setFormData({ ...formData, pet_restrictions: e.target.value })}
                placeholder="e.g., No aggressive breeds, 2 pet max"
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Toggles */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Property Status</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Available for Rent</Label>
            <Switch
              checked={formData.is_available}
              onCheckedChange={(v) => setFormData({ ...formData, is_available: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Section 8 Accepted</Label>
            <Switch
              checked={formData.is_section_8}
              onCheckedChange={(v) => setFormData({ ...formData, is_section_8: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>ADA Accessible</Label>
            <Switch
              checked={formData.is_ada_accessible}
              onCheckedChange={(v) => setFormData({ ...formData, is_ada_accessible: v })}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes about the property..."
          rows={3}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving} className="flex-1">
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>
    </form>
  )
}
