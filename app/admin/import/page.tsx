"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  MapPin,
  Home,
  Plus,
  ArrowLeft,
  Globe,
  Search,
} from "lucide-react"
import { parseAPNs, getStats } from "@/data/apns"
import { parseAddresses, getAddressStats } from "@/data/addresses"
import { importAPNsToDatabase } from "@/app/actions/import-apns"
import { importAddressesToDatabase } from "@/app/actions/import-addresses"
import { scrapeRentalListings, importScrapedProperties } from "@/app/actions/scrape-rentals"
import { ManualEntryForm } from "@/components/admin/manual-entry-form"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"

const SOURCES = [
  // Internal Databases (1)
  {
    id: "known",
    name: "Known Butte County Properties",
    category: "database",
    status: "active",
    description: "Local database of verified apartment complexes",
    estimatedListings: 30,
  },

  // Local Butte County Sites (8)
  {
    id: "chicoForRent",
    name: "ChicoForRent.com",
    category: "local",
    status: "blocked",
    description: "Chico-specific rental listings",
    estimatedListings: 150,
  },
  {
    id: "rentInChico",
    name: "RentInChico.com",
    category: "local",
    status: "blocked",
    description: "Local Chico rental properties",
    estimatedListings: 120,
  },
  {
    id: "csusChico",
    name: "CSU Chico Off-Campus Housing",
    category: "local",
    status: "blocked",
    description: "Student housing near campus",
    estimatedListings: 200,
  },
  {
    id: "chicoNewsReview",
    name: "Chico News & Review Classifieds",
    category: "local",
    status: "blocked",
    description: "Local classifieds section",
    estimatedListings: 50,
  },
  {
    id: "butteCountyHousing",
    name: "Butte County Housing Authority",
    category: "local",
    status: "api-only",
    description: "Affordable housing listings",
    estimatedListings: 75,
  },
  {
    id: "paradisePost",
    name: "Paradise Post Classifieds",
    category: "local",
    status: "blocked",
    description: "Paradise area rentals",
    estimatedListings: 40,
  },
  {
    id: "orovilleMR",
    name: "Oroville Mercury-Register",
    category: "local",
    status: "blocked",
    description: "Oroville local listings",
    estimatedListings: 35,
  },
  {
    id: "butteCountyBulletin",
    name: "Butte County Bulletin Board",
    category: "local",
    status: "blocked",
    description: "Community bulletin rentals",
    estimatedListings: 25,
  },

  // National Rental Sites (26)
  {
    id: "zillow",
    name: "Zillow Rentals",
    category: "national",
    status: "blocked",
    description: "Comprehensive rental listings",
    estimatedListings: 500,
  },
  {
    id: "realtor",
    name: "Realtor.com Rentals",
    category: "national",
    status: "blocked",
    description: "MLS-powered rentals",
    estimatedListings: 450,
  },
  {
    id: "apartments",
    name: "Apartments.com",
    category: "national",
    status: "blocked",
    description: "Apartments & homes",
    estimatedListings: 400,
  },
  {
    id: "trulia",
    name: "Trulia Rentals",
    category: "national",
    status: "blocked",
    description: "Houses & apartments",
    estimatedListings: 450,
  },
  {
    id: "hotpads",
    name: "HotPads",
    category: "national",
    status: "blocked",
    description: "Map-based rental search",
    estimatedListings: 350,
  },
  {
    id: "rent",
    name: "Rent.com",
    category: "national",
    status: "blocked",
    description: "National rental search",
    estimatedListings: 380,
  },
  {
    id: "rentals",
    name: "Rentals.com",
    category: "national",
    status: "blocked",
    description: "Houses & apartments",
    estimatedListings: 320,
  },
  {
    id: "apartmentFinder",
    name: "Apartment Finder",
    category: "national",
    status: "blocked",
    description: "Apartment search engine",
    estimatedListings: 340,
  },
  {
    id: "apartmentGuide",
    name: "Apartment Guide",
    category: "national",
    status: "blocked",
    description: "Apartment listings",
    estimatedListings: 330,
  },
  {
    id: "apartmentList",
    name: "Apartment List",
    category: "national",
    status: "blocked",
    description: "Personalized search",
    estimatedListings: 360,
  },
  {
    id: "zumper",
    name: "Zumper",
    category: "national",
    status: "blocked",
    description: "Apartment rentals",
    estimatedListings: 310,
  },
  {
    id: "rentCafe",
    name: "RENTCafé",
    category: "national",
    status: "api-only",
    description: "Property management listings",
    estimatedListings: 280,
  },
  {
    id: "forRent",
    name: "ForRent.com",
    category: "national",
    status: "blocked",
    description: "Apartments & houses",
    estimatedListings: 290,
  },
  {
    id: "move",
    name: "Move.com",
    category: "national",
    status: "blocked",
    description: "Rental search platform",
    estimatedListings: 270,
  },
  {
    id: "padmapper",
    name: "PadMapper",
    category: "national",
    status: "blocked",
    description: "Map-based search",
    estimatedListings: 300,
  },
  {
    id: "rentberry",
    name: "Rentberry",
    category: "national",
    status: "blocked",
    description: "Online rental platform",
    estimatedListings: 240,
  },
  {
    id: "cozy",
    name: "Cozy.co",
    category: "national",
    status: "api-only",
    description: "Landlord-tenant platform",
    estimatedListings: 220,
  },
  {
    id: "avail",
    name: "Avail",
    category: "national",
    status: "api-only",
    description: "DIY landlord software",
    estimatedListings: 200,
  },
  {
    id: "rentalHousingDeals",
    name: "Rental Housing Deals",
    category: "national",
    status: "blocked",
    description: "Rental listings",
    estimatedListings: 180,
  },
  {
    id: "rentler",
    name: "Rentler",
    category: "national",
    status: "blocked",
    description: "Western US rentals",
    estimatedListings: 210,
  },
  {
    id: "doorsteps",
    name: "Doorsteps",
    category: "national",
    status: "blocked",
    description: "Move.com network",
    estimatedListings: 190,
  },
  {
    id: "myNewPlace",
    name: "MyNewPlace",
    category: "national",
    status: "blocked",
    description: "Apartment search",
    estimatedListings: 170,
  },
  {
    id: "rentPath",
    name: "RentPath",
    category: "national",
    status: "api-only",
    description: "Multi-site network",
    estimatedListings: 400,
  },
  {
    id: "realPage",
    name: "RealPage",
    category: "national",
    status: "api-only",
    description: "Property management",
    estimatedListings: 350,
  },
  {
    id: "yardi",
    name: "Yardi RentCafe",
    category: "national",
    status: "api-only",
    description: "Property software",
    estimatedListings: 320,
  },
  {
    id: "appFolio",
    name: "AppFolio",
    category: "national",
    status: "api-only",
    description: "Property management",
    estimatedListings: 280,
  },

  // Classifieds & Marketplaces (15)
  {
    id: "craigslist",
    name: "Craigslist Chico",
    category: "classifieds",
    status: "blocked",
    description: "Local classifieds",
    estimatedListings: 300,
  },
  {
    id: "facebook",
    name: "Facebook Marketplace",
    category: "classifieds",
    status: "blocked",
    description: "Social marketplace",
    estimatedListings: 450,
  },
  {
    id: "nextdoor",
    name: "Nextdoor",
    category: "classifieds",
    status: "blocked",
    description: "Neighborhood network",
    estimatedListings: 120,
  },
  {
    id: "oodle",
    name: "Oodle",
    category: "classifieds",
    status: "blocked",
    description: "Classified ads aggregator",
    estimatedListings: 200,
  },
  {
    id: "trovit",
    name: "Trovit",
    category: "classifieds",
    status: "blocked",
    description: "Search aggregator",
    estimatedListings: 180,
  },
  {
    id: "nestoria",
    name: "Nestoria",
    category: "classifieds",
    status: "blocked",
    description: "Property search engine",
    estimatedListings: 160,
  },
  {
    id: "vast",
    name: "Vast.com",
    category: "classifieds",
    status: "blocked",
    description: "Classified ads",
    estimatedListings: 140,
  },
  {
    id: "adsglobe",
    name: "AdsGlobe",
    category: "classifieds",
    status: "blocked",
    description: "Free classifieds",
    estimatedListings: 100,
  },
  {
    id: "classifiedAds",
    name: "Classified Ads",
    category: "classifieds",
    status: "blocked",
    description: "General classifieds",
    estimatedListings: 130,
  },
  {
    id: "geebo",
    name: "Geebo",
    category: "classifieds",
    status: "blocked",
    description: "Safe local classifieds",
    estimatedListings: 90,
  },
  {
    id: "recycler",
    name: "Recycler",
    category: "classifieds",
    status: "blocked",
    description: "Online classifieds",
    estimatedListings: 110,
  },
  {
    id: "pennysaver",
    name: "PennySaver",
    category: "classifieds",
    status: "blocked",
    description: "Local shopping guide",
    estimatedListings: 80,
  },
  {
    id: "locanto",
    name: "Locanto",
    category: "classifieds",
    status: "blocked",
    description: "Free classifieds",
    estimatedListings: 95,
  },
  {
    id: "backpage",
    name: "Backpage Alternatives",
    category: "classifieds",
    status: "blocked",
    description: "Classified alternatives",
    estimatedListings: 70,
  },
  {
    id: "offerup",
    name: "OfferUp",
    category: "classifieds",
    status: "blocked",
    description: "Buy and sell locally",
    estimatedListings: 150,
  },
] as const

