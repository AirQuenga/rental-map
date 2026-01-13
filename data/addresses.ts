/**
 * Chico California Rental Addresses
 * Parsed from provided address list
 */

export const ADDRESSES_RAW = `
275 E Shasta Ave, Chico, CA 95973
390 Rio Lindo Ave, Chico, CA 95926
101 Risa Way, Chico, CA 95973
821 W East Ave, Chico, CA 95926
811 W East Ave, Chico, CA 95926
400 Mission Ranch Blvd, Chico, CA 95926
123 Henshaw Ave, Chico, CA 95973
711 W East Ave, Chico, CA 95926
220 W 1st Ave, Chico, CA 95926
1256 Warner St Unit C, Chico, CA 95926
1501 N Cherry St, Chico, CA 95926
1565 N Cherry St, Chico, CA 95926
920 W 4th Ave, Chico, CA 95926
1221 N Cedar St, Chico, CA 95926
820 W 4th Ave, Chico, CA 95926
1975 Bruce Rd, Chico, CA 95928
2602 E 20th St, Chico, CA 95928
2060 Amanda Way, Chico, CA 95928
1450 Springfield Dr Unit 162, Chico, CA 95928
1550 Springfield Dr, Chico, CA 95928
1894 Notre Dame Blvd, Chico, CA 95928
100 Sterling Oaks Dr, Chico, CA 95928
447 W 7th St, Chico, CA 95928
161 E 5th St, Chico, CA 95928
1197 E 8th St, Chico, CA 95928
1169 E 8th St, Chico, CA 95928
621 Pomona Ave, Chico, CA 95928
946 Cedar St, Chico, CA 95928
940 Walnut St, Chico, CA 95928
1145 W 9th St, Chico, CA 95928
1400 W 3rd St, Chico, CA 95928
1253 West 5th St, Chico, CA 95928
581 Pomona Ave, Chico, CA 95928
2754 Native Oak Dr, Chico, CA 95928
476 E Lassen Ave, Chico, CA 95973
1080 E Lassen Ave, Chico, CA 95973
864 East Ave #1220, Chico, CA 95926
4070 Nord Hwy, Chico, CA 95973
47 Cobblestone Dr, Chico, CA 95928
1661 Forest Ave, Chico, CA 95928
1200 Nord Ave, Chico, CA 95926
421 Oak St, Chico, CA 95928
2265 Maclovia Ave, Chico, CA 95928
`.trim()

export interface ParsedAddress {
  fullAddress: string
  street: string
  unit?: string
  city: string
  state: string
  zipCode: string
}

/**
 * Parse addresses from raw text
 */
export function parseAddresses(): ParsedAddress[] {
  const lines = ADDRESSES_RAW.split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const addresses: ParsedAddress[] = []
  const seen = new Set<string>()

  for (const line of lines) {
    // Normalize the address
    const normalized = line.replace(/\s+/g, " ").trim()

    // Skip duplicates
    const key = normalized.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)

    // Parse address components
    // Format: "123 Street Name, City, ST 12345" or "123 Street Name Unit X, City, ST 12345"
    const match = normalized.match(/^(.+?),\s*(.+?),\s*([A-Z]{2})\s*(\d{5})$/)

    if (match) {
      const streetPart = match[1].trim()
      const city = match[2].trim()
      const state = match[3].trim()
      const zipCode = match[4].trim()

      // Check for unit number
      const unitMatch = streetPart.match(/^(.+?)\s+(Unit|Apt|#|Suite)\s*(.+)$/i)

      addresses.push({
        fullAddress: normalized,
        street: unitMatch ? unitMatch[1].trim() : streetPart,
        unit: unitMatch ? `${unitMatch[2]} ${unitMatch[3]}`.trim() : undefined,
        city,
        state,
        zipCode,
      })
    } else {
      // Fallback for non-standard format
      addresses.push({
        fullAddress: normalized,
        street: normalized,
        city: "Chico",
        state: "CA",
        zipCode: "95928",
      })
    }
  }

  return addresses
}

/**
 * Get statistics about the address data
 */
export function getAddressStats(): { total: number; unique: number; duplicates: number } {
  const lines = ADDRESSES_RAW.split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const unique = parseAddresses()

  return {
    total: lines.length,
    unique: unique.length,
    duplicates: lines.length - unique.length,
  }
}
