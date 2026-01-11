import { FMRCalculator } from "@/components/fmr/fmr-calculator"

export const metadata = {
  title: "FMR Calculator | Butte County Rental Map",
  description: "Calculate Fair Market Rent with utility allowances for Butte County Section 8 housing",
}

export default function FMRCalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">FMR Calculator</h1>
          <p className="mt-2 text-muted-foreground">
            Calculate HUD Fair Market Rent with utility allowances for Butte County, CA
          </p>
        </div>
        <div className="flex justify-center">
          <FMRCalculator />
        </div>
      </div>
    </div>
  )
}
