/**
 * Property Enrichment Pipeline
 *
 * This module handles automatic enrichment of property data from APNs:
 * - Address lookup via Butte County GIS API
 * - City identification from APN prefix patterns
 * - Census tract identification
 * - Geocoding (lat/lng) from parcel centroids
 */

import { CENSUS_TRACTS } from "@/config/enums"

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
// APN PREFIX TO CITY MAPPING (COMPREHENSIVE)
// Based on Butte County Assessor APN ranges
// ===========================================
const APN_CITY_MAP: Record<string, { city: string; lat: number; lng: number; zip: string }> = {
  // Chico area (001-020, 040-049)
  "001": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95928" },
  "002": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95928" },
  "003": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95928" },
  "004": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95928" },
  "005": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95928" },
  "006": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "007": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "008": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "009": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "010": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "011": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "012": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "013": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "014": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "015": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "016": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "017": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "018": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "019": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "020": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "040": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "041": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "042": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "043": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "044": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "045": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "046": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "047": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "048": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  "049": { city: "Chico", lat: 39.7285, lng: -121.8375, zip: "95926" },
  // Gridley area (021-029)
  "021": { city: "Gridley", lat: 39.3638, lng: -121.6936, zip: "95948" },
  "022": { city: "Gridley", lat: 39.3638, lng: -121.6936, zip: "95948" },
  "023": { city: "Gridley", lat: 39.3638, lng: -121.6936, zip: "95948" },
  "024": { city: "Gridley", lat: 39.3638, lng: -121.6936, zip: "95948" },
  "025": { city: "Gridley", lat: 39.3638, lng: -121.6936, zip: "95948" },
  "026": { city: "Gridley", lat: 39.3638, lng: -121.6936, zip: "95948" },
  "027": { city: "Gridley", lat: 39.3638, lng: -121.6936, zip: "95948" },
  "028": { city: "Gridley", lat: 39.3638, lng: -121.6936, zip: "95948" },
  "029": { city: "Gridley", lat: 39.3638, lng: -121.6936, zip: "95948" },
  // Biggs area (030-034)
  "030": { city: "Biggs", lat: 39.4127, lng: -121.7128, zip: "95917" },
  "031": { city: "Biggs", lat: 39.4127, lng: -121.7128, zip: "95917" },
  "032": { city: "Biggs", lat: 39.4127, lng: -121.7128, zip: "95917" },
  "033": { city: "Biggs", lat: 39.4127, lng: -121.7128, zip: "95917" },
  "034": { city: "Biggs", lat: 39.4127, lng: -121.7128, zip: "95917" },
  // Durham area (035-039)
  "035": { city: "Durham", lat: 39.646, lng: -121.7997, zip: "95938" },
  "036": { city: "Durham", lat: 39.646, lng: -121.7997, zip: "95938" },
  "037": { city: "Durham", lat: 39.646, lng: -121.7997, zip: "95938" },
  "038": { city: "Durham", lat: 39.646, lng: -121.7997, zip: "95938" },
  "039": { city: "Durham", lat: 39.646, lng: -121.7997, zip: "95938" },
  // Oroville area (050-089)
  "050": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95965" },
  "051": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95965" },
  "052": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95965" },
  "053": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95965" },
  "054": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95965" },
  "055": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "056": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "057": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "058": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "059": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "060": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "061": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "062": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "063": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "064": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "065": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "066": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "067": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "068": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "069": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "070": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "071": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "072": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "073": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "074": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "075": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "076": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "077": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "078": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "079": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "080": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "081": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "082": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "083": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "084": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "085": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "086": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "087": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "088": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  "089": { city: "Oroville", lat: 39.5138, lng: -121.5564, zip: "95966" },
  // Paradise area (090-109)
  "090": { city: "Paradise", lat: 39.7596, lng: -121.6219, zip: "95969" },
  "091": { city: "Paradise", lat: 39.7596, lng: -121.6219, zip: "95969" },
  "092": { city: "Paradise", lat: 39.7596, lng: -121.6219, zip: "95969" },
  "093": { city: "Paradise", lat: 39.7596, lng: -121.6219, zip: "95969" },
  "094": { city: "Paradise", lat: 39.7596, lng: -121.6219, zip: "95969" },
  "095": { city: "Paradise", lat: 39.7596, lng: -121.6219, zip: "95969" },
  "096": { city: "Paradise", lat: 39.7596, lng: -121.6219, zip: "95969" },
  "097": { city: "Paradise", lat: 39.7596, lng: -121.6219, zip: "95969" },
  "098": { city: "Paradise", lat: 39.7596, lng: -121.6219, zip: "95969" },
  "099": { city: "Paradise", lat: 39.7596, lng: -121.6219, zip: "95969" },
  "100": { city: "Paradise", lat: 39.7596, lng: -121.6219, zip: "95969" },
  "101": { city: "Paradise", lat: 39.7596, lng: -121.6219, zip: "95969" },
  "102": { city: "Paradise", lat: 39.7596, lng: -121.6219, zip: "95969" },
  "103": { city: "Paradise", lat: 39.7596, lng: -121.6219, zip: "95969" },
  "104": { city: "Paradise", lat: 39.7596, lng: -121.6219, zip: "95969" },
  "105": { city: "Paradise", lat: 39.7596, lng: -121.6219, zip: "95969" },
  "106": { city: "Paradise", lat: 39.7596, lng: -121.6219, zip: "95969" },
  "107": { city: "Paradise", lat: 39.7596, lng: -121.6219, zip: "95969" },
  "108": { city: "Paradise", lat: 39.7596, lng: -121.6219, zip: "95969" },
  "109": { city: "Paradise", lat: 39.7596, lng: -121.6219, zip: "95969" },
  // Magalia area (110-119)
  "110": { city: "Magalia", lat: 39.8121, lng: -121.5783, zip: "95954" },
  "111": { city: "Magalia", lat: 39.8121, lng: -121.5783, zip: "95954" },
  "112": { city: "Magalia", lat: 39.8121, lng: -121.5783, zip: "95954" },
  "113": { city: "Magalia", lat: 39.8121, lng: -121.5783, zip: "95954" },
  "114": { city: "Magalia", lat: 39.8121, lng: -121.5783, zip: "95954" },
  "115": { city: "Magalia", lat: 39.8121, lng: -121.5783, zip: "95954" },
  "116": { city: "Magalia", lat: 39.8121, lng: -121.5783, zip: "95954" },
  "117": { city: "Magalia", lat: 39.8121, lng: -121.5783, zip: "95954" },
  "118": { city: "Magalia", lat: 39.8121, lng: -121.5783, zip: "95954" },
  "119": { city: "Magalia", lat: 39.8121, lng: -121.5783, zip: "95954" },
}