type SourceStatus = "active" | "blocked" | "api-only"
type SourceCategory = "database" | "local" | "national" | "classifieds"

export default function ImportPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentBatch, setCurrentBatch] = useState(0)
  const [totalBatches, setTotalBatches] = useState(0)
  const [apnStats, setApnStats] = useState<{ total: number; unique: number; duplicates: number } | null>(null)
  const [addressStats, setAddressStats] = useState<{ total: number; unique: number; duplicates: number } | null>(null)
  const [results, setResults] = useState<{ success: number; failed: number; skipped: number; errors: string[] } | null>(
    null,
  )
  const [logs, setLogs] = useState<string[]>([])

  const [scrapeSources, setScrapeSources] = useState<string[]>(["known"])
  const [scrapeResults, setScrapeResults] = useState<{ properties: any[]; errors: string[] } | null>(null)
  const [isScraping, setIsScraping] = useState(false)
  const [scrapePhase, setScrapePhase] = useState<"idle" | "scraping" | "importing">("idle")
  const [sourceFilter, setSourceFilter] = useState<"all" | "active" | "blocked" | "api-only">("all")

  useEffect(() => {
    try {
      setApnStats(getStats())
    } catch (e) {
      console.error("Failed to load APN stats:", e)
    }
    try {
      setAddressStats(getAddressStats())
    } catch (e) {
      console.error("Failed to load address stats:", e)
    }
  }, [])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const runImport = async (
    type: "apn" | "address",
    items: string[] | ReturnType<typeof parseAddresses>,
    importFn: (batch: any[]) => Promise<{ success: number; failed: number; skipped: number; errors: string[] }>,
  ) => {
    setIsProcessing(true)
    setProgress(0)
    setResults(null)
    setLogs([])

    try {
      addLog(`Starting ${type} import...`)
      addLog(`Found ${items.length} unique ${type}s to process`)

      const batchSize = 25
      const batches = Math.ceil(items.length / batchSize)
      setTotalBatches(batches)

      let successCount = 0
      let failedCount = 0
      let skippedCount = 0
      const errors: string[] = []

      for (let i = 0; i < batches; i++) {
        setCurrentBatch(i + 1)
        const batch = items.slice(i * batchSize, (i + 1) * batchSize)
        addLog(`Processing batch ${i + 1}/${batches} (${batch.length} ${type}s)...`)

        try {
          const result = await importFn(batch as any)
          successCount += result.success
          failedCount += result.failed
          skippedCount += result.skipped
          if (result.errors.length > 0) {
            const remainingSlots = 200 - errors.length
            if (remainingSlots > 0) errors.push(...result.errors.slice(0, remainingSlots))
          }
          addLog(`Batch ${i + 1}: ${result.success} success, ${result.skipped} skipped, ${result.failed} failed`)
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Unknown error"
          addLog(`Batch ${i + 1} failed: ${errMsg.slice(0, 100)}`)
          failedCount += batch.length
          if (errors.length < 200) errors.push(`Batch ${i + 1}: ${errMsg.slice(0, 80)}`)
        }
        setProgress(((i + 1) / batches) * 100)
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      setResults({ success: successCount, failed: failedCount, skipped: skippedCount, errors })
      addLog(`Import complete! ${successCount} inserted, ${skippedCount} skipped, ${failedCount} failed`)
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown error"
      addLog(`Import failed: ${errMsg}`)
    } finally {
      setIsProcessing(false)
      setCurrentBatch(0)
      setTotalBatches(0)
    }
  }

  const handleAPNImport = () => runImport("apn", parseAPNs(), importAPNsToDatabase)
  const handleAddressImport = () => runImport("address", parseAddresses(), importAddressesToDatabase)

  const handleScrape = async () => {
    setIsScraping(true)
    setScrapePhase("scraping")
    setLogs([])
    setScrapeResults(null)
    setResults(null)

    try {
      addLog("Starting web scrape...")
      addLog(`Sources: ${scrapeSources.join(", ")}`)
      const result = await scrapeRentalListings(scrapeSources)
      addLog(`Scrape complete! Found ${result.properties.length} properties`)
      if (result.errors.length > 0) result.errors.forEach((err) => addLog(`Error: ${err}`))
      setScrapeResults({ properties: result.properties, errors: result.errors })
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown error"
      addLog(`Scrape failed: ${errMsg}`)
    } finally {
      setIsScraping(false)
      setScrapePhase("idle")
    }
  }

  const handleImportScraped = async () => {
    if (!scrapeResults?.properties.length) return
    setIsProcessing(true)
    setScrapePhase("importing")
    setProgress(0)

    try {
      addLog(`Importing ${scrapeResults.properties.length} scraped properties...`)
      const batchSize = 10
      const batches = Math.ceil(scrapeResults.properties.length / batchSize)
      setTotalBatches(batches)

      let successCount = 0
      let failedCount = 0
      let skippedCount = 0
      const errors: string[] = []

      for (let i = 0; i < batches; i++) {
        setCurrentBatch(i + 1)
        const batch = scrapeResults.properties.slice(i * batchSize, (i + 1) * batchSize)
        addLog(`Importing batch ${i + 1}/${batches}...`)

        try {
          const result = await importScrapedProperties(batch)
          successCount += result.success
          failedCount += result.failed
          skippedCount += result.skipped
          if (result.errors.length > 0) errors.push(...result.errors.slice(0, 50))
          addLog(`Batch ${i + 1}: ${result.success} success, ${result.skipped} skipped, ${result.failed} failed`)
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Unknown error"
          addLog(`Batch ${i + 1} failed: ${errMsg.slice(0, 100)}`)
          failedCount += batch.length
        }
        setProgress(((i + 1) / batches) * 100)
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      setResults({ success: successCount, failed: failedCount, skipped: skippedCount, errors })
      addLog(`Import complete! ${successCount} inserted, ${skippedCount} skipped, ${failedCount} failed`)
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown error"
      addLog(`Import failed: ${errMsg}`)
    } finally {
      setIsProcessing(false)
      setScrapePhase("idle")
      setCurrentBatch(0)
      setTotalBatches(0)
    }
  }

  const toggleSource = (id: string) => {
    setScrapeSources((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const filteredSources = SOURCES.filter((s) => sourceFilter === "all" || s.status === sourceFilter)
  const databaseSources = filteredSources.filter((s) => s.category === "database")
  const localSources = filteredSources.filter((s) => s.category === "local")
  const nationalSources = filteredSources.filter((s) => s.category === "national")
  const classifiedSources = filteredSources.filter((s) => s.category === "classifieds")

  const statusColors: Record<SourceStatus, string> = {
    active: "bg-green-500",
    blocked: "bg-red-500",
    "api-only": "bg-yellow-500",
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <SiteHeader />

      <section className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
            <Link href="/" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              <Home className="h-4 w-4" />
            </Link>
            <span>/</span>
            <Link href="/admin" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              Admin
            </Link>
            <span>/</span>
            <span>Import</span>
          </div>

          {/* Back button and title */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">Property Data Import</h1>
          </div>

          <Tabs defaultValue="scrape" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Manual Entry
              </TabsTrigger>
              <TabsTrigger value="scrape" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Web Scrape
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Addresses ({addressStats?.unique || 0})
              </TabsTrigger>
              <TabsTrigger value="apns" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                APNs ({apnStats?.unique || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-6">
              <ManualEntryForm />
            </TabsContent>

            <TabsContent value="scrape" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Web Scrape Rental Listings ({SOURCES.length} Sources)
                  </CardTitle>
                  <CardDescription>Select sources to scrape. Most major sites block automation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Filter Buttons */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <Label className="text-base font-semibold">
                      Showing {filteredSources.length} of {SOURCES.length} Sources
                    </Label>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant={sourceFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSourceFilter("all")}
                      >
                        All ({SOURCES.length})
                      </Button>
                      <Button
                        variant={sourceFilter === "active" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSourceFilter("active")}
                      >
                        Active ({SOURCES.filter((s) => s.status === "active").length})
                      </Button>
                      <Button
                        variant={sourceFilter === "blocked" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSourceFilter("blocked")}
                      >
                        Blocked ({SOURCES.filter((s) => s.status === "blocked").length})
                      </Button>
                      <Button
                        variant={sourceFilter === "api-only" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSourceFilter("api-only")}
                      >
                        API Only ({SOURCES.filter((s) => s.status === "api-only").length})
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setScrapeSources(SOURCES.filter((s) => s.status === "active").map((s) => s.id))}
                    >
                      Select Active Only
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setScrapeSources([])}>
                      Clear All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setScrapeSources(filteredSources.map((s) => s.id))}
                    >
                      Select All Filtered
                    </Button>
                  </div>

                  {/* Sources List */}
                  <ScrollArea className="h-[500px] border rounded-lg p-4">
                    <div className="space-y-6">
                      {/* Internal Databases */}
                      {databaseSources.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2 text-lg">
                            <Database className="h-4 w-4" />
                            Internal Databases ({databaseSources.length})
                          </h3>
                          <div className="space-y-2 ml-2">
                            {databaseSources.map((source) => (
                              <div
                                key={source.id}
                                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                              >
                                <Checkbox
                                  checked={scrapeSources.includes(source.id)}
                                  onCheckedChange={() => toggleSource(source.id)}
                                />
                                <div
                                  className={`h-3 w-3 rounded-full ${statusColors[source.status]}`}
                                  title={source.status}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{source.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {source.estimatedListings} listings
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{source.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Local Sites */}
                      {localSources.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2 text-lg">
                            <MapPin className="h-4 w-4" />
                            Local Butte County Sites ({localSources.length})
                          </h3>
                          <div className="space-y-2 ml-2">
                            {localSources.map((source) => (
                              <div
                                key={source.id}
                                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                              >
                                <Checkbox
                                  checked={scrapeSources.includes(source.id)}
                                  onCheckedChange={() => toggleSource(source.id)}
                                />
                                <div
                                  className={`h-3 w-3 rounded-full ${statusColors[source.status]}`}
                                  title={source.status}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{source.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {source.estimatedListings} listings
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{source.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* National Sites */}
                      {nationalSources.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2 text-lg">
                            <Globe className="h-4 w-4" />
                            National Rental Sites ({nationalSources.length})
                          </h3>
                          <div className="space-y-2 ml-2">
                            {nationalSources.map((source) => (
                              <div
                                key={source.id}
                                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                              >
                                <Checkbox
                                  checked={scrapeSources.includes(source.id)}
                                  onCheckedChange={() => toggleSource(source.id)}
                                />
                                <div
                                  className={`h-3 w-3 rounded-full ${statusColors[source.status]}`}
                                  title={source.status}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{source.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {source.estimatedListings} listings
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{source.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Classifieds */}
                      {classifiedSources.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2 text-lg">
                            <Search className="h-4 w-4" />
                            Classifieds & Marketplaces ({classifiedSources.length})
                          </h3>
                          <div className="space-y-2 ml-2">
                            {classifiedSources.map((source) => (
                              <div
                                key={source.id}
                                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                              >
                                <Checkbox
                                  checked={scrapeSources.includes(source.id)}
                                  onCheckedChange={() => toggleSource(source.id)}
                                />
                                <div
                                  className={`h-3 w-3 rounded-full ${statusColors[source.status]}`}
                                  title={source.status}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{source.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {source.estimatedListings} listings
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{source.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Selected Count and Scrape Button */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-muted-foreground">{scrapeSources.length} source(s) selected</span>
                    <div className="flex gap-2">
                      {scrapeResults && scrapeResults.properties.length > 0 && (
                        <Button onClick={handleImportScraped} disabled={isProcessing}>
                          {isProcessing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Import {scrapeResults.properties.length} Properties
                        </Button>
                      )}
                      <Button onClick={handleScrape} disabled={isScraping || scrapeSources.length === 0}>
                        {isScraping ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Globe className="h-4 w-4 mr-2" />
                        )}
                        Start Scraping {scrapeSources.length} Source(s)
                      </Button>
                    </div>
                  </div>

                  {/* Progress */}
                  {(isScraping || (isProcessing && scrapePhase === "importing")) && (
                    <div className="space-y-2">
                      <Progress value={progress} />
                      <p className="text-sm text-muted-foreground text-center">
                        {scrapePhase === "scraping"
                          ? "Scraping..."
                          : `Importing batch ${currentBatch} of ${totalBatches}...`}
                      </p>
                    </div>
                  )}

                  {/* Scrape Results Preview */}
                  {scrapeResults && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Scrape Complete</AlertTitle>
                      <AlertDescription>
                        Found {scrapeResults.properties.length} properties.
                        {scrapeResults.errors.length > 0 && ` ${scrapeResults.errors.length} errors occurred.`}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Import Addresses
                  </CardTitle>
                  <CardDescription>Import property addresses from the local database.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {addressStats && (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold">{addressStats.total}</div>
                        <div className="text-sm text-muted-foreground">Total</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold">{addressStats.unique}</div>
                        <div className="text-sm text-muted-foreground">Unique</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="text-2xl font-bold">{addressStats.duplicates}</div>
                        <div className="text-sm text-muted-foreground">Duplicates</div>
                      </div>
                    </div>
                  )}
                  <Button onClick={handleAddressImport} disabled={isProcessing} className="w-full">
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Import {addressStats?.unique || 0} Addresses
                  </Button>
                  {isProcessing && (
                    <div className="space-y-2">
                      <Progress value={progress} />
                      <p className="text-sm text-muted-foreground text-center">
                        Processing batch {currentBatch} of {totalBatches}...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="apns" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Import APNs
                  </CardTitle>
                  <CardDescription>Import Assessor Parcel Numbers from the local database.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {apnStats && (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold">{apnStats.total.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Total</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold">{apnStats.unique.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Unique</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="text-2xl font-bold">{apnStats.duplicates.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Duplicates</div>
                      </div>
                    </div>
                  )}
                  <Button onClick={handleAPNImport} disabled={isProcessing} className="w-full">
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Import {apnStats?.unique.toLocaleString() || 0} APNs
                  </Button>
                  {isProcessing && (
                    <div className="space-y-2">
                      <Progress value={progress} />
                      <p className="text-sm text-muted-foreground text-center">
                        Processing batch {currentBatch} of {totalBatches}...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Results */}
          {results && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {results.failed === 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  Import Results Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {results.success.toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-green-700 dark:text-green-300">Inserted</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {results.skipped.toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Skipped</div>
                  </div>
                  <div className="text-center p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {results.failed.toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-red-700 dark:text-red-300">Failed</div>
                  </div>
                </div>
                {results.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>
                      Errors ({results.errors.length}
                      {results.errors.length >= 200 ? "+" : ""})
                    </AlertTitle>
                    <AlertDescription>
                      <ScrollArea className="h-48 mt-2">
                        <ul className="list-none space-y-1">
                          {results.errors.map((error, i) => (
                            <li
                              key={i}
                              className="text-xs font-mono py-1 border-b border-red-200 dark:border-red-800 last:border-0"
                            >
                              {error}
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Logs */}
          {logs.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Import Log</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48 rounded border p-4">
                  <div className="font-mono text-sm space-y-1">
                    {logs.map((log, i) => (
                      <div key={i} className="text-muted-foreground">
                        {log}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
