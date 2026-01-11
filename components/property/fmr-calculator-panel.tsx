"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download } from "lucide-react"
import {
  BUTTE_CITIES,
  UTILITY_RATES_2026,
  FMR_2026,
  calculateFMR2026,
  type CityZone,
  type HeatingType,
  type CookingType,
  type WaterHeaterType,
  type ACType,
  type CalculatorConfig,
  type CalculationResult,
} from "@/config/fmr-2026"

interface FMRCalculatorPanelProps {
  bedrooms: number
  city?: string
  currentRent?: number | null
  propertyType?: string
}

export function FMRCalculatorPanel({ bedrooms, city, currentRent, propertyType }: FMRCalculatorPanelProps) {
  // Detect city zone from property city
  const detectCity = (cityName?: string): CityZone => {
    if (!cityName) return "chico"
    const lower = cityName.toLowerCase()
    if (lower.includes("paradise")) return "paradise"
    if (lower.includes("oroville")) return "oroville"
    if (lower.includes("gridley")) return "gridley"
    if (lower.includes("biggs")) return "biggs"
    if (lower.includes("durham")) return "durham"
    if (lower.includes("magalia")) return "magalia"
    return "chico"
  }

  const [config, setConfig] = useState<CalculatorConfig>({
    city: detectCity(city),
    bedrooms: Math.min(Math.max(0, bedrooms || 2), 5),
    heating: "natural-gas",
    cooking: "electric",
    waterHeater: "natural-gas",
    airConditioning: "refrigerated",
    waterIncluded: false,
    sewerIncluded: false,
    trashIncluded: true,
    tenantProvidesRange: false,
    tenantProvidesRefrigerator: false,
  })

  const [otherFees, setOtherFees] = useState(0)
  const [result, setResult] = useState<CalculationResult | null>(null)

  // Calculate on config change
  useEffect(() => {
    setResult(calculateFMR2026(config))
  }, [config])

  const updateConfig = <K extends keyof CalculatorConfig>(key: K, value: CalculatorConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  // Get utility cost for display
  const getUtilityCost = (type: string, value: string): number => {
    const br = config.bedrooms
    if (type === "heating") return UTILITY_RATES_2026.heating[value as HeatingType]?.[br] ?? 0
    if (type === "cooking") return UTILITY_RATES_2026.cooking[value as CookingType]?.[br] ?? 0
    if (type === "waterHeater") return UTILITY_RATES_2026.waterHeater[value as WaterHeaterType]?.[br] ?? 0
    if (type === "airConditioning") return UTILITY_RATES_2026.airConditioning[value as ACType]?.[br] ?? 0
    if (type === "water") return config.waterIncluded ? 0 : (UTILITY_RATES_2026.water[config.city]?.[br] ?? 0)
    if (type === "sewer") return config.sewerIncluded ? 0 : (UTILITY_RATES_2026.sewer[config.city]?.[br] ?? 0)
    return 0
  }

  // Check if any gas utilities are selected
  const hasGas =
    config.heating === "natural-gas" || config.cooking === "natural-gas" || config.waterHeater === "natural-gas"

  // Check if any electric utilities are selected
  const hasElectric =
    config.heating === "electric" ||
    config.cooking === "electric" ||
    config.waterHeater === "electric" ||
    config.airConditioning === "refrigerated"

  // Customer charges
  const gasCustomerCharge = hasGas ? 4 : 0
  const electricCustomerCharge = hasElectric ? 12 : 0

  const handleDownload = () => {
    if (!result) return

    const summary = `
BUTTE COUNTY UTILITY ALLOWANCE SUMMARY
=======================================
Date: ${new Date().toLocaleDateString()}
Locality: ${BUTTE_CITIES.find((c) => c.id === config.city)?.name || config.city}
Bedrooms: ${config.bedrooms}

BASE FMR (2026): $${result.baseFMR}

UTILITY ALLOWANCES:
- Heating (${config.heating}): $${result.breakdown.heating}
- Cooking (${config.cooking}): $${result.breakdown.cooking}
- Water Heater (${config.waterHeater}): $${result.breakdown.waterHeater}
- Air Conditioning (${config.airConditioning}): $${result.breakdown.airConditioning}
- Water: $${result.breakdown.water}
- Sewer: $${result.breakdown.sewer}
- Trash: $${result.breakdown.trash}
- Range (tenant-owned): $${result.breakdown.range}
- Refrigerator (tenant-owned): $${result.breakdown.refrigerator}

TOTAL UTILITY ALLOWANCE: $${result.totalUtilityAllowance}
NET RENT LIMIT: $${result.netRent}
${currentRent ? `\nCURRENT RENT: $${currentRent}\nDIFFERENCE: $${result.netRent - currentRent}` : ""}
    `.trim()

    const blob = new Blob([summary], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `fmr-summary-${config.bedrooms}br-${config.city}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!result) return null

  const totalWithFees = result.totalUtilityAllowance + otherFees + gasCustomerCharge + electricCustomerCharge

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 p-4 border border-emerald-200">
        <h3 className="text-sm font-bold text-emerald-800 mb-1">Fair Market Rent (FMR) - HUD 2026</h3>
        <p className="text-xs text-emerald-700">Butte County Housing Authority Utility Allowance Schedule</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(FMR_2026).map(([br, amount]) => (
            <Badge
              key={br}
              variant={config.bedrooms === Number(br) ? "default" : "outline"}
              className={config.bedrooms === Number(br) ? "bg-emerald-600" : ""}
            >
              {br === "0" ? "Studio" : `${br}BR`}: ${amount.toLocaleString()}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-800">Unit Details</h4>
        <div className="rounded-md border p-3 space-y-2">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <Label className="text-[10px] text-gray-500 uppercase">City</Label>
              <Select value={config.city} onValueChange={(v) => updateConfig("city", v as CityZone)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUTTE_CITIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] text-gray-500 uppercase">Unit Type</Label>
              <div className="h-8 flex items-center text-xs font-medium capitalize">{propertyType || "Apartment"}</div>
            </div>
            <div>
              <Label className="text-[10px] text-gray-500 uppercase">Bedrooms</Label>
              <Select
                value={config.bedrooms.toString()}
                onValueChange={(v) => updateConfig("bedrooms", Number.parseInt(v))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Studio</SelectItem>
                  <SelectItem value="1">1 BR</SelectItem>
                  <SelectItem value="2">2 BR</SelectItem>
                  <SelectItem value="3">3 BR</SelectItem>
                  <SelectItem value="4">4 BR</SelectItem>
                  <SelectItem value="5">5+ BR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-800">Utility Types</h4>
        <div className="rounded-md border divide-y">
          {/* Heating */}
          <div className="grid grid-cols-3 gap-2 p-2 items-center text-xs">
            <span className="text-gray-600">Heating</span>
            <Select value={config.heating} onValueChange={(v) => updateConfig("heating", v as HeatingType)}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="natural-gas">Natural Gas</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
                <SelectItem value="heat-pump">Heat Pump</SelectItem>
                <SelectItem value="bottled-gas">Bottled Gas</SelectItem>
                <SelectItem value="none">None / Paid by Landlord</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-right font-medium">${getUtilityCost("heating", config.heating)}</span>
          </div>

          {/* Cooking */}
          <div className="grid grid-cols-3 gap-2 p-2 items-center text-xs">
            <span className="text-gray-600">Cooking</span>
            <Select value={config.cooking} onValueChange={(v) => updateConfig("cooking", v as CookingType)}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="natural-gas">Natural Gas</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
                <SelectItem value="bottled-gas">Bottled Gas</SelectItem>
                <SelectItem value="none">None / Paid by Landlord</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-right font-medium">${getUtilityCost("cooking", config.cooking)}</span>
          </div>

          {/* Other Electric */}
          <div className="grid grid-cols-3 gap-2 p-2 items-center text-xs">
            <span className="text-gray-600">Other Electric</span>
            <span className="text-gray-400 text-[10px]">Lights, appliances</span>
            <span className="text-right font-medium">${electricCustomerCharge}</span>
          </div>

          {/* Air Conditioning */}
          <div className="grid grid-cols-3 gap-2 p-2 items-center text-xs">
            <span className="text-gray-600">Air Conditioning</span>
            <Select value={config.airConditioning} onValueChange={(v) => updateConfig("airConditioning", v as ACType)}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="refrigerated">Refrigerated</SelectItem>
                <SelectItem value="evaporative">Evaporative</SelectItem>
                <SelectItem value="none">None / Paid by Landlord</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-right font-medium">${getUtilityCost("airConditioning", config.airConditioning)}</span>
          </div>

          {/* Water Heater */}
          <div className="grid grid-cols-3 gap-2 p-2 items-center text-xs">
            <span className="text-gray-600">Water Heater</span>
            <Select value={config.waterHeater} onValueChange={(v) => updateConfig("waterHeater", v as WaterHeaterType)}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="natural-gas">Natural Gas</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
                <SelectItem value="bottled-gas">Bottled Gas</SelectItem>
                <SelectItem value="none">None / Paid by Landlord</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-right font-medium">${getUtilityCost("waterHeater", config.waterHeater)}</span>
          </div>

          {/* Water */}
          <div className="grid grid-cols-3 gap-2 p-2 items-center text-xs">
            <span className="text-gray-600">Water</span>
            <div className="flex items-center gap-2">
              <Switch
                checked={config.waterIncluded}
                onCheckedChange={(v) => updateConfig("waterIncluded", v)}
                className="scale-75"
              />
              <span className="text-[10px] text-gray-500">{config.waterIncluded ? "Included" : "Tenant Pays"}</span>
            </div>
            <span className="text-right font-medium">${getUtilityCost("water", "")}</span>
          </div>

          {/* Sewer */}
          <div className="grid grid-cols-3 gap-2 p-2 items-center text-xs">
            <span className="text-gray-600">Sewer</span>
            <div className="flex items-center gap-2">
              <Switch
                checked={config.sewerIncluded}
                onCheckedChange={(v) => updateConfig("sewerIncluded", v)}
                className="scale-75"
              />
              <span className="text-[10px] text-gray-500">{config.sewerIncluded ? "Included" : "Tenant Pays"}</span>
            </div>
            <span className="text-right font-medium">${getUtilityCost("sewer", "")}</span>
          </div>

          {/* Range/Microwave */}
          <div className="grid grid-cols-3 gap-2 p-2 items-center text-xs">
            <span className="text-gray-600">Range/Microwave</span>
            <div className="flex items-center gap-2">
              <Switch
                checked={config.tenantProvidesRange}
                onCheckedChange={(v) => updateConfig("tenantProvidesRange", v)}
                className="scale-75"
              />
              <span className="text-[10px] text-gray-500">
                {config.tenantProvidesRange ? "Tenant Provides" : "Included"}
              </span>
            </div>
            <span className="text-right font-medium">${config.tenantProvidesRange ? 8 : 0}</span>
          </div>

          {/* Refrigerator */}
          <div className="grid grid-cols-3 gap-2 p-2 items-center text-xs">
            <span className="text-gray-600">Refrigerator</span>
            <div className="flex items-center gap-2">
              <Switch
                checked={config.tenantProvidesRefrigerator}
                onCheckedChange={(v) => updateConfig("tenantProvidesRefrigerator", v)}
                className="scale-75"
              />
              <span className="text-[10px] text-gray-500">
                {config.tenantProvidesRefrigerator ? "Tenant Provides" : "Included"}
              </span>
            </div>
            <span className="text-right font-medium">${config.tenantProvidesRefrigerator ? 12 : 0}</span>
          </div>

          {/* Other Fees */}
          <div className="grid grid-cols-3 gap-2 p-2 items-center text-xs">
            <span className="text-gray-600">Other Fees</span>
            <Input
              type="number"
              value={otherFees}
              onChange={(e) => setOtherFees(Number(e.target.value) || 0)}
              className="h-7 text-xs"
              placeholder="0"
            />
            <span className="text-right font-medium">${otherFees}</span>
          </div>
        </div>
      </div>

      {/* Customer Charges Notice */}
      {(hasGas || hasElectric) && (
        <div className="rounded-md bg-amber-50 p-2 text-xs text-amber-800 border border-amber-200">
          <strong>Customer Charges Included:</strong>
          {hasGas && <span className="ml-1">Gas $4</span>}
          {hasGas && hasElectric && <span>,</span>}
          {hasElectric && <span className="ml-1">Electric $12</span>}
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-800">FMR Calculation</h4>
        <div className="rounded-md border bg-gradient-to-b from-green-50 to-emerald-50 p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <span className="text-gray-600">
              Base FMR ({config.bedrooms === 0 ? "Studio" : `${config.bedrooms} BR`})
            </span>
            <span className="text-right font-semibold">${result.baseFMR.toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-red-600">
            <span>Utility Allowance</span>
            <span className="text-right font-semibold">-${totalWithFees}</span>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-2 text-sm font-bold text-green-700">
            <span>Net Rent Limit</span>
            <span className="text-right">${(result.baseFMR - totalWithFees).toLocaleString()}</span>
          </div>

          {currentRent && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <span className="text-gray-600">Current Rent</span>
                <span className="text-right font-semibold">${currentRent.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs items-center">
                <span className="text-gray-600">Difference</span>
                <div className="text-right">
                  <Badge
                    className={
                      currentRent <= result.baseFMR - totalWithFees
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }
                  >
                    {currentRent <= result.baseFMR - totalWithFees
                      ? `$${(result.baseFMR - totalWithFees - currentRent).toLocaleString()} under`
                      : `$${(currentRent - (result.baseFMR - totalWithFees)).toLocaleString()} over`}
                  </Badge>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Download Button */}
      <Button variant="outline" size="sm" className="w-full text-xs bg-transparent" onClick={handleDownload}>
        <Download className="mr-1 h-3 w-3" />
        Download Summary
      </Button>
    </div>
  )
}
