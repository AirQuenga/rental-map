/**
 * Property Enrichment Pipeline
 *
 * This module handles automatic enrichment of property data from APNs:
 * - Address lookup via Butte County GIS API
 * - City/County assignment
 * - Census tract identification
 * - Geocoding (lat/lng) from parcel centroids
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
// BUTTE COUNTY GIS API INTEGRATION
// ===========================================

/**
 * Query Butte County GIS API for parcel data by APN
 * API: https://gisportal.buttecounty.net/arcgis/rest/services
 */
async function queryButteCountyGIS(apn: string): Promise<{
  address: string | null
  city: string | null
  zipCode: string | null
  latitude: number | null
  longitude: number | null
} | null> {
  try {
    // Format APN for query (remove dashes)
    const apnQuery = apn.replace(/-/g, "")

    // Query the Butte County Parcel layer
    const url = new URL(
      "https://gisportal.buttecounty.net/arcgis/rest/services/Parcels/ButteCountyParcels/MapServer/0/query",
    )
    url.searchParams.set("where", `APN = '${apnQuery}' OR APN = '${apn}'`)
    url.searchParams.set("outFields", "APN,SITUS_ADDR,SITUS_CITY,SITUS_ZIP")
    url.searchParams.set("returnGeometry", "true")
    url.searchParams.set("outSR", "4326") // WGS84 for lat/lng
    url.searchParams.set("f", "json")

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      console.error(`GIS API error: ${response.status}`)
      return null
    }

    const data = await response.json()

    if (data.features && data.features.length > 0) {
      const feature = data.features[0]
      const attrs = feature.attributes
      const geometry = feature.geometry

      // Get centroid from geometry
      let latitude: number | null = null
      let longitude: number | null = null

      if (geometry) {
        if (geometry.x && geometry.y) {
          // Point geometry
          longitude = geometry.x
          latitude = geometry.y
        } else if (geometry.rings) {
          // Polygon - calculate centroid
          const ring = geometry.rings[0]
          if (ring && ring.length > 0) {
            let sumX = 0,
              sumY = 0
            for (const [x, y] of ring) {
              sumX += x
              sumY += y
            }
            longitude = sumX / ring.length
            latitude = sumY / ring.length
          }
        }
      }

      return {
        address: attrs.SITUS_ADDR || null,
        city: attrs.SITUS_CITY || null,
        zipCode: attrs.SITUS_ZIP || null,
        latitude,
        longitude,
      }
    }

    return null
  } catch (error) {
    console.error(`Error querying Butte County GIS for APN ${apn}:`, error)
    return null
  }
}

/**
 * Get census tract for a location
 * Uses Census Bureau Geocoder API
 */
export async function getCensusTract(city: string): Promise<string | null> {
  const tract = CENSUS_TRACTS.find((t) => t.city === city)
  return tract?.tract ?? null
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
 * Enrich a property from its APN using Butte County GIS API
 */
export async function enrichProperty(apn: string): Promise<EnrichmentResult> {
  const missingFields: string[] = []

  // Step 1: Normalize APN
  const normalizedAPN = apn.replace(/[^0-9]/g, "")
  const formattedAPN =
    normalizedAPN.length === 9
      ? `${normalizedAPN.slice(0, 3)}-${normalizedAPN.slice(3, 6)}-${normalizedAPN.slice(6, 9)}`
      : apn

  // Step 2: Query Butte County GIS API for real data
  const gisData = await queryButteCountyGIS(formattedAPN)

  let address: string | null = null
  let city: string | null = null
  let zipCode: string | null = null
  let latitude: number | null = null
  let longitude: number | null = null

  if (gisData) {
    address = gisData.address
    city = gisData.city
    zipCode = gisData.zipCode
    latitude = gisData.latitude
    longitude = gisData.longitude
  }

  if (!address) missingFields.push("address")
  if (!city) missingFields.push("city")
  if (!zipCode) missingFields.push("zipCode")
  if (!latitude || !longitude) missingFields.push("coordinates")

  // Step 3: Validate city
  if (city && !isValidButteCountyCity(city)) {
    console.warn(`City "${city}" not in Butte County list`)
  }

  // Step 4: Get census tract
  const censusTract = city ? await getCensusTract(city) : null
  if (!censusTract) missingFields.push("censusTract")

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
    source: gisData ? "butte_county_gis" : "not_found",
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
  const { concurrency = 3, onProgress } = options // Lower concurrency for API rate limiting
  const results: EnrichmentResult[] = []

  // Process in batches
  for (let i = 0; i < apns.length; i += concurrency) {
    const batch = apns.slice(i, i + concurrency)
    const batchResults = await Promise.all(batch.map(enrichProperty))
    results.push(...batchResults)

    onProgress?.(Math.min(i + concurrency, apns.length), apns.length)

    // Small delay between batches to avoid rate limiting
    if (i + concurrency < apns.length) {
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }

  return results
}
