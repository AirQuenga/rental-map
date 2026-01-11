/**
 * Default FMR Configuration
 *
 * This module provides safe default values for FMR calculations
 * when property utility configuration is missing or incomplete.
 */

import type { UtilityConfiguration } from "@/lib/fmr"

export const DEFAULT_UTILITY_CONFIG: UtilityConfiguration = {
  heating: { type: "natural-gas", tenantPays: true },
  cooking: { type: "electric", tenantPays: true },
  airConditioning: { type: "refrigerated", tenantPays: true },
  waterHeater: { type: "natural-gas", tenantPays: true },
  waterSewer: "not-included",
  trash: "included",
  refrigeratorProvided: true,
  rangeProvided: true,
}

export const EMPTY_FMR_RESULT = {
  baseFMR: 0,
  utilityAllowance: 0,
  utilityBreakdown: {
    heating: 0,
    cooking: 0,
    airConditioning: 0,
    waterHeater: 0,
    waterSewer: 0,
    trash: 0,
    refrigerator: 0,
    range: 0,
  },
  adjustedFMR: 0,
  maxAllowableRent: 0,
  overrideApplied: false,
}
