/**
 * Centralized Enums Configuration
 * All dropdown options and categorical values are defined here.
 * NO hard-coded values elsewhere in the codebase.
 */

// ===========================================
// PROPERTY TYPES
// ===========================================
export const PROPERTY_TYPES = [
  { value: "single-family", label: "Single Family" },
  { value: "manufactured", label: "Manufactured / Mobile Home" },
  { value: "duplex", label: "Duplex / Row / Townhouse" },
  { value: "apartment", label: "Flat / Garden / High-Rise Apartment" },
  { value: "condo", label: "Condominium" },
  { value: "multi-family", label: "Multi-Family (5+ units)" },
] as const

export type PropertyType = (typeof PROPERTY_TYPES)[number]["value"]

// ===========================================
// BEDROOM COUNTS
// ===========================================
export const BEDROOM_COUNTS = [
  { value: 0, label: "Studio / 0 BR" },
  { value: 1, label: "1 Bedroom" },
  { value: 2, label: "2 Bedrooms" },
  { value: 3, label: "3 Bedrooms" },
  { value: 4, label: "4 Bedrooms" },
  { value: 5, label: "5+ Bedrooms" },
] as const

// ===========================================
// HEATING TYPES (for FMR utility allowance)
// ===========================================
export const HEATING_TYPES = [
  { value: "natural-gas", label: "Natural Gas" },
  { value: "bottled-gas", label: "Bottled Gas (Propane)" },
  { value: "electric", label: "Electric" },
  { value: "electric-heat-pump", label: "Electric - Heat Pump" },
  { value: "fuel-oil", label: "Fuel Oil" },
  { value: "other", label: "Other" },
] as const

export type HeatingType = (typeof HEATING_TYPES)[number]["value"]

// ===========================================
// COOKING TYPES
// ===========================================
export const COOKING_TYPES = [
  { value: "natural-gas", label: "Natural Gas" },
  { value: "bottled-gas", label: "Bottled Gas (Propane)" },
  { value: "electric", label: "Electric" },
] as const

export type CookingType = (typeof COOKING_TYPES)[number]["value"]

// ===========================================
// AIR CONDITIONING TYPES
// ===========================================
export const AC_TYPES = [
  { value: "refrigerated", label: "Refrigerated Air (Central or Window)" },
  { value: "evaporative", label: "Evaporative Cooling (Swamp Cooler)" },
  { value: "none", label: "No Air Conditioning" },
] as const

export type ACType = (typeof AC_TYPES)[number]["value"]

// ===========================================
// WATER HEATER TYPES
// ===========================================
export const WATER_HEATER_TYPES = [
  { value: "natural-gas", label: "Natural Gas" },
  { value: "bottled-gas", label: "Bottled Gas (Propane)" },
  { value: "electric", label: "Electric" },
  { value: "electric-heat-pump", label: "Electric - Heat Pump" },
  { value: "fuel-oil", label: "Fuel Oil" },
] as const

export type WaterHeaterType = (typeof WATER_HEATER_TYPES)[number]["value"]

// ===========================================
// WATER/SEWER/TRASH OPTIONS
// ===========================================
export const UTILITY_INCLUSION = [
  { value: "included", label: "Included in Rent" },
  { value: "not-included", label: "Tenant Pays" },
] as const

export type UtilityInclusion = (typeof UTILITY_INCLUSION)[number]["value"]

// ===========================================
// APPLIANCE FUEL TYPES
// ===========================================
export const APPLIANCE_FUEL_TYPES = [
  { value: "natural-gas", label: "Natural Gas" },
  { value: "electric", label: "Electric" },
  { value: "propane", label: "Propane" },
  { value: "fuel-oil", label: "Fuel Oil" },
  { value: "heat-pump", label: "Heat Pump" },
  { value: "mini-split", label: "Mini Split" },
  { value: "other", label: "Other" },
] as const

export type ApplianceFuelType = (typeof APPLIANCE_FUEL_TYPES)[number]["value"]

// ===========================================
// MANAGEMENT TYPES
// ===========================================
export const MANAGEMENT_TYPES = [
  { value: "professional", label: "Professional Management Company" },
  { value: "private", label: "Private Landlord" },
  { value: "unknown", label: "Unknown" },
] as const

export type ManagementType = (typeof MANAGEMENT_TYPES)[number]["value"]

// ===========================================
// UNIT STATUS
// ===========================================
export const UNIT_STATUSES = [
  { value: "available", label: "Available", color: "#22c55e" },
  { value: "occupied", label: "Occupied", color: "#6b7280" },
  { value: "pending", label: "Application Pending", color: "#eab308" },
  { value: "maintenance", label: "Under Maintenance", color: "#f97316" },
  { value: "reserved", label: "Reserved", color: "#3b82f6" },
] as const

export type UnitStatus = (typeof UNIT_STATUSES)[number]["value"]

// ===========================================
// SPECIAL FEATURES
// ===========================================
export const SPECIAL_FEATURES = [
  { value: "seniors-55", label: "Seniors Only (55+)" },
  { value: "seniors-62", label: "Seniors Only (62+)" },
  { value: "ada-accessible", label: "ADA Accessible" },
  { value: "wheelchair-accessible", label: "Wheelchair Accessible" },
  { value: "income-restricted", label: "Income Restricted" },
  { value: "section-8", label: "Section 8 Accepted" },
  { value: "hud", label: "HUD Housing" },
  { value: "student-housing", label: "Student Housing" },
  { value: "post-fire-rebuild", label: "Post-Camp Fire Rebuild" },
] as const

export type SpecialFeature = (typeof SPECIAL_FEATURES)[number]["value"]

// ===========================================
// BUTTE COUNTY CITIES
// ===========================================
export const BUTTE_COUNTY_CITIES = [
  "Biggs",
  "Chico",
  "Durham",
  "Gridley",
  "Magalia",
  "Oroville",
  "Paradise",
  "Palermo",
  "Thermalito",
] as const

export type ButteCountyCity = (typeof BUTTE_COUNTY_CITIES)[number]

// ===========================================
// CENSUS TRACTS (Butte County)
// ===========================================
export const CENSUS_TRACTS = [
  { tract: "0001", city: "Chico" },
  { tract: "0002", city: "Chico" },
  { tract: "0003", city: "Chico" },
  { tract: "0004", city: "Chico" },
  { tract: "0005", city: "Chico" },
  { tract: "0006", city: "Chico" },
  { tract: "0007", city: "Chico" },
  { tract: "0008", city: "Paradise" },
  { tract: "0009", city: "Paradise" },
  { tract: "0010", city: "Magalia" },
  { tract: "0011", city: "Oroville" },
  { tract: "0012", city: "Oroville" },
  { tract: "0013", city: "Oroville" },
  { tract: "0014", city: "Gridley" },
  { tract: "0015", city: "Biggs" },
  { tract: "0016", city: "Durham" },
] as const
