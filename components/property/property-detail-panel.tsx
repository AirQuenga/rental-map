"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Property, PropertyUnit, PropertyPhoto, PropertyFee } from "@/types/property"
import { AMENITY_CATEGORIES } from "@/config/amenities"
import { FEE_TYPES } from "@/config/fees"
import { FMRCalculatorPanel } from "./fmr-calculator-panel" // Assuming this component exists
import {
  X,
  Home,
  Building2,
  Bed,
  Bath,
  Square,
  Calendar,
  MapPin,
  User,
  Bell,
  Flame,
  GraduationCap,
  CheckCircle2,
  Phone,
  Globe,
  Clock,
  PawPrint,
  Zap,
  Thermometer,
  ChefHat,
  Wind,
  ImageIcon,
  Info,
  Calculator,
  ExternalLink,
  DollarSign, // Added for fees
} from "lucide-react"
import { createClient } from "@/lib/supabase/client" // Assuming this client setup exists
import { type UtilityConfiguration, calculateFMR, FMR_2025 } from "@/utils/property-utils" // Assuming these utilities exist

interface PropertyDetailPanelProps {
  property: Property
  onClose: () => void
}

const propertyTypeIcons: Record<string, typeof Home> = {
  "single-family": Home,
  apartment: Building2,
  duplex: Building2,
  triplex: Building2,
  fourplex: Building2,
  condo: Building2,
  townhouse: Building2,
  "mobile-home": Home,
  "multi-family": Building2,
}

function getUtilityConfig(property: Property): UtilityConfiguration | null {
  const utils = property.utilities

  if (!utils) return null

  try {
    return {
      heating: {
        type: utils.heating?.type || "natural-gas",
        tenantPays: utils.heating?.tenant_pays ?? true,
      },
      cooking: {
        type: utils.cooking?.type || "electric",
        tenantPays: utils.cooking?.tenant_pays ?? true,
      },
      airConditioning: {
        type: utils.air_conditioning?.type || "refrigerated",
        tenantPays: utils.air_conditioning?.tenant_pays ?? true,
      },
      waterHeater: {
        type: utils.water_heater?.type || "natural-gas",
        tenantPays: utils.water_heater?.tenant_pays ?? true,
      },
      waterSewer: utils.water_sewer || "not-included",
      trash: utils.trash || "included",
      refrigeratorProvided: utils.refrigerator_provided ?? true,
      rangeProvided: utils.range_provided ?? true,
    }
  } catch (error) {
    console.warn("[PropertyDetailPanel] Error parsing utility config:", error)
    return null
  }
}

