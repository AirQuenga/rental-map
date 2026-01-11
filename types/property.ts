export interface Property {
  id: string
  apn: string
  address: string
  city: string
  zip_code: string | null
  latitude: number
  longitude: number
  property_type: "single-family" | "apartment" | "duplex" | "condo" | "multi-family"
  bedrooms: number | null
  bathrooms: number | null
  square_feet: number | null
  year_built: number | null
  lot_size: number | null
  is_available: boolean
  current_rent: number | null
  last_listed_date: string | null
  last_available_rent: number | null
  owner_name: string | null
  owner_mailing_address: string | null
  management_type: "professional" | "private" | "unknown"
  management_company: string | null
  is_post_fire_rebuild: boolean
  is_student_housing: boolean
  utility_type: "city" | "septic" | "well"
  fire_zone: string | null
  created_at: string
  updated_at: string
}

export interface PropertyFilters {
  city?: string
  propertyType?: string
  minBedrooms?: number
  maxRent?: number
  managementType?: string
  managementCompany?: string
  isAvailable?: boolean
  isPostFireRebuild?: boolean
  isStudentHousing?: boolean
}
