"use server"

import { createClient } from "@/lib/supabase/server"
import { enrichProperty } from "@/lib/enrichProperty"

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
      let existing = null
      try {
        const { data, error: fetchError } = await supabase.from("properties").select("id").eq("apn", apn).maybeSingle()

        if (fetchError) {
          // Check if it's a JSON parse error (HTML response)
          if (fetchError.message?.includes("JSON") || fetchError.message?.includes("unexpected")) {
            errors.push(`${apn}: Database returned non-JSON response - ${fetchError.message.slice(0, 100)}`)
          } else {
            errors.push(`${apn}: Database check failed - ${fetchError.message}`)
          }
          failed++
          continue
        }
        existing = data
      } catch (parseError) {
        const errorMsg = parseError instanceof Error ? parseError.message : "Unknown parse error"
        errors.push(`${apn}: Failed to parse database response - ${errorMsg.slice(0, 100)}`)
        failed++
        continue
      }

      if (existing) {
        skipped++
        continue
      }

      // Enrich property data
      const enriched = await enrichProperty(apn)

      if (!enriched.data.latitude || !enriched.data.longitude) {
        failed++
        errors.push(`${apn}: No coordinates generated`)
        continue
      }

      const finalAddress = enriched.data.address || `Address Unknown - ${enriched.apn}`

      // Insert property with try-catch for response validation
      try {
        const { error: insertError } = await supabase.from("properties").insert({
          apn: enriched.apn,
          address: finalAddress,
          city: enriched.data.city || "Unknown",
          zip_code: enriched.data.zipCode || "00000",
          county: enriched.data.county || "Butte",
          state: enriched.data.state || "CA",
          latitude: enriched.data.latitude,
          longitude: enriched.data.longitude,
          census_tract: enriched.data.censusTract,
          enrichment_status: enriched.status,
          property_type: "unknown",
          is_available: false,
          management_type: "unknown",
        })

        if (insertError) {
          failed++
          errors.push(`${apn}: Insert failed - ${insertError.message}`)
        } else {
          success++
        }
      } catch (insertParseError) {
        const errorMsg = insertParseError instanceof Error ? insertParseError.message : "Unknown error"
        errors.push(`${apn}: Failed to parse insert response - ${errorMsg.slice(0, 100)}`)
        failed++
      }
    } catch (error) {
      failed++
      errors.push(`${apn}: Unexpected error - ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return { success, failed, skipped, errors }
}