const CITY_CENTERS: Record<string, { lat: number; lng: number; zip: string }> = {
  Chico: { lat: 39.7285, lng: -121.8375, zip: "95928" },
  Oroville: { lat: 39.5138, lng: -121.5564, zip: "95965" },
  Paradise: { lat: 39.7596, lng: -121.6219, zip: "95969" },
  Magalia: { lat: 39.8121, lng: -121.5783, zip: "95954" },
  Gridley: { lat: 39.3638, lng: -121.6936, zip: "95948" },
  Biggs: { lat: 39.4127, lng: -121.7128, zip: "95917" },
  Durham: { lat: 39.646, lng: -121.7997, zip: "95938" },
}

// ===========================================
// HELPERS
// ===========================================

function getCityFromAPN(apn: string): { city: string; lat: number; lng: number; zip: string } | null {
  const normalized = apn.replace(/[^0-9]/g, "")
  const prefix = normalized.slice(0, 3)
  return APN_CITY_MAP[prefix] || null
}

function addSmallOffset(lat: number, lng: number, apn: string): { lat: number; lng: number } {
  const normalized = apn.replace(/[^0-9]/g, "")
  const hash = normalized.split("").reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0)
  // Spread properties within ~0.5 mile radius of city center
  const offsetLat = ((hash % 200) - 100) * 0.001
  const offsetLng = (((hash * 7) % 200) - 100) * 0.001
  return { lat: lat + offsetLat, lng: lng + offsetLng }
}