export function PropertyDetailPanel({ property, onClose }: PropertyDetailPanelProps) {
  const [email, setEmail] = useState("")
  const [isWatching, setIsWatching] = useState(false)
  const [watchSuccess, setWatchSuccess] = useState(false)
  const [units, setUnits] = useState<PropertyUnit[]>([])
  const [photos, setPhotos] = useState<PropertyPhoto[]>([])
  const [fees, setFees] = useState<PropertyFee[]>([])
  const [activeTab, setActiveTab] = useState("details")
  const [fmrError, setFmrError] = useState<string | null>(null)

  const Icon = propertyTypeIcons[property.property_type] || Home

  // Optimized FMR calculation with useMemo
  const fmrData = useMemo(() => {
    try {
      const utilityConfig = getUtilityConfig(property)
      return calculateFMR(property.bedrooms || 1, utilityConfig)
    } catch (error) {
      console.warn("[PropertyDetailPanel] FMR calculation failed:", error)
      setFmrError("Unable to calculate FMR")
      return {
        baseFMR: FMR_2025[property.bedrooms || 1] || 1096,
        utilityAllowance: 0,
        utilityBreakdown: {
          heating: 0, cooking: 0, airConditioning: 0, waterHeater: 0,
          waterSewer: 0, trash: 0, refrigerator: 0, range: 0,
        },
        adjustedFMR: FMR_2025[property.bedrooms || 1] || 1096,
        maxAllowableRent: FMR_2025[property.bedrooms || 1] || 1096,
        overrideApplied: false,
      }
    }
  }, [property.bedrooms, property.utilities, property]); // Added property to deps for full sensitivity

  // Fetch related data and reset UI states
  useEffect(() => {
    // Reset states when property changes
    setEmail("");
    setWatchSuccess(false);
    setFmrError(null); // Clear FMR error for new property

    const fetchRelatedData = async () => {
      const supabase = createClient()

      try {
        const [unitsRes, photosRes, feesRes] = await Promise.all([
          supabase.from("property_units").select("*").eq("property_id", property.id).order("unit_number"),
          supabase.from("property_photos").select("*").eq("property_id", property.id).order("sort_order"),
          supabase.from("property_fees").select("*").eq("property_id", property.id)
        ]);

        if (unitsRes.error) throw unitsRes.error;
        if (photosRes.error) throw photosRes.error;
        if (feesRes.error) throw feesRes.error;

        if (unitsRes.data) setUnits(unitsRes.data);
        if (photosRes.data) setPhotos(photosRes.data);
        if (feesRes.data) setFees(feesRes.data);

      } catch (error) {
        console.error("[PropertyDetailPanel] Error fetching related data:", error)
        // Optionally set a general error state for the panel
      }
    }

    fetchRelatedData()
  }, [property.id])

  const handleWatch = async () => {
    if (!email) return

    setIsWatching(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("watchlist").insert({
        property_id: property.id,
        email: email,
      })

      if (!error) {
        setWatchSuccess(true)
        setTimeout(() => setWatchSuccess(false), 3000)
      } else {
        console.error("Error adding to watchlist:", error)
        // Handle specific Supabase errors if needed
      }
    } catch (err) {
      console.error("Error adding to watchlist:", err)
    } finally {
      setIsWatching(false)
    }
  }

  // Get amenity labels
  const getAmenityLabel = (amenityId: string) => {
    for (const category of AMENITY_CATEGORIES) {
      const amenity = category.amenities.find((a) => a.id === amenityId)
      if (amenity) return amenity.label
    }
    return amenityId
  }

  // Get fee label
  const getFeeLabel = (feeTypeId: string) => {
    const fee = FEE_TYPES.find((f) => f.id === feeTypeId)
    return fee?.label || feeTypeId
  }

  const isBelowFMR = property.current_rent && property.current_rent < fmrData.maxAllowableRent;

  return (
    <div className="flex h-full w-[420px] flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-border p-4">
        <h2 className="font-semibold text-card-foreground">Property Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-4">
          {/* Status & Price - Refined for better hierarchy */}
          <div className="mb-4">
            <div className="flex items-baseline justify-between">
              <div className="flex flex-wrap gap-1">
                <Badge
                  className={
                    property.is_available
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {property.is_available ? "Available Now" : "Currently Occupied"}
                </Badge>
                {property.is_section_8 && (
                  <Badge className="bg-purple-500 text-white hover:bg-purple-600">Section 8</Badge>
                )}
                {property.is_seniors_only && <Badge className="bg-blue-500 text-white hover:bg-blue-600">55+</Badge>}
                {property.is_available && isBelowFMR && (
                  <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">Below FMR</Badge>
                )}
              </div>
              {property.is_available && property.current_rent && (
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-green-500">${property.current_rent.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
              )}
            </div>
          </div>

          {/* Address - Keep existing clean layout */}
          <div className="mb-4">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 rounded-full bg-primary/10 p-2">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                {property.property_name && (
                  <h3 className="font-semibold text-card-foreground">{property.property_name}</h3>
                )}
                <h3
                  className={
                    property.property_name ? "text-sm text-muted-foreground" : "font-semibold text-card-foreground"
                  }
                >
                  {property.address}
                </h3>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {property.city}, CA {property.zip_code}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info - Keep as is, good for quick links */}
          {(property.phone_number || property.website || property.office_hours) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {property.phone_number && (
                <a
                  href={`tel:${property.phone_number}`}
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/20"
                >
                  <Phone className="h-3 w-3" />
                  {property.phone_number}
                </a>
              )}
              {property.website && (
                <a
                  href={property.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/20"
                >
                  <Globe className="h-3 w-3" />
                  Website
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {property.office_hours && (
                <span className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {property.office_hours}
                </span>
              )}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details" className="text-xs">
                <Info className="mr-1 h-3 w-3" />
                Details
              </TabsTrigger>
              <TabsTrigger value="fmr" className="text-xs">
                <Calculator className="mr-1 h-3 w-3" />
                FMR
              </TabsTrigger>
              <TabsTrigger value="units" className="text-xs">
                <Building2 className="mr-1 h-3 w-3" />
                Units
              </TabsTrigger>
              <TabsTrigger value="photos" className="text-xs">
                <ImageIcon className="mr-1 h-3 w-3" />
                Photos
              </TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="mt-4 space-y-6 animate-in fade-in-0 slide-in-from-right-2">
              {/* Refined Property Details Grid */}
              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Property Details</h4>
                <div className="grid grid-cols-4 divide-x divide-border">
                  <div className="flex flex-col items-center justify-center py-2">
                    <Bed className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="text-sm font-semibold text-card-foreground">{property.bedrooms === 0 ? "Studio" : property.bedrooms || "—"}</span>
                    <span className="text-[10px] uppercase text-muted-foreground">Beds</span>
                  </div>
                  <div className="flex flex-col items-center justify-center py-2">
                    <Bath className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="text-sm font-semibold text-card-foreground">{property.bathrooms || "—"}</span>
                    <span className="text-[10px] uppercase text-muted-foreground">Baths</span>
                  </div>
                  <div className="flex flex-col items-center justify-center py-2">
                    <Square className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="text-sm font-semibold text-card-foreground">{property.square_feet?.toLocaleString() || "—"}</span>
                    <span className="text-[10px] uppercase text-muted-foreground">Sq Ft</span>
                  </div>
                  <div className="flex flex-col items-center justify-center py-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mb-1" />
                    <span className="text-sm font-semibold text-card-foreground">{property.year_built || "—"}</span>
                    <span className="text-[10px] uppercase text-muted-foreground">Built</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Management Info */}
              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Management</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <User className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium capitalize text-card-foreground">
                        {property.management_type === "professional"
                          ? property.management_company || "Professional Management"
                          : "Private Landlord"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {property.management_type === "professional"
                          ? "Professionally Managed"
                          : "Owner-Managed Property"}
                      </div>
                    </div>
                  </div>
                  {/* Phone Number */}
                  {property.phone_number && (
                    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <a
                          href={`tel:${property.phone_number}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {property.phone_number}
                        </a>
                        <div className="text-xs text-muted-foreground">Contact Number</div>
                      </div>
                    </div>
                  )}
                  {/* Office Hours */}
                  {property.office_hours && (
                    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium text-card-foreground">{property.office_hours}</div>
                        <div className="text-xs text-muted-foreground">Office Hours</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Utilities - with safe access */}
              {property.utilities && (
                <>
                  <Separator />
                  <div>
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Utilities</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 rounded bg-muted/30 p-2">
                        <Thermometer className="h-3 w-3 text-orange-500" />
                        <span>{property.utilities?.heating?.type || "Unknown"}</span>
                        {property.utilities?.heating?.tenant_pays && (
                          <Badge variant="outline" className="ml-auto text-[10px] bg-background/50">
                            Tenant Pays
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 rounded bg-muted/30 p-2">
                        <ChefHat className="h-3 w-3 text-blue-500" />
                        <span>{property.utilities?.cooking?.type || "Unknown"}</span>
                        {property.utilities?.cooking?.tenant_pays && (
                          <Badge variant="outline" className="ml-auto text-[10px] bg-background/50">
                            Tenant Pays
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 rounded bg-muted/30 p-2">
                        <Wind className="h-3 w-3 text-cyan-500" />
                        <span>{property.utilities?.air_conditioning?.type || "Unknown"}</span>
                        {property.utilities?.air_conditioning?.tenant_pays && (
                          <Badge variant="outline" className="ml-auto text-[10px] bg-background/50">
                            Tenant Pays
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 rounded bg-muted/30 p-2">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        <span>{property.utilities?.water_heater?.type || "Unknown"}</span>
                        {property.utilities?.water_heater?.tenant_pays && (
                          <Badge variant="outline" className="ml-auto text-[10px] bg-background/50">
                            Tenant Pays
                          </Badge>
                        )}
                      </div>
                      {property.utilities?.water_sewer && property.utilities.water_sewer !== "not-included" && (
                        <div className="flex items-center gap-2 rounded bg-muted/30 p-2">
                            <Bath className="h-3 w-3 text-emerald-500" />
                            <span>Water/Sewer</span>
                            {property.utilities.water_sewer === "tenant-pays" && (
                                <Badge variant="outline" className="ml-auto text-[10px] bg-background/50">Tenant Pays</Badge>
                            )}
                            {property.utilities.water_sewer === "included" && (
                                <Badge variant="outline" className="ml-auto text-[10px] bg-background/50">Included</Badge>
                            )}
                        </div>
                      )}
                      {property.utilities?.trash && property.utilities.trash !== "not-included" && (
                        <div className="flex items-center gap-2 rounded bg-muted/30 p-2">
                            <Trash2 className="h-3 w-3 text-gray-500" />
                            <span>Trash</span>
                            {property.utilities.trash === "tenant-pays" && (
                                <Badge variant="outline" className="ml-auto text-[10px] bg-background/50">Tenant Pays</Badge>
                            )}
                            {property.utilities.trash === "included" && (
                                <Badge variant="outline" className="ml-auto text-[10px] bg-background/50">Included</Badge>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}


              {/* Pet Policy */}
              <Separator />
              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Pet Policy</h4>
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <PawPrint
                    className={`h-5 w-5 ${property.pets_allowed !== false ? "text-green-500" : "text-red-500"}`}
                  />
                  <div>
                    <div className="text-sm font-medium text-card-foreground">
                      {property.pets_allowed !== false ? "Pets Allowed" : "No Pets"}
                    </div>
                    {property.pet_restrictions && (
                      <div className="text-xs text-muted-foreground">{property.pet_restrictions}</div>
                    )}
                    {property.pets_allowed !== false && (property.pet_deposit || property.pet_rent) && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {property.pet_deposit && <span>Deposit: ${property.pet_deposit}</span>}
                        {property.pet_deposit && property.pet_rent && <span> • </span>}
                        {property.pet_rent && <span>Rent: ${property.pet_rent}/mo</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fees */}
              {fees.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Fees</h4>
                    <div className="space-y-2">
                      {fees.map((fee) => (
                        <div key={fee.id} className="flex items-center justify-between rounded bg-muted/30 p-2 text-sm">
                          <span className="flex items-center gap-2">
                            <DollarSign className="h-3 w-3 text-muted-foreground"/>
                            {getFeeLabel(fee.fee_type_id)}
                          </span>
                          <span className="font-medium text-card-foreground">${fee.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((amenityId) => (
                        <Badge key={amenityId} variant="secondary" className="text-xs px-2 py-1 rounded-full">
                          {getAmenityLabel(amenityId)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {!property.amenities || property.amenities.length === 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Amenities</h4>
                    <div className="py-4 text-center text-sm text-muted-foreground rounded-lg bg-muted/50">
                      <CheckCircle2 className="mx-auto mb-2 h-6 w-6 opacity-50" />
                      <p>No amenities listed</p>
                    </div>
                  </div>
                </>
              )}


              {/* Special Features */}
              {(property.is_post_fire_rebuild || property.is_student_housing) && (
                <>
                  <Separator />
                  <div>
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Special Features</h4>
                    <div className="space-y-2">
                      {property.is_post_fire_rebuild && (
                        <div className="flex items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 p-2">
                          <Flame className="h-4 w-4 text-orange-500" />
                          <span className="text-sm text-orange-600">Post-2018 Camp Fire Rebuild</span>
                        </div>
                      )}
                      {property.is_student_housing && (
                        <div className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 p-2">
                          <GraduationCap className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-blue-600">Near CSUC / Student Area</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Legal Info - Refined */}
              <Separator />
              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Legal Information</h4>
                <div className="space-y-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Assessor Parcel Number (APN)</span>
                    <span className="font-mono text-card-foreground">{property.apn || "Not Listed"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Census Tract</span>
                    <span className="font-mono text-card-foreground">
                      {property.census_tract || "--"}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fmr" className="mt-4 animate-in fade-in-0 slide-in-from-right-2">
              <FMRCalculatorPanel
                bedrooms={property.bedrooms || 2}
                city={property.city}
                currentRent={property.current_rent}
                propertyType={property.property_type}
              />
              {fmrError && (
                 <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                   <p>Error calculating FMR: {fmrError}. Please try again later.</p>
                 </div>
              )}
            </TabsContent>

            {/* Units Tab */}
            <TabsContent value="units" className="mt-4 space-y-4 animate-in fade-in-0 slide-in-from-right-2">
              {units.length > 0 ? (
                <div className="space-y-2">
                  {units.map((unit) => (
                    <div key={unit.id} className="rounded-lg border border-border p-3 bg-card-foreground/5">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-card-foreground">Unit {unit.unit_number}</span>
                        <Badge
                          className={
                            unit.status === "available"
                              ? "bg-green-500 text-white"
                              : unit.status === "pending"
                                ? "bg-yellow-500 text-white"
                                : "bg-muted text-muted-foreground"
                          }
                        >
                          {unit.status}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{unit.bedrooms} BR</span>
                        <span>{unit.bathrooms} BA</span>
                        {unit.square_feet && <span>{unit.square_feet} sqft</span>}
                        {unit.rent && <span className="font-semibold text-primary">${unit.rent}/mo</span>}
                      </div>
                      {unit.available_date && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Available: {new Date(unit.available_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <Building2 className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>No unit details available</p>
                </div>
              )}
            </TabsContent>

            {/* Photos Tab */}
            <TabsContent value="photos" className="mt-4 space-y-4 animate-in fade-in-0 slide-in-from-right-2">
              {photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative overflow-hidden rounded-lg shadow-sm">
                      <img
                        src={photo.url || "/placeholder.svg"}
                        alt={photo.caption || "Property photo"}
                        className="h-32 w-full object-cover aspect-video"
                        loading="lazy"
                      />
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[10px] text-white truncate">
                          {photo.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <ImageIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>No photos available</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Watch Notification - Only for occupied properties */}
          {!property.is_available && (
            <>
              <Separator className="my-6" />
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-card-foreground">Get Notified When Available</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-background"
                  />
                  <Button onClick={handleWatch} disabled={isWatching || !email} size="sm">
                    {isWatching ? "Submitting..." : "Watch Property"}
                  </Button>
                </div>
                {watchSuccess && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-green-500">
                    <CheckCircle2 className="h-3 w-3" />
                    You&apos;ll be notified when this property becomes available!
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
