/**
 * Amenities Configuration
 * Config-driven checklist for property amenities
 */

export interface AmenityCategory {
  id: string
  label: string
  amenities: Amenity[]
}

export interface Amenity {
  id: string
  label: string
  icon?: string
}

export const AMENITY_CATEGORIES: AmenityCategory[] = [
  {
    id: "kitchen",
    label: "Kitchen",
    amenities: [
      { id: "refrigerator", label: "Refrigerator" },
      { id: "stove", label: "Stove / Range" },
      { id: "oven", label: "Oven" },
      { id: "microwave", label: "Microwave" },
      { id: "dishwasher", label: "Dishwasher" },
      { id: "garbage-disposal", label: "Garbage Disposal" },
    ],
  },
  {
    id: "laundry",
    label: "Laundry",
    amenities: [
      { id: "washer", label: "Washer (In-Unit)" },
      { id: "dryer", label: "Dryer (In-Unit)" },
      { id: "washer-dryer-hookups", label: "Washer/Dryer Hookups" },
      { id: "laundry-facility", label: "On-Site Laundry Facility" },
    ],
  },
  {
    id: "climate",
    label: "Climate Control",
    amenities: [
      { id: "central-ac", label: "Central Air Conditioning" },
      { id: "central-heat", label: "Central Heating" },
      { id: "window-ac", label: "Window AC Units" },
      { id: "ceiling-fans", label: "Ceiling Fans" },
      { id: "fireplace", label: "Fireplace" },
    ],
  },
  {
    id: "parking",
    label: "Parking",
    amenities: [
      { id: "garage", label: "Garage" },
      { id: "carport", label: "Carport" },
      { id: "covered-parking", label: "Covered Parking" },
      { id: "off-street-parking", label: "Off-Street Parking" },
      { id: "street-parking", label: "Street Parking Only" },
      { id: "ev-charging", label: "EV Charging Station" },
    ],
  },
  {
    id: "outdoor",
    label: "Outdoor",
    amenities: [
      { id: "private-yard", label: "Private Yard" },
      { id: "patio", label: "Patio / Deck" },
      { id: "balcony", label: "Balcony" },
      { id: "pool", label: "Swimming Pool" },
      { id: "hot-tub", label: "Hot Tub / Spa" },
      { id: "bbq-area", label: "BBQ / Grill Area" },
    ],
  },
  {
    id: "security",
    label: "Security",
    amenities: [
      { id: "gated-community", label: "Gated Community" },
      { id: "security-cameras", label: "Security Cameras" },
      { id: "alarm-system", label: "Alarm System" },
      { id: "doorman", label: "Doorman / Concierge" },
      { id: "controlled-access", label: "Controlled Access Entry" },
    ],
  },
  {
    id: "community",
    label: "Community",
    amenities: [
      { id: "fitness-center", label: "Fitness Center" },
      { id: "clubhouse", label: "Clubhouse" },
      { id: "business-center", label: "Business Center" },
      { id: "playground", label: "Playground" },
      { id: "dog-park", label: "Dog Park" },
      { id: "package-lockers", label: "Package Lockers" },
    ],
  },
  {
    id: "accessibility",
    label: "Accessibility",
    amenities: [
      { id: "wheelchair-accessible", label: "Wheelchair Accessible" },
      { id: "elevator", label: "Elevator" },
      { id: "ground-floor", label: "Ground Floor Available" },
      { id: "grab-bars", label: "Grab Bars" },
      { id: "roll-in-shower", label: "Roll-In Shower" },
    ],
  },
]

// Flat list of all amenity IDs for validation
export const ALL_AMENITY_IDS = AMENITY_CATEGORIES.flatMap((cat) => cat.amenities.map((a) => a.id))
