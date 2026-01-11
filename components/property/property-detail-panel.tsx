"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Property } from "@/types/property"
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
  Droplets,
  CheckCircle2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface PropertyDetailPanelProps {
  property: Property
  onClose: () => void
}

const propertyTypeIcons: Record<string, typeof Home> = {
  "single-family": Home,
  apartment: Building2,
  duplex: Building2,
  condo: Building2,
  "multi-family": Building2,
}

export function PropertyDetailPanel({ property, onClose }: PropertyDetailPanelProps) {
  const [email, setEmail] = useState("")
  const [isWatching, setIsWatching] = useState(false)
  const [watchSuccess, setWatchSuccess] = useState(false)

  const Icon = propertyTypeIcons[property.property_type] || Home

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
      }
    } catch (err) {
      console.error("Error adding to watchlist:", err)
    } finally {
      setIsWatching(false)
    }
  }

  return (
    <div className="flex h-full w-96 flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="font-semibold text-card-foreground">Property Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Status & Price */}
        <div className="mb-4 flex items-center justify-between">
          <Badge
            className={
              property.is_available ? "bg-green-500 text-white hover:bg-green-600" : "bg-muted text-muted-foreground"
            }
          >
            {property.is_available ? "Available Now" : "Currently Occupied"}
          </Badge>
          {property.is_available && property.current_rent && (
            <div className="text-right">
              <span className="text-2xl font-bold text-green-500">${property.current_rent.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
          )}
        </div>

        {/* Address */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">{property.address}</h3>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {property.city}, CA {property.zip_code}
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Property Details */}
        <div className="mb-4">
          <h4 className="mb-3 text-sm font-semibold text-card-foreground">Property Details</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{property.bedrooms || "—"}</div>
                <div className="text-xs text-muted-foreground">Bedrooms</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
              <Bath className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{property.bathrooms || "—"}</div>
                <div className="text-xs text-muted-foreground">Bathrooms</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
              <Square className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{property.square_feet?.toLocaleString() || "—"}</div>
                <div className="text-xs text-muted-foreground">Sq Ft</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{property.year_built || "—"}</div>
                <div className="text-xs text-muted-foreground">Year Built</div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Management Info */}
        <div className="mb-4">
          <h4 className="mb-3 text-sm font-semibold text-card-foreground">Management</h4>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium capitalize">
                {property.management_type === "professional"
                  ? property.management_company || "Professional Management"
                  : "Private Landlord"}
              </div>
              <div className="text-xs text-muted-foreground">
                {property.management_type === "professional" ? "Professionally Managed" : "Owner-Managed Property"}
              </div>
            </div>
          </div>
        </div>

        {/* Special Features */}
        {(property.is_post_fire_rebuild || property.is_student_housing || property.utility_type !== "city") && (
          <>
            <Separator className="my-4" />
            <div className="mb-4">
              <h4 className="mb-3 text-sm font-semibold text-card-foreground">Special Features</h4>
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
                {property.utility_type !== "city" && (
                  <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-2">
                    <Droplets className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm capitalize text-yellow-700">{property.utility_type} System</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <Separator className="my-4" />

        {/* APN Info */}
        <div className="mb-4 rounded-lg bg-muted/50 p-3">
          <div className="text-xs text-muted-foreground">Assessor Parcel Number (APN)</div>
          <div className="font-mono text-sm font-medium text-card-foreground">{property.apn}</div>
        </div>

        {/* Watch List */}
        {!property.is_available && (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-card-foreground">
              <Bell className="h-4 w-4" />
              Get Notified
            </h4>
            <p className="mb-3 text-xs text-muted-foreground">
              Enter your email to be notified when this property becomes available.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleWatch} disabled={!email || isWatching} size="sm">
                {watchSuccess ? (
                  <>
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Added
                  </>
                ) : (
                  "Watch"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
