import { RentalAtlas } from "@/components/rental-atlas"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = await createClient()

  const { data: properties, error } = await supabase
    .from("properties")
    .select("*")
    .order("is_available", { ascending: false })
    .order("city", { ascending: true })

  if (error) {
    console.error("Error fetching properties:", error)
  }

  return <RentalAtlas initialProperties={properties || []} />
}
