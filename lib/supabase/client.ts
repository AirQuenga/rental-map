import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return existing client if already created (singleton)
  if (supabaseClient) {
    return supabaseClient
  }

  // Create new client and cache it
  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return supabaseClient
}

export function resetClient() {
  supabaseClient = null
}
