/**
 * Fees Configuration
 * Common fee types for rental properties
 */

export interface FeeType {
  id: string
  label: string
  description?: string
  isOneTime: boolean // true = one-time, false = monthly
  typical_range?: { min: number; max: number }
}

export const FEE_TYPES: FeeType[] = [
  // One-time fees
  {
    id: "application-fee",
    label: "Application Fee",
    description: "Non-refundable fee to process rental application",
    isOneTime: true,
    typical_range: { min: 25, max: 75 },
  },
  {
    id: "security-deposit",
    label: "Security Deposit",
    description: "Refundable deposit held during tenancy",
    isOneTime: true,
    typical_range: { min: 500, max: 3000 },
  },
  {
    id: "first-month",
    label: "First Month Rent",
    description: "First month rent due at move-in",
    isOneTime: true,
  },
  {
    id: "last-month",
    label: "Last Month Rent",
    description: "Last month rent due at move-in",
    isOneTime: true,
  },
  {
    id: "move-in-fee",
    label: "Move-In Fee",
    description: "Non-refundable move-in fee",
    isOneTime: true,
    typical_range: { min: 100, max: 500 },
  },
  {
    id: "key-deposit",
    label: "Key Deposit",
    description: "Refundable deposit for keys/fobs",
    isOneTime: true,
    typical_range: { min: 25, max: 100 },
  },
  // Monthly fees
  {
    id: "pet-rent",
    label: "Pet Rent",
    description: "Monthly pet rent per pet",
    isOneTime: false,
    typical_range: { min: 25, max: 100 },
  },
  {
    id: "parking-fee",
    label: "Parking Fee",
    description: "Monthly parking space fee",
    isOneTime: false,
    typical_range: { min: 50, max: 200 },
  },
  {
    id: "storage-fee",
    label: "Storage Fee",
    description: "Monthly storage unit fee",
    isOneTime: false,
    typical_range: { min: 25, max: 150 },
  },
  {
    id: "trash-fee",
    label: "Trash / Valet Trash",
    description: "Monthly trash collection fee",
    isOneTime: false,
    typical_range: { min: 15, max: 50 },
  },
  {
    id: "water-sewer",
    label: "Water / Sewer",
    description: "Monthly water and sewer charge",
    isOneTime: false,
    typical_range: { min: 30, max: 100 },
  },
  {
    id: "cable-internet",
    label: "Cable / Internet",
    description: "Monthly cable or internet fee",
    isOneTime: false,
    typical_range: { min: 50, max: 150 },
  },
  {
    id: "renters-insurance",
    label: "Renters Insurance",
    description: "Required renters insurance",
    isOneTime: false,
    typical_range: { min: 10, max: 30 },
  },
]

// One-time vs monthly fee IDs
export const ONE_TIME_FEE_IDS = FEE_TYPES.filter((f) => f.isOneTime).map((f) => f.id)
export const MONTHLY_FEE_IDS = FEE_TYPES.filter((f) => !f.isOneTime).map((f) => f.id)
