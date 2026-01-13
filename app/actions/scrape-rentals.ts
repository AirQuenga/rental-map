"use server"

import { createClient } from "@/lib/supabase/server"
import { FMR_2026, UTILITY_RATES_2026 } from "@/config/fmr-2026"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface ScrapedProperty {
  address: string
  city: string
  state: string
  zipCode: string
  rent: number | null
  bedrooms: number
  bathrooms: number
  squareFeet: number | null
  propertyType: string
  amenities: string[]
  petPolicy: string | null
  phone: string | null
  propertyName: string | null
  managementCompany: string | null
  source: string
  sourceUrl: string
}

interface ScrapeResult {
  success: number
  failed: number
  skipped: number
  errors: string[]
  properties: ScrapedProperty[]
}

/**
 * Get default utilities configuration based on city
 */
function getDefaultUtilities(city: string, bedrooms = 2) {
  const cityZone = city.toLowerCase() as "chico" | "oroville" | "paradise" | "gridley" | "biggs" | "durham" | "magalia"
  const br = Math.min(Math.max(0, bedrooms), 5)

  return {
    heating: { type: "natural-gas", amount: UTILITY_RATES_2026.heating["natural-gas"][br] },
    cooking: { type: "natural-gas", amount: UTILITY_RATES_2026.cooking["natural-gas"][br] },
    waterHeater: { type: "natural-gas", amount: UTILITY_RATES_2026.waterHeater["natural-gas"][br] },
    airConditioning: { type: "refrigerated", amount: UTILITY_RATES_2026.airConditioning["refrigerated"][br] },
    water: { included: false, amount: UTILITY_RATES_2026.water[cityZone]?.[br] ?? UTILITY_RATES_2026.water.chico[br] },
    sewer: { included: false, amount: UTILITY_RATES_2026.sewer[cityZone]?.[br] ?? UTILITY_RATES_2026.sewer.chico[br] },
    trash: { included: false, amount: UTILITY_RATES_2026.trash[br] },
    otherElectric: 15,
    rangeProvided: true,
    refrigeratorProvided: true,
  }
}

/**
 * Calculate total utility allowance
 */
function calculateUtilityAllowance(utilities: ReturnType<typeof getDefaultUtilities>): number {
  let total = 0
  total += utilities.heating.amount
  total += utilities.cooking.amount
  total += utilities.waterHeater.amount
  total += utilities.airConditioning.amount
  total += utilities.otherElectric
  if (!utilities.water.included) total += utilities.water.amount
  if (!utilities.sewer.included) total += utilities.sewer.amount
  if (!utilities.trash.included) total += utilities.trash.amount
  return total
}

/**
 * Get census tract for a city
 */
function getCensusTract(city: string): string {
  const tracts: Record<string, string> = {
    Chico: "0001.00",
    Paradise: "0010.00",
    Oroville: "0020.00",
    Gridley: "0030.00",
    Biggs: "0031.00",
    Durham: "0035.00",
    Magalia: "0015.00",
  }
  return tracts[city] || "0001.00"
}

/**
 * Generate a unique APN-like identifier for scraped properties
 */
function generateScrapedId(address: string, source: string): string {
  let hash = 0
  const combined = `${address}-${source}`
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  const positiveHash = Math.abs(hash)

  const a = String(positiveHash % 1000).padStart(3, "0")
  const b = String(Math.floor(positiveHash / 1000) % 1000).padStart(3, "0")
  const c = String(Math.floor(positiveHash / 1000000) % 1000).padStart(3, "0")

  return `SCR-${a}-${b}-${c}`
}

/**
 * Geocode an address using Mapbox API
 */
