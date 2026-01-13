import { createBrowserClient } from "@supabase/ssr"

const globalStore = globalThis as unknown as {
  __supabase_client__?: ReturnType<typeof createBrowserClient>
}

/**
 * Creates a single Supabase client instance and reuses it.
 * Uses globalThis to prevent multiple GoTrueClient instances,
 * even across hot module reloads in development.
 */
export function createClient() {
  // Check if we already have a client
  if (globalStore.__supabase_client__) {
    return globalStore.__supabase_client__
  }

  // Create new client
  const client = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  // Store globally
  globalStore.__supabase_client__ = client

  return client
}

/**
 * Force clear the client (useful for testing or logout)
 */
export function resetClient() {
  globalStore.__supabase_client__ = undefined
}