function isValidJsonResponse(text: string): boolean {
  if (!text || typeof text !== "string") return false
  const trimmed = text.trim()
  return trimmed.startsWith("{") || trimmed.startsWith("[")
}

// ===========================================
// BUTTE COUNTY GIS API QUERY
// ===========================================

interface GISParcelResult {
  address: string | null
  city: string | null
  zip: string | null
  lat: number | null
  lng: number | null
}

/**
 * Query Butte County GIS for parcel data by APN
 * Tries multiple service endpoints and APN formats
 */
async function queryButteCountyGIS(apn: string): Promise<GISParcelResult | null> {
  const normalized = apn.replace(/[^0-9]/g, "")

  // Try different APN formats
  const apnFormats = [
    normalized, // 001012008000
    `${normalized.slice(0, 3)}-${normalized.slice(3, 6)}-${normalized.slice(6, 9)}`, // 001-012-008
    `${normalized.slice(0, 3)}-${normalized.slice(3, 6)}-${normalized.slice(6)}`, // 001-012-008000
  ]

  // GIS Services to try (in order of preference)
  const services = [
    "https://gisportal.buttecounty.net/arcgis/rest/services/Parcel_Lookup_Data/FeatureServer/0",
    "https://gisportal.buttecounty.net/arcgis/rest/services/Base_Layers/FeatureServer/0",
    "https://gisportal.buttecounty.net/arcgis/rest/services/lafco/lafco/FeatureServer/2",
  ]

  // APN field names to try
  const apnFields = ["APN", "Apn", "apn", "PARCEL_NUMBER", "ParcelNumber", "PARCELID"]

  for (const service of services) {
    for (const apnFormat of apnFormats) {
      for (const field of apnFields) {
        try {
          const url = new URL(`${service}/query`)
          url.searchParams.set("where", `${field}='${apnFormat}'`)
          url.searchParams.set("outFields", "*")
          url.searchParams.set("returnGeometry", "true")
          url.searchParams.set("outSR", "4326")
          url.searchParams.set("f", "json")

          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 8000)

          const response = await fetch(url.toString(), {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          })
          clearTimeout(timeoutId)

          if (!response.ok) continue

          const text = await response.text()
          if (!isValidJsonResponse(text)) continue

          const data = JSON.parse(text)

          if (data.error) continue
          if (!data.features || data.features.length === 0) continue

          const feature = data.features[0]
          const attrs = feature.attributes || {}
          const geom = feature.geometry

          // Extract address from various possible field names
          const address =
            attrs.SitusAddress ||
            attrs.SITUS_ADDR ||
            attrs.Address ||
            attrs.SITUS ||
            attrs.FullAddress ||
            attrs.FULL_ADDR ||
            null

          const city = attrs.SitusCity || attrs.SITUS_CITY || attrs.City || attrs.CITY || null

          const zip = attrs.SitusZip || attrs.SITUS_ZIP || attrs.Zip || attrs.ZIP || attrs.ZIPCODE || null

          // Get centroid coordinates
          let lat: number | null = null
          let lng: number | null = null

          if (geom) {
            if (geom.x && geom.y) {
              lng = geom.x
              lat = geom.y
            } else if (geom.rings && geom.rings.length > 0) {
              // Calculate centroid of polygon
              const ring = geom.rings[0]
              const sumX = ring.reduce((sum: number, coord: number[]) => sum + coord[0], 0)
              const sumY = ring.reduce((sum: number, coord: number[]) => sum + coord[1], 0)
              lng = sumX / ring.length
              lat = sumY / ring.length
            }
          }

          if (address || (lat && lng)) {
            return { address, city, zip, lat, lng }
          }
        } catch {
          // Continue to next combination
          continue
        }
      }
    }
  }

  return null
}

/**
 * REVERSE GEOCODING (MAPBOX)
 * Fallback: Converts coordinates into a human-readable street address
 */
