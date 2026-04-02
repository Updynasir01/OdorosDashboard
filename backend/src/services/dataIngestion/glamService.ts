import axios from 'axios'
import { GeoJsonFeature } from './harvestPortalService'

const GLAM_API_BASE = 'https://api.glamdata.org'

export type GlamProductId =
  | 'chirps-precip'
  | 'mod09q1-ndvi'
  | 'mod13q1-ndvi'
  | 'viirs-ndvi-8day'
  | 'copernicus-swi'
  | 'servir-4wk-esi'

interface GlamBoundaryFeature {
  feature_id: number
  feature_name: string
}

function toRegionName(value: unknown): string {
  return String(value || '').trim().toLowerCase()
}

function pickRegionName(properties: Record<string, unknown>): string {
  return (
    String(
      properties.name ||
        properties.NAME_1 ||
        properties.admin1Name_en ||
        properties.shapeName ||
        properties.region ||
        properties.Region ||
        ''
    ).trim() || 'unknown'
  )
}

function extractNumericValue(payload: any): number | null {
  if (typeof payload === 'number' && Number.isFinite(payload)) return payload
  if (!payload || typeof payload !== 'object') return null

  const directCandidates = [
    payload.value,
    payload.mean,
    payload.avg,
    payload.average,
    payload.median,
    payload.stat,
    payload.data,
  ]
  for (const candidate of directCandidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) return candidate
  }

  if (Array.isArray(payload.results) && payload.results.length > 0) {
    for (const item of payload.results) {
      const v = extractNumericValue(item)
      if (v !== null) return v
    }
  }

  if (Array.isArray(payload.features) && payload.features.length > 0) {
    for (const f of payload.features) {
      const v = extractNumericValue(f?.properties || f)
      if (v !== null) return v
    }
  }

  return null
}

export async function getGlamAdm1FeatureMap(): Promise<Map<string, number>> {
  const response = await axios.get<GlamBoundaryFeature[]>(`${GLAM_API_BASE}/boundary-features/geoboundaries-som-adm1/`, {
    timeout: 30000,
  })

  const map = new Map<string, number>()
  for (const item of response.data || []) {
    map.set(toRegionName(item.feature_name), item.feature_id)
  }
  return map
}

export async function queryGlamValueByGeometry(
  productId: GlamProductId,
  date: string,
  geometry: GeoJsonFeature['geometry']
): Promise<number | null> {
  try {
    const response = await axios.post(
      `${GLAM_API_BASE}/query/`,
      {
        product_id: productId,
        date,
        cropmask: 'no-mask',
        geom: geometry,
      },
      {
        timeout: 45000,
        headers: { 'Content-Type': 'application/json' },
      }
    )

    return extractNumericValue(response.data)
  } catch (error: any) {
    console.warn(`GLAM query failed for ${productId}:`, error?.message || error)
    return null
  }
}

/**
 * Matches feature names from boundary GeoJSON with GLAM ADM1 names.
 */
export function mapRegionFeaturesToGlamFeatureIds(
  features: GeoJsonFeature[],
  glamFeatureIdMap: Map<string, number>
): Array<{ regionName: string; glamFeatureId: number; geometry: GeoJsonFeature['geometry'] }> {
  const results: Array<{ regionName: string; glamFeatureId: number; geometry: GeoJsonFeature['geometry'] }> = []

  for (const feature of features) {
    const regionName = pickRegionName(feature.properties || {})
    const glamFeatureId = glamFeatureIdMap.get(toRegionName(regionName))
    if (!glamFeatureId) continue
    results.push({ regionName, glamFeatureId, geometry: feature.geometry })
  }

  return results
}

