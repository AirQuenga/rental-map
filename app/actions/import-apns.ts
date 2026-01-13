"use server"

import { createClient } from "@/lib/supabase/server"
import { enrichProperty } from "@/lib/enrichProperty"
import { FMR_2026, UTILITY_RATES_2026 } from "@/config/fmr-2026"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function isJsonResponse(text: string): boolean {
  if (!text || typeof text !== "string") return false
  const trimmed = text.trim()
  return trimmed.startsWith("{") || trimmed.startsWith("[")
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
 * Main import action for APNs with full field population
 */
export async function importAPNsToDatabase(apns: string[]): Promise<{
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

  for (const apn of apns) {
    try {
      // Check if APN already exists
      let existingData: { id: string } | null = null
      try {
        const { data, error: fetchError } = await supabase.from("properties").select("id").eq("apn", apn).maybeSingle()

        if (fetchError) {
          const errMsg = fetchError.message || ""
          if (errMsg.includes("Unexpected token") || errMsg.includes("JSON")) {
            errors.push(`${apn}: Database returned non-JSON response during check`)
          } else {
            errors.push(`${apn}: DB Check failed - ${errMsg.slice(0, 100)}`)
          }
          failed++
          continue
        }
        existingData = data
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "Unknown error"
        errors.push(`${apn}: Network error during check - ${errorMsg.slice(0, 80)}`)
        failed++
        continue
      }

      if (existingData) {
        skipped++
        continue
      }

      // Enrich property data
      let enriched
      try {
        enriched = await enrichProperty(apn)
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "Unknown error"
        errors.push(`${apn}: Enrichment failed - ${errorMsg.slice(0, 80)}`)
        failed++
        continue
      }

      await delay(250)

      if (!enriched.data.latitude || !enriched.data.longitude) {
        failed++
        errors.push(`${apn}: No coordinates available`)
        continue
      }

      const city = enriched.data.city || "Chico"
      const bedrooms = 2 // Default to 2BR
      const utilities = getDefaultUtilities(city, bedrooms)
      const utilityAllowance = calculateUtilityAllowance(utilities)
      const baseFMR = FMR_2026[bedrooms] || 1625
      const censusTract = getCensusTract(city)
      const now = new Date().toISOString()

      try {
        const { error: insertError } = await supabase.from("properties").insert({
          // Core identifiers
          apn: enriched.apn,
          address: enriched.data.address || `${city}, CA ${enriched.data.zipCode} (APN: ${enriched.apn})`,
          city: city,
          zip_code: enriched.data.zipCode || "95928",
          county: "Butte",
          state: "CA",
          latitude: enriched.data.latitude,
          longitude: enriched.data.longitude,

          // Legal/Census
          census_tract: enriched.data.censusTract || censusTract,

          // Property details - defaults
          property_name: null,
          property_type: "apartment",
          bedrooms: bedrooms,
          bathrooms: 1.0,
          square_feet: 850,
          year_built: 1985,
          lot_size: 0.15,
          total_units: 1,
          available_units: 0,

          // Availability
          is_available: false,
          current_rent: null,
          last_listed_date: null,
          last_available_rent: null,
          availability_date: null,

          // Management
          management_type: "unknown",
          management_company: "Unknown",
          owner_name: "Property Owner",
          owner_mailing_address: `${city}, CA ${enriched.data.zipCode || "95928"}`,
          phone_number: "(530) 000-0000",
          office_hours: "Mon-Fri 9AM-5PM",
          website: null,

          // Utilities - full configuration
          utilities: utilities,
          utility_type: "city",

          // FMR calculations
          fmr_base: baseFMR,
          fmr_utility_allowance: utilityAllowance,
          fmr_adjusted: baseFMR - utilityAllowance,
          fmr_override: null,

          // Features
          amenities: ["On-site Laundry", "Parking", "Air Conditioning"],
          special_features: [],

          // Butte County specific
          is_post_fire_rebuild: false,
          is_student_housing: city === "Chico",
          fire_zone: null,

          // Section 8 / Accessibility
          is_section_8: false,
          is_seniors_only: false,
          is_ada_accessible: false,

          // Pets
          pets_allowed: true,
          pet_restrictions: "Dogs and cats allowed with deposit. Breed restrictions may apply.",
          pet_deposit: 500,
          pet_rent: 25,

          // Extra fees
          extra_fees: {
            application_fee: 35,
            security_deposit: "1 month rent",
            cleaning_fee: 150,
            key_deposit: 25,
          },

          // Notes and tracking
          notes: `Imported via APN lookup on ${new Date().toLocaleDateString()}. Data sourced from ${enriched.source}. Please verify all information.`,
          data_recorder: "System Import",
          data_source: enriched.source,

          // Status
          enrichment_status: enriched.status,

          // Timestamps
          created_at: now,
          updated_at: now,
        })

        if (insertError) {
          const errMsg = insertError.message || ""
          if (errMsg.includes("Unexpected token") || errMsg.includes("JSON")) {
            errors.push(`${apn}: Insert received non-JSON response`)
          } else {
            errors.push(`${apn}: Insert failed - ${errMsg.slice(0, 80)}`)
          }
          failed++
        } else {
          success++
          console.log(`Imported: ${enriched.apn} -> ${city} (all fields populated)`)
        }
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "Unknown error"
        errors.push(`${apn}: Insert exception - ${errorMsg.slice(0, 80)}`)
        failed++
      }
    } catch (globalError) {
      failed++
      const msg = globalError instanceof Error ? globalError.message : "Unknown error"
      errors.push(`${apn}: Fatal error - ${msg.slice(0, 80)}`)
    }
  }

  return { success, failed, skipped, errors }
}
