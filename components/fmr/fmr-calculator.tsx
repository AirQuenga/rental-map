"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { calculateFMR, FMR_BASE_VALUES, type UtilityConfiguration, getDefaultUtilityConfig } from "@/lib/fmr"
import { HEATING_TYPES, COOKING_TYPES, AC_TYPES, WATER_HEATER_TYPES } from "@/config/enums"
import { Calculator, Thermometer, ChefHat, Wind, Zap, Droplets, Trash2, Info } from "lucide-react"

export function FMRCalculator() {
  const [bedrooms, setBedrooms] = useState(2)
  const [config, setConfig] = useState<UtilityConfiguration>(getDefaultUtilityConfig())

  const result = calculateFMR(bedrooms, config)

  const updateConfig = <K extends keyof UtilityConfiguration>(key: K, value: UtilityConfiguration[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          HUD FMR Calculator
        </CardTitle>
        <CardDescription>Calculate Fair Market Rent with utility allowances for Butte County (2025)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bedroom Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Number of Bedrooms</Label>
          <Select value={String(bedrooms)} onValueChange={(v) => setBedrooms(Number(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Studio</SelectItem>
              <SelectItem value="1">1 Bedroom</SelectItem>
              <SelectItem value="2">2 Bedrooms</SelectItem>
              <SelectItem value="3">3 Bedrooms</SelectItem>
              <SelectItem value="4">4 Bedrooms</SelectItem>
              <SelectItem value="5">5+ Bedrooms</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Utility Configuration */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Utility Configuration</h4>
          <p className="text-xs text-muted-foreground">
            Toggle utilities the tenant pays. Allowances are deducted from the max rent.
          </p>

          {/* Heating */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <Thermometer className="h-4 w-4 text-orange-500" />
              <div>
                <Label className="text-sm font-medium">Heating</Label>
                <Select
                  value={config.heating.type}
                  onValueChange={(v) =>
                    updateConfig("heating", { ...config.heating, type: v as UtilityConfiguration["heating"]["type"] })
                  }
                >
                  <SelectTrigger className="mt-1 h-8 w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HEATING_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="heating-tenant" className="text-xs text-muted-foreground">
                Tenant Pays
              </Label>
              <Switch
                id="heating-tenant"
                checked={config.heating.tenantPays}
                onCheckedChange={(v) => updateConfig("heating", { ...config.heating, tenantPays: v })}
              />
            </div>
          </div>

          {/* Cooking */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <ChefHat className="h-4 w-4 text-blue-500" />
              <div>
                <Label className="text-sm font-medium">Cooking</Label>
                <Select
                  value={config.cooking.type}
                  onValueChange={(v) =>
                    updateConfig("cooking", { ...config.cooking, type: v as UtilityConfiguration["cooking"]["type"] })
                  }
                >
                  <SelectTrigger className="mt-1 h-8 w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COOKING_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="cooking-tenant" className="text-xs text-muted-foreground">
                Tenant Pays
              </Label>
              <Switch
                id="cooking-tenant"
                checked={config.cooking.tenantPays}
                onCheckedChange={(v) => updateConfig("cooking", { ...config.cooking, tenantPays: v })}
              />
            </div>
          </div>

          {/* Air Conditioning */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <Wind className="h-4 w-4 text-cyan-500" />
              <div>
                <Label className="text-sm font-medium">Air Conditioning</Label>
                <Select
                  value={config.airConditioning.type}
                  onValueChange={(v) =>
                    updateConfig("airConditioning", {
                      ...config.airConditioning,
                      type: v as UtilityConfiguration["airConditioning"]["type"],
                    })
                  }
                >
                  <SelectTrigger className="mt-1 h-8 w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AC_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="ac-tenant" className="text-xs text-muted-foreground">
                Tenant Pays
              </Label>
              <Switch
                id="ac-tenant"
                checked={config.airConditioning.tenantPays}
                onCheckedChange={(v) => updateConfig("airConditioning", { ...config.airConditioning, tenantPays: v })}
              />
            </div>
          </div>

          {/* Water Heater */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-yellow-500" />
              <div>
                <Label className="text-sm font-medium">Water Heater</Label>
                <Select
                  value={config.waterHeater.type}
                  onValueChange={(v) =>
                    updateConfig("waterHeater", {
                      ...config.waterHeater,
                      type: v as UtilityConfiguration["waterHeater"]["type"],
                    })
                  }
                >
                  <SelectTrigger className="mt-1 h-8 w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WATER_HEATER_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="water-heater-tenant" className="text-xs text-muted-foreground">
                Tenant Pays
              </Label>
              <Switch
                id="water-heater-tenant"
                checked={config.waterHeater.tenantPays}
                onCheckedChange={(v) => updateConfig("waterHeater", { ...config.waterHeater, tenantPays: v })}
              />
            </div>
          </div>

          {/* Water/Sewer */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <Droplets className="h-4 w-4 text-blue-400" />
              <Label className="text-sm font-medium">Water/Sewer</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="water-sewer" className="text-xs text-muted-foreground">
                Tenant Pays
              </Label>
              <Switch
                id="water-sewer"
                checked={config.waterSewer === "not-included"}
                onCheckedChange={(v) => updateConfig("waterSewer", v ? "not-included" : "included")}
              />
            </div>
          </div>

          {/* Trash */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <Trash2 className="h-4 w-4 text-gray-500" />
              <Label className="text-sm font-medium">Trash</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="trash" className="text-xs text-muted-foreground">
                Tenant Pays
              </Label>
              <Switch
                id="trash"
                checked={config.trash === "not-included"}
                onCheckedChange={(v) => updateConfig("trash", v ? "not-included" : "included")}
              />
            </div>
          </div>

          {/* Appliances */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="text-sm">Refrigerator Provided</Label>
              <Switch
                checked={config.refrigeratorProvided}
                onCheckedChange={(v) => updateConfig("refrigeratorProvided", v)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="text-sm">Range Provided</Label>
              <Switch checked={config.rangeProvided} onCheckedChange={(v) => updateConfig("rangeProvided", v)} />
            </div>
          </div>
        </div>

        <Separator />

        {/* Results */}
        <div className="space-y-4 rounded-lg bg-primary/5 p-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <Info className="h-4 w-4" />
            FMR Calculation Results
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Base FMR ({bedrooms === 0 ? "Studio" : `${bedrooms} BR`})
              </span>
              <span className="font-semibold">${result.baseFMR.toLocaleString()}</span>
            </div>

            {/* Utility Breakdown */}
            {result.utilityAllowance > 0 && (
              <div className="space-y-1 rounded border bg-background p-2">
                <div className="mb-2 text-xs font-medium text-muted-foreground">Utility Allowance Breakdown:</div>
                {result.utilityBreakdown.heating > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Heating</span>
                    <span>-${result.utilityBreakdown.heating}</span>
                  </div>
                )}
                {result.utilityBreakdown.cooking > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Cooking</span>
                    <span>-${result.utilityBreakdown.cooking}</span>
                  </div>
                )}
                {result.utilityBreakdown.airConditioning > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Air Conditioning</span>
                    <span>-${result.utilityBreakdown.airConditioning}</span>
                  </div>
                )}
                {result.utilityBreakdown.waterHeater > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Water Heater</span>
                    <span>-${result.utilityBreakdown.waterHeater}</span>
                  </div>
                )}
                {result.utilityBreakdown.waterSewer > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Water/Sewer</span>
                    <span>-${result.utilityBreakdown.waterSewer}</span>
                  </div>
                )}
                {result.utilityBreakdown.trash > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Trash</span>
                    <span>-${result.utilityBreakdown.trash}</span>
                  </div>
                )}
                {result.utilityBreakdown.refrigerator > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Refrigerator</span>
                    <span>-${result.utilityBreakdown.refrigerator}</span>
                  </div>
                )}
                {result.utilityBreakdown.range > 0 && (
                  <div className="flex justify-between text-xs">
                    <span>Range</span>
                    <span>-${result.utilityBreakdown.range}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Utility Allowance</span>
              <span className="font-semibold text-red-500">-${result.utilityAllowance.toLocaleString()}</span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="font-medium">Maximum Allowable Rent</span>
              <Badge className="bg-green-500 text-lg text-white">${result.adjustedFMR.toLocaleString()}</Badge>
            </div>
          </div>
        </div>

        {/* FMR Reference Table */}
        <div className="rounded-lg border">
          <div className="border-b bg-muted/50 px-3 py-2">
            <span className="text-xs font-medium">2025 Butte County FMR Schedule</span>
          </div>
          <div className="grid grid-cols-6 gap-px bg-border text-center text-xs">
            {Object.entries(FMR_BASE_VALUES).map(([br, fmr]) => (
              <div
                key={br}
                className={`bg-background p-2 ${Number(br) === bedrooms ? "bg-primary/10 font-semibold" : ""}`}
              >
                <div className="text-muted-foreground">{br === "0" ? "Studio" : `${br}BR`}</div>
                <div>${fmr}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
