/** Representative points (lat, lon) per gobol for NASA POWER point queries. */

export const SOMALIA_REGION_CENTROIDS: Record<string, { lat: number; lon: number }> = {
  awdal: { lat: 10.5, lon: 43.5 },
  banadir: { lat: 2.0469, lon: 45.3182 },
  bay: { lat: 2.75, lon: 43.5 },
  bakool: { lat: 4.0, lon: 44.0 },
  hiiraan: { lat: 4.5, lon: 45.5 },
  'middle-jubba': { lat: 0.5, lon: 42.5 },
  'lower-jubba': { lat: -0.5, lon: 42.0 },
  gedo: { lat: 3.5, lon: 42.0 },
  'middle-shebelle': { lat: 2.5, lon: 44.5 },
  'lower-shebelle': { lat: 1.5, lon: 44.0 },
  galgaduud: { lat: 5.0, lon: 46.5 },
  mudug: { lat: 6.5, lon: 48.0 },
  nugaal: { lat: 8.0, lon: 49.0 },
  bari: { lat: 11.0, lon: 50.0 },
  sanaag: { lat: 10.0, lon: 47.5 },
  sool: { lat: 8.5, lon: 47.0 },
  togdheer: { lat: 9.5, lon: 45.5 },
  'woqooyi-galbeed': { lat: 9.0, lon: 44.0 },
}

export function getSomaliaCentroidForIndicators(regionId?: string | null): { lat: number; lon: number } {
  const id = regionId?.trim()
  if (!id || id === 'all') {
    const vals = Object.values(SOMALIA_REGION_CENTROIDS)
    const lat = vals.reduce((s, v) => s + v.lat, 0) / vals.length
    const lon = vals.reduce((s, v) => s + v.lon, 0) / vals.length
    return { lat, lon }
  }
  const c = SOMALIA_REGION_CENTROIDS[id]
  if (c) return { ...c }
  return getSomaliaCentroidForIndicators(null)
}