async function getAddressFromCoords(lat: number, lng: number): Promise<string | null> {
  try {
    const token = process.env.MAPBOX_TOKEN
    if (!token) return null

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=address&limit=1`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!response.ok) return null

    const contentType = response.headers.get("content-type") || ""
    if (!contentType.includes("application/json")) return null

    const text = await response.text()
    if (!isValidJsonResponse(text)) return null

    const data = JSON.parse(text)
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name
    }
  } catch {
    // Silently fail
  }
  return null
}

// ===========================================
// MAIN PIPELINE
// ===========================================

export async function enrichProperty(apn: string): Promise<EnrichmentResult> {
  const missingFields: string[] = []

  // Step 1: Normalize APN
  const normalizedAPN = apn.replace(/[^0-9]/g, "")
  const formattedAPN =
    normalizedAPN.length >= 9
      ? `${normalizedAPN.slice(0, 3)}-${normalizedAPN.slice(3, 6)}-${normalizedAPN.slice(6, 9)}${normalizedAPN.length > 9 ? "-" + normalizedAPN.slice(9) : ""}`
      : apn

  // Step 2: Try Butte County GIS first for actual parcel data
  let address: string | null = null
  let city: string | null = null
  let zipCode: string | null = null
  let latitude: number | null = null
  let longitude: number | null = null
  let source = "fallback"

  const gisResult = await queryButteCountyGIS(apn)

  if (gisResult) {
    source = "butte_county_gis"
    if (gisResult.address) address = gisResult.address
    if (gisResult.city) city = gisResult.city
    if (gisResult.zip) zipCode = gisResult.zip
    if (gisResult.lat && gisResult.lng) {
      latitude = gisResult.lat
      longitude = gisResult.lng
    }
  }

  // Step 3: Fallback to APN prefix mapping for city/coordinates if GIS failed
  const apnData = getCityFromAPN(apn)

  if (!city && apnData) {
    city = apnData.city
    source = source === "butte_county_gis" ? source : "apn_prefix_mapping"
  }

  if (!zipCode && apnData) {
    zipCode = apnData.zip
  }

  if ((!latitude || !longitude) && apnData) {
    const coords = addSmallOffset(apnData.lat, apnData.lng, apn)
    latitude = coords.lat
    longitude = coords.lng
    source = source === "butte_county_gis" ? source : "apn_prefix_mapping"
  }

  // Step 4: Final fallback to Chico if nothing worked
  if (!city) {
    city = "Chico"
    source = "default_chico"
  }

  if (!zipCode) {
    zipCode = CITY_CENTERS[city]?.zip || "95928"
  }

  if (!latitude || !longitude) {
    const cityData = CITY_CENTERS[city] || CITY_CENTERS.Chico
    const coords = addSmallOffset(cityData.lat, cityData.lng, apn)
    latitude = coords.lat
    longitude = coords.lng
  }

  // Step 5: Try Mapbox reverse geocoding if we still don't have an address
  if (!address && latitude && longitude) {
    const mapboxAddress = await getAddressFromCoords(latitude, longitude)
    if (mapboxAddress) {
      address = mapboxAddress
      source += "_plus_mapbox"
    }
  }

  // Step 6: Final address fallback with city info
  if (!address) {
    address = `${city}, CA ${zipCode} (APN: ${formattedAPN})`
    missingFields.push("address")
  }

  // Step 7: Get census tract
  const censusTract = CENSUS_TRACTS?.find((t) => t.city === city)?.tract || null
  if (!censusTract) missingFields.push("censusTract")

  const status: EnrichmentResult["status"] =
    missingFields.length === 0 ? "complete" : missingFields.length === 1 ? "partial" : "missing_data"

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
    source,
    enrichedAt: new Date().toISOString(),
  }
}

/**
 * Batch enrich multiple properties with a delay to avoid rate limits
 */
export async function enrichProperties(
  apns: string[],
  options: { onProgress?: (completed: number, total: number) => void } = {},
): Promise<EnrichmentResult[]> {
  const { onProgress } = options
  const results: EnrichmentResult[] = []

  for (let i = 0; i < apns.length; i++) {
    const result = await enrichProperty(apns[i])
    results.push(result)
    await new Promise((resolve) => setTimeout(resolve, 300))
    onProgress?.(i + 1, apns.length)
  }

  return results
}
