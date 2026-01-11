"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload, CheckCircle, AlertCircle, Loader2, Database, MapPin } from "lucide-react"
import { parseAPNs, getStats } from "@/data/apns"
import { importAPNsToDatabase } from "@/app/actions/import-apns"

export default function ImportPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stats, setStats] = useState<{
    total: number
    unique: number
    duplicates: number
  } | null>(null)
  const [results, setResults] = useState<{
    success: number
    failed: number
    skipped: number
    errors: string[]
  } | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    // Load APN stats on mount
    const apnStats = getStats()
    setStats(apnStats)
  }, [])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const handleImport = async () => {
    setIsProcessing(true)
    setProgress(0)
    setResults(null)
    setLogs([])

    try {
      addLog("Starting APN import...")
      const uniqueAPNs = parseAPNs()
      addLog(`Found ${uniqueAPNs.length} unique APNs to process`)

      // Process in batches
      const batchSize = 50
      const totalBatches = Math.ceil(uniqueAPNs.length / batchSize)
      let successCount = 0
      let failedCount = 0
      let skippedCount = 0
      const errors: string[] = []

      for (let i = 0; i < totalBatches; i++) {
        const batch = uniqueAPNs.slice(i * batchSize, (i + 1) * batchSize)
        addLog(`Processing batch ${i + 1}/${totalBatches} (${batch.length} APNs)...`)

        try {
          const result = await importAPNsToDatabase(batch)
          successCount += result.success
          failedCount += result.failed
          skippedCount += result.skipped
          if (result.errors.length > 0) {
            errors.push(...result.errors.slice(0, 5)) // Limit errors per batch
          }
        } catch (error) {
          addLog(`Batch ${i + 1} failed: ${error}`)
          failedCount += batch.length
        }

        setProgress(((i + 1) / totalBatches) * 100)
      }

      setResults({
        success: successCount,
        failed: failedCount,
        skipped: skippedCount,
        errors,
      })
      addLog(`Import complete! ${successCount} inserted, ${skippedCount} skipped, ${failedCount} failed`)
    } catch (error) {
      addLog(`Import failed: ${error}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">APN Import Tool</h1>
        <p className="text-muted-foreground">Import APNs from data/apns.ts into the properties database</p>
      </div>

      {/* Stats Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            APN File Statistics
          </CardTitle>
          <CardDescription>Data loaded from data/apns.ts</CardDescription>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold">{stats.total.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Lines</div>
              </div>
              <div className="text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.unique.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Unique APNs</div>
              </div>
              <div className="text-center p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.duplicates.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Duplicates</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Button */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import to Database
          </CardTitle>
          <CardDescription>This will enrich each APN with address data and insert into Supabase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleImport} disabled={isProcessing || !stats} className="w-full" size="lg">
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Import {stats?.unique.toLocaleString()} APNs
              </>
            )}
          </Button>

          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">{Math.round(progress)}% complete</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results.failed === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {results.success.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Inserted</div>
              </div>
              <div className="text-center p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {results.skipped.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Skipped (existing)</div>
              </div>
              <div className="text-center p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {results.failed.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>

            {results.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Errors</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2">
                    {results.errors.slice(0, 10).map((error, i) => (
                      <li key={i} className="text-sm">
                        {error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <Card>
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
  )
}
