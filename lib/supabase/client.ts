import { createBrowserClient } from "@supabase/ssr"

const globalForSupabase = globalThis as unknown as {
  supabaseClient: ReturnType<typeof createBrowserClient> | undefined
}

/**
 * Creates a single Supabase client instance and reuses it.
 * Uses globalThis singleton to prevent multiple GoTrueClient instances,
 * even across hot module reloads in development.
 */
export function createClient() {
  if (globalForSupabase.supabaseClient) {
    return globalForSupabase.supabaseClient
  }

  const client = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  globalForSupabase.supabaseClient = client

  return client
}

/**
 * Force clear the client (useful for testing or logout)
 */
export function resetClient() {
  globalForSupabase.supabaseClient = undefined
}
