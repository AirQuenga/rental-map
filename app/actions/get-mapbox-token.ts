"use server"

export async function getMapboxToken(): Promise<string> {
  return process.env.MAPBOX_TOKEN || ""
}