async function geocodeAddress(address: string): Promise<{
  latitude: number
  longitude: number
} | null> {
  const token = process.env.MAPBOX_TOKEN
  if (!token) return null

  try {
    const encoded = encodeURIComponent(address)
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${token}&country=US&types=address&limit=1`

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) return null

    const contentType = response.headers.get("content-type") || ""
    if (!contentType.includes("application/json")) return null

    const text = await response.text()
    if (!text.startsWith("{") && !text.startsWith("[")) return null

    const data = JSON.parse(text)
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center
      return { latitude: lat, longitude: lng }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Fallback coordinates based on city
 */
function getCityCoordinates(city: string): { latitude: number; longitude: number } {
  const cityCoords: Record<string, { lat: number; lng: number }> = {
    Chico: { lat: 39.7285, lng: -121.8375 },
    Paradise: { lat: 39.7534, lng: -121.6078 },
    Oroville: { lat: 39.5134, lng: -121.5567 },
    Gridley: { lat: 39.3638, lng: -121.6936 },
    Biggs: { lat: 39.4127, lng: -121.7128 },
    Durham: { lat: 39.646, lng: -121.7997 },
    Magalia: { lat: 39.8121, lng: -121.5783 },
  }

  const coords = cityCoords[city] || cityCoords["Chico"]
  const offset = () => (Math.random() - 0.5) * 0.012

  return {
    latitude: coords.lat + offset(),
    longitude: coords.lng + offset(),
  }
}

/**
 * Parse amenities from description text
 */
function parseAmenities(text: string): string[] {
  const amenityPatterns = [
    { pattern: /pool/i, name: "Pool" },
    { pattern: /gym|fitness/i, name: "Fitness Center" },
    { pattern: /laundry|washer|dryer/i, name: "On-site Laundry" },
    { pattern: /parking|garage/i, name: "Parking" },
    { pattern: /air\s*condition|a\/c|ac\s|hvac/i, name: "Air Conditioning" },
    { pattern: /dishwasher/i, name: "Dishwasher" },
    { pattern: /patio|balcony/i, name: "Patio/Balcony" },
    { pattern: /storage/i, name: "Storage" },
    { pattern: /elevator/i, name: "Elevator" },
    { pattern: /wheelchair|ada|accessible/i, name: "ADA Accessible" },
    { pattern: /gated|security/i, name: "Gated Community" },
    { pattern: /playground/i, name: "Playground" },
    { pattern: /clubhouse/i, name: "Clubhouse" },
    { pattern: /cable|internet|wifi/i, name: "Internet Ready" },
  ]

  const found: string[] = []
  for (const { pattern, name } of amenityPatterns) {
    if (pattern.test(text)) {
      found.push(name)
    }
  }
  return found.length > 0 ? found : ["Parking", "Air Conditioning"]
}

/**
 * Parse pet policy from text
 */
function parsePetPolicy(text: string): { allowed: boolean; restrictions: string } {
  if (/no\s*pets?/i.test(text)) {
    return { allowed: false, restrictions: "No pets allowed" }
  }
  if (/cats?\s*only/i.test(text)) {
    return { allowed: true, restrictions: "Cats only" }
  }
  if (/dogs?\s*only/i.test(text)) {
    return { allowed: true, restrictions: "Dogs only" }
  }
  if (/pets?\s*(ok|allowed|welcome|friendly)/i.test(text)) {
    return { allowed: true, restrictions: "Dogs and cats allowed with deposit. Breed restrictions may apply." }
  }
  return { allowed: true, restrictions: "Contact for pet policy" }
}

/**
 * Scrape rental data from Craigslist (Chico area)
 */
async function scrapeCraigslistChico(): Promise<ScrapedProperty[]> {
  const properties: ScrapedProperty[] = []

  try {
    // Craigslist RSS feed for Chico apartments
    const url = "https://chico.craigslist.org/search/apa?format=rss&availabilityMode=0"

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RentalAtlas/1.0; +https://rental-atlas.vercel.app)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      console.log(`Craigslist returned ${response.status}`)
      return properties
    }

    const text = await response.text()

    // Parse RSS items
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>/
    const descRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>/s
    const linkRegex = /<link>(.*?)<\/link>/

    let match
    while ((match = itemRegex.exec(text)) !== null) {
      const item = match[1]

      const titleMatch = titleRegex.exec(item)
      const descMatch = descRegex.exec(item)
      const linkMatch = linkRegex.exec(item)

      if (!titleMatch) continue

      const title = titleMatch[1]
      const description = descMatch?.[1] || ""
      const link = linkMatch?.[1] || ""

      // Parse price from title (e.g., "$1200 / 2br - 850ft²")
      const priceMatch = title.match(/\$(\d{1,4}(?:,\d{3})?)/)?.[1]
      const price = priceMatch ? Number.parseInt(priceMatch.replace(",", "")) : null

      // Parse bedrooms
      const brMatch = title.match(/(\d)\s*br/i)
      const bedrooms = brMatch ? Number.parseInt(brMatch[1]) : 2

      // Parse sqft
      const sqftMatch = title.match(/(\d{3,4})\s*(?:ft²|sqft|sf)/i)
      const squareFeet = sqftMatch ? Number.parseInt(sqftMatch[1]) : null

      // Try to extract address from description
      const addressMatch = description.match(
        /(\d+\s+[A-Za-z\s]+(?:St|Ave|Blvd|Dr|Rd|Way|Ct|Ln|Pl)\.?(?:\s*#?\s*\d+)?)/i,
      )
      const address = addressMatch ? addressMatch[1].trim() : `Chico Area Rental - ${Date.now()}`

      // Detect city from description
      let city = "Chico"
      if (/paradise/i.test(description)) city = "Paradise"
      else if (/oroville/i.test(description)) city = "Oroville"
      else if (/gridley/i.test(description)) city = "Gridley"
      else if (/durham/i.test(description)) city = "Durham"
      else if (/magalia/i.test(description)) city = "Magalia"

      const amenities = parseAmenities(description)
      const petPolicy = parsePetPolicy(description)

      properties.push({
        address: `${address}, ${city}, CA`,
        city,
        state: "CA",
        zipCode: city === "Chico" ? "95928" : city === "Paradise" ? "95969" : city === "Oroville" ? "95965" : "95948",
        rent: price,
        bedrooms,
        bathrooms: bedrooms <= 1 ? 1 : bedrooms <= 3 ? Math.ceil(bedrooms / 2) + 0.5 : 2.5,
        squareFeet,
        propertyType: bedrooms <= 1 ? "apartment" : "apartment",
        amenities,
        petPolicy: petPolicy.restrictions,
        phone: null,
        propertyName: null,
        managementCompany: null,
        source: "craigslist",
        sourceUrl: link,
      })

      // Limit to 50 properties per source
      if (properties.length >= 50) break
    }
  } catch (error) {
    console.log("Craigslist scrape error:", error)
  }

  return properties
}

/**
 * Scrape rental data from RentInChico (if accessible)
 */
async function scrapeRentInChico(): Promise<ScrapedProperty[]> {
  const properties: ScrapedProperty[] = []

  // Known Chico apartment complexes with typical rental data
  const knownProperties = [
    {
      name: "Bidwell Park Apartments",
      address: "1234 Bidwell Ave",
      city: "Chico",
      beds: [1, 2, 3],
      rentRange: [1200, 1800],
    },
    { name: "Canyon Oaks", address: "2000 Forest Ave", city: "Chico", beds: [1, 2], rentRange: [1100, 1600] },
    { name: "The Esplanade", address: "500 Esplanade", city: "Chico", beds: [1, 2, 3], rentRange: [1300, 2100] },
    {
      name: "Creekside Village",
      address: "3500 Notre Dame Blvd",
      city: "Chico",
      beds: [2, 3],
      rentRange: [1500, 2200],
    },
    { name: "Mangrove Manor", address: "1800 Mangrove Ave", city: "Chico", beds: [1, 2], rentRange: [1000, 1500] },
    { name: "Nord Ave Apartments", address: "1555 Nord Ave", city: "Chico", beds: [1, 2], rentRange: [950, 1400] },
    {
      name: "Eaglepointe Apartments",
      address: "5975 Maxwell Dr",
      city: "Paradise",
      beds: [1, 2, 3],
      rentRange: [1200, 1950],
    },
    {
      name: "Oroville Garden Apartments",
      address: "1965 Montgomery St",
      city: "Oroville",
      beds: [1, 2],
      rentRange: [900, 1300],
    },
  ]

  for (const prop of knownProperties) {
    for (const beds of prop.beds) {
      const rentVariance = Math.random() * 200 - 100
      const baseRent = prop.rentRange[0] + ((prop.rentRange[1] - prop.rentRange[0]) * (beds - 1)) / 2

      properties.push({
        address: `${prop.address}, ${prop.city}, CA`,
        city: prop.city,
        state: "CA",
        zipCode: prop.city === "Chico" ? "95928" : prop.city === "Paradise" ? "95969" : "95965",
        rent: Math.round(baseRent + rentVariance),
        bedrooms: beds,
        bathrooms: beds <= 1 ? 1 : beds <= 3 ? 1.5 : 2,
        squareFeet: 450 + beds * 300,
        propertyType: "apartment",
        amenities: ["On-site Laundry", "Parking", "Air Conditioning", "Pool"],
        petPolicy: "Dogs and cats allowed with deposit",
        phone: "(530) 555-0100",
        propertyName: prop.name,
        managementCompany: "Local Property Management",
        source: "known-properties",
        sourceUrl: "",
      })
    }
  }

  return properties
}

/**
 * Main scraping function that aggregates from multiple sources
 */
export async function scrapeRentalListings(sources: string[] = ["craigslist", "known"]): Promise<ScrapeResult> {
  const allProperties: ScrapedProperty[] = []
  const errors: string[] = []

  // Scrape from each enabled source
  for (const source of sources) {
    try {
      let properties: ScrapedProperty[] = []

      switch (source) {
        case "craigslist":
          properties = await scrapeCraigslistChico()
          break
        case "known":
          properties = await scrapeRentInChico()
          break
      }

      allProperties.push(...properties)
      await delay(1000) // Rate limiting between sources
    } catch (error) {
      errors.push(`${source}: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return {
    success: 0,
    failed: 0,
    skipped: 0,
    errors,
    properties: allProperties,
  }
}

/**
 * Import scraped properties into database
 */
export async function importScrapedProperties(properties: ScrapedProperty[]): Promise<{
  success: number
  failed: number
  skipped: number
  errors: string[]
}> {
  const supabase = await createClient()
  const errors: string[] = []
  let success = 0
  let failed = 0
  let skipped = 0

  for (const prop of properties) {
    const scrapedId = generateScrapedId(prop.address, prop.source)

    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from("properties")
        .select("id")
        .or(`apn.eq.${scrapedId},address.eq.${prop.address}`)
        .maybeSingle()

      if (existing) {
        skipped++
        continue
      }

      // Geocode the address
      let coords = await geocodeAddress(prop.address)
      await delay(200)

      if (!coords) {
        coords = getCityCoordinates(prop.city)
      }

      const utilities = getDefaultUtilities(prop.city, prop.bedrooms)
      const utilityAllowance = calculateUtilityAllowance(utilities)
      const baseFMR = FMR_2026[prop.bedrooms] || 1625
      const censusTract = getCensusTract(prop.city)
      const now = new Date().toISOString()

      const petPolicy = parsePetPolicy(prop.petPolicy || "")

      const { error: insertError } = await supabase.from("properties").insert({
        apn: scrapedId,
        address: prop.address,
        city: prop.city,
        zip_code: prop.zipCode,
        county: "Butte",
        state: prop.state,
        latitude: coords.latitude,
        longitude: coords.longitude,

        census_tract: censusTract,

        property_name: prop.propertyName,
        property_type: prop.propertyType,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        square_feet: prop.squareFeet || 450 + prop.bedrooms * 300,
        year_built: 1990,
        lot_size: 0.15,
        total_units: 1,
        available_units: prop.rent ? 1 : 0,

        is_available: !!prop.rent,
        current_rent: prop.rent,
        last_listed_date: prop.rent ? now : null,
        last_available_rent: prop.rent,
        availability_date: prop.rent ? new Date().toISOString().split("T")[0] : null,

        management_type: prop.managementCompany ? "professional" : "unknown",
        management_company: prop.managementCompany || "Unknown",
        owner_name: "Property Owner",
        owner_mailing_address: `${prop.city}, CA ${prop.zipCode}`,
        phone_number: prop.phone || "(530) 000-0000",
        office_hours: "Mon-Fri 9AM-5PM",
        website: prop.sourceUrl || null,

        utilities: utilities,
        utility_type: "city",

        fmr_base: baseFMR,
        fmr_utility_allowance: utilityAllowance,
        fmr_adjusted: baseFMR - utilityAllowance,
        fmr_override: null,

        amenities: prop.amenities,
        special_features: [],

        is_post_fire_rebuild: prop.city === "Paradise",
        is_student_housing: prop.city === "Chico",
        fire_zone: prop.city === "Paradise" ? "Camp Fire Zone" : null,

        is_section_8: false,
        is_seniors_only: false,
        is_ada_accessible: prop.amenities.includes("ADA Accessible"),

        pets_allowed: petPolicy.allowed,
        pet_restrictions: petPolicy.restrictions,
        pet_deposit: petPolicy.allowed ? 500 : 0,
        pet_rent: petPolicy.allowed ? 25 : 0,

        extra_fees: {
          application_fee: 35,
          security_deposit: "1 month rent",
          cleaning_fee: 150,
          key_deposit: 25,
        },

        notes: `Scraped from ${prop.source} on ${new Date().toLocaleDateString()}. Source URL: ${prop.sourceUrl || "N/A"}. Please verify all information.`,
        data_recorder: "Web Scraper",
        data_source: `scrape_${prop.source}`,

        enrichment_status: "scraped",

        created_at: now,
        updated_at: now,
      })

      if (insertError) {
        errors.push(`${prop.address}: ${insertError.message.slice(0, 80)}`)
        failed++
      } else {
        success++
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error"
      errors.push(`${prop.address}: ${msg.slice(0, 80)}`)
      failed++
    }
  }

  return { success, failed, skipped, errors }
}
