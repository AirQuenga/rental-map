/**
 * Property Enrichment Pipeline
 *
 * This module handles automatic enrichment of property data from APNs:
 * - Address lookup
 * - City/County assignment
 * - Census tract identification
 * - Geocoding (lat/lng)
 *
 * All enrichment logic is:
 * - Configurable
 * - Replaceable
 * - Well-commented
 */

import { BUTTE_COUNTY_CITIES, CENSUS_TRACTS } from "@/config/enums"

// ===========================================
// ENRICHMENT RESULT INTERFACE
// ===========================================
export interface EnrichmentResult {
  apn: string
  status: "complete" | "partial" | "missing_data"
  data: {
    address: string | null
    city: string | null
    county: string
    state: string
    zipCode: string | null
    censusTract: string | null
    latitude: number | null
    longitude: number | null
  }
  missingFields: string[]
  source: string
  enrichedAt: string
}

// ===========================================
// MOCK DATA FOR DEVELOPMENT
// Replace with real API integrations in production
// ===========================================

/**
 * Mock address database for development
 * In production, replace with Butte County Assessor API or similar
 */
const MOCK_ADDRESS_DB: Record<string, { address: string; city: string; zipCode: string }> = {
  "001-010-001": { address: "1122 W Sacramento Ave", city: "Chico", zipCode: "95926" },
  "001-010-002": { address: "1200 W Sacramento Ave", city: "Chico", zipCode: "95926" },
  "001-010-003": { address: "567 E 1st Ave", city: "Chico", zipCode: "95926" },
  "002-010-001": { address: "5975 Maxwell Dr", city: "Paradise", zipCode: "95969" },
  "002-010-002": { address: "5975 Maxwell Dr Unit 12", city: "Paradise", zipCode: "95969" },
  "003-010-001": { address: "1965 Montgomery St", city: "Oroville", zipCode: "95965" },
  // Add more mock data as needed
}

/**
 * Mock geocoding data
 * In production, replace with Google Maps, Mapbox, or Census Geocoder API
 */
const MOCK_GEOCODING_DB: Record<string, { lat: number; lng: number }> = {
  Chico: { lat: 39.7285, lng: -121.8375 },
  Paradise: { lat: 39.7596, lng: -121.6219 },
  Oroville: { lat: 39.5138, lng: -121.5564 },
  Magalia: { lat: 39.8121, lng: -121.5782 },
  Gridley: { lat: 39.3638, lng: -121.6936 },
  Biggs: { lat: 39.4127, lng: -121.7131 },
  Durham: { lat: 39.6463, lng: -121.7997 },
}

// ===========================================
// ENRICHMENT FUNCTIONS
// ===========================================

/**
 * Look up address from APN
 *
 * TODO: Replace with real Butte County Assessor API
 * Example API: https://gisportal.buttecounty.net/arcgis/rest/services
 */
export async function lookupAddress(apn: string): Promise<{
  address: string | null
  city: string | null
  zipCode: string | null
}> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  const mockData = MOCK_ADDRESS_DB[apn]
  if (mockData) {
    return mockData
  }

  // Return null for unknown APNs
  return { address: null, city: null, zipCode: null }
}

/**
 * Get census tract for a location
 *
 * TODO: Replace with Census Bureau Geocoder API
 * https://geocoding.geo.census.gov/geocoder/
 */
export async function getCensusTract(city: string): Promise<string | null> {
  await new Promise((resolve) => setTimeout(resolve, 50))

  const tract = CENSUS_TRACTS.find((t) => t.city === city)
  return tract?.tract ?? null
}

/**
 * Geocode an address to lat/lng
 *
 * TODO: Replace with Mapbox or Google Maps Geocoding API
 */
export async function geocodeAddress(
  address: string,
  city: string,
  state = "CA",
): Promise<{ latitude: number | null; longitude: number | null }> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Use city centroid as fallback
  const cityCoords = MOCK_GEOCODING_DB[city]
  if (cityCoords) {
    // Add small random offset to spread pins
    const offset = () => (Math.random() - 0.5) * 0.02
    return {
      latitude: cityCoords.lat + offset(),
      longitude: cityCoords.lng + offset(),
    }
  }

  return { latitude: null, longitude: null }
}

/**
 * Validate city is in Butte County
 */
export function isValidButteCountyCity(city: string): boolean {
  return BUTTE_COUNTY_CITIES.includes(city as (typeof BUTTE_COUNTY_CITIES)[number])
}

// ===========================================
// MAIN ENRICHMENT PIPELINE
// ===========================================

/**
 * Enrich a property from its APN
 *
 * Pipeline:
 * 1. Normalize APN
 * 2. Look up address from county records
 * 3. Validate city
 * 4. Get census tract
 * 5. Geocode to lat/lng
 * 6. Return enriched data with status
 */
export async function enrichProperty(apn: string): Promise<EnrichmentResult> {
  const missingFields: string[] = []

  // Step 1: Normalize APN
  const normalizedAPN = apn.replace(/[^0-9]/g, "")
  const formattedAPN =
    normalizedAPN.length === 9
      ? `${normalizedAPN.slice(0, 3)}-${normalizedAPN.slice(3, 6)}-${normalizedAPN.slice(6, 9)}`
      : apn

  // Step 2: Look up address
  const { address, city, zipCode } = await lookupAddress(formattedAPN)

  if (!address) missingFields.push("address")
  if (!city) missingFields.push("city")
  if (!zipCode) missingFields.push("zipCode")

  // Step 3: Validate city
  if (city && !isValidButteCountyCity(city)) {
    console.warn(`City "${city}" not in Butte County`)
  }

  // Step 4: Get census tract
  const censusTract = city ? await getCensusTract(city) : null
  if (!censusTract) missingFields.push("censusTract")

  // Step 5: Geocode
  const { latitude, longitude } =
    address && city ? await geocodeAddress(address, city) : { latitude: null, longitude: null }

  if (!latitude || !longitude) missingFields.push("coordinates")

  // Determine status
  let status: EnrichmentResult["status"] = "complete"
  if (missingFields.length > 0 && missingFields.length < 4) {
    status = "partial"
  } else if (missingFields.length >= 4) {
    status = "missing_data"
  }

  return {
    apn: formattedAPN,
    status,
    data: {
      address,
      city,
      county: "Butte",
      state: "CA",
      zipCode,
      censusTract,
      latitude,
      longitude,
    },
    missingFields,
    source: "mock_data", // Change to 'assessor_api' in production
    enrichedAt: new Date().toISOString(),
  }
}

/**
 * Batch enrich multiple properties
 * Processes in parallel with rate limiting
 */
export async function enrichProperties(
  apns: string[],
  options: { concurrency?: number; onProgress?: (completed: number, total: number) => void } = {},
): Promise<EnrichmentResult[]> {
  const { concurrency = 5, onProgress } = options
  const results: EnrichmentResult[] = []

  // Process in batches
  for (let i = 0; i < apns.length; i += concurrency) {
    const batch = apns.slice(i, i + concurrency)
    const batchResults = await Promise.all(batch.map(enrichProperty))
    results.push(...batchResults)

    onProgress?.(Math.min(i + concurrency, apns.length), apns.length)
  }

  return results
}
