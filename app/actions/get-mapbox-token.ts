"use server"

export async function getMapboxToken(): Promise<string> {
  return process.env.MAPBOX_TOKEN || "pk.eyJ1IjoiYWlycXVlbmdhIiwiYSI6ImNtazl4NThnNDA4MnMzY3B6azFmcm42NmMifQ.qzMfDM0K2Z-A7AgUJxFEJw"
}
