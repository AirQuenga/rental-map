/**
 * Census Tract Lookup Utilities
 * Lookup census tract based on APN prefix patterns for Butte County
 */

// APN prefix to census tract mapping
// Based on Butte County Assessor parcel numbering system
// Format: First 3 digits of APN indicate approximate geographic area
const APN_TRACT_MAP: Record<string, string> = {
  // Chico area (001-010)
  "001": "06007000101", // Downtown Chico
  "002": "06007000102", // North Chico
  "003": "06007000103", // East Chico
  "004": "06007000104", // South Chico
  "005": "06007000105", // West Chico
  "006": "06007000201", // Chico outskirts
  "007": "06007000202",
  "008": "06007000301",
  "009": "06007000302",
  "010": "06007000400",

  // Paradise area (011-020)
  "011": "06007000800", // Paradise
  "012": "06007000801",
  "013": "06007000802",
  "014": "06007000900",
  "015": "06007000901",
  "016": "06007001000", // Upper Paradise
  "017": "06007001001",
  "018": "06007001002",
  "019": "06007001100",
  "020": "06007001101",

  // Magalia area (021-025)
  "021": "06007001000", // Magalia
  "022": "06007001001",
  "023": "06007001002",
  "024": "06007001003",
  "025": "06007001004",

  // Oroville area (026-040)
  "026": "06007001100", // Oroville
  "027": "06007001101",
  "028": "06007001102",
  "029": "06007001200",
  "030": "06007001201",
  "031": "06007001300",
  "032": "06007001301",
  "033": "06007001302",
  "034": "06007001400",
  "035": "06007001401",
  "036": "06007001500",
  "037": "06007001501",
  "038": "06007001600",
  "039": "06007001601",
  "040": "06007001700",

  // Gridley area (041-050)
  "041": "06007001400", // Gridley
  "042": "06007001401",
  "043": "06007001402",
  "044": "06007001403",
  "045": "06007001500",

  // Biggs area (046-050)
  "046": "06007001500", // Biggs
  "047": "06007001501",
  "048": "06007001502",

  // Durham area (049-055)
  "049": "06007001600", // Durham
  "050": "06007001601",
  "051": "06007001602",
  "052": "06007001700",
  "053": "06007001701",
  "054": "06007001702",
  "055": "06007001800",
}

// City to default tract mapping (fallback)
const CITY_TRACT_MAP: Record<string, string> = {
  chico: "06007000101",
  paradise: "06007000800",
  magalia: "06007001000",
  oroville: "06007001100",
  gridley: "06007001400",
  biggs: "06007001500",
  durham: "06007001600",
  palermo: "06007001200",
  thermalito: "06007001300",
}

/**
 * Get census tract from APN
 * @param apn - Assessor Parcel Number (format: XXX-XXX-XXX)
 * @returns Census tract FIPS code or null
 */
export function getCensusTractFromAPN(apn: string): string | null {
  if (!apn) return null

  // Extract first 3 digits (book number)
  const normalized = apn.replace(/[^0-9]/g, "")
  if (normalized.length < 3) return null

  const prefix = normalized.substring(0, 3)
  return APN_TRACT_MAP[prefix] || null
}

/**
 * Get census tract from city name
 * @param city - City name
 * @returns Census tract FIPS code or null
 */
export function getCensusTractFromCity(city: string): string | null {
  if (!city) return null

  const normalized = city.toLowerCase().trim()
  return CITY_TRACT_MAP[normalized] || null
}

/**
 * Get census tract from APN or city (tries APN first, falls back to city)
 * @param apn - Assessor Parcel Number
 * @param city - City name (fallback)
 * @returns Census tract FIPS code or null
 */
export function getCensusTract(apn?: string | null, city?: string | null): string | null {
  // Try APN first
  if (apn) {
    const tractFromAPN = getCensusTractFromAPN(apn)
    if (tractFromAPN) return tractFromAPN
  }

  // Fall back to city
  if (city) {
    return getCensusTractFromCity(city)
  }

  return null
}

/**
 * Format census tract for display (e.g., "0001.01" format)
 * @param tract - Full FIPS tract code
 * @returns Formatted tract number
 */
export function formatCensusTract(tract: string): string {
  if (!tract || tract.length < 11) return tract

  // Extract just the tract number from FIPS code (last 6 digits)
  const tractNum = tract.substring(5)
  const mainPart = tractNum.substring(0, 4)
  const suffix = tractNum.substring(4)

  if (suffix === "00") {
    return mainPart.replace(/^0+/, "") || "0"
  }

  return `${mainPart.replace(/^0+/, "") || "0"}.${suffix}`
}
