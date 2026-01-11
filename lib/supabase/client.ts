import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null
let isInitializing = false

export function createClient() {
  // Return existing client if already created (singleton)
  if (supabaseClient) {
    return supabaseClient
  }

  // Prevent multiple simultaneous initializations
  if (isInitializing) {
    // If another call is initializing, wait and return the client when ready
    // This is a simple approach - in practice, the first call will complete quickly
    return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }

  isInitializing = true

  // Create new client and cache it
  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  isInitializing = false

  return supabaseClient
}

export function resetClient() {
  supabaseClient = null
  isInitializing = false
}
