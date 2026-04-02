import axios from 'axios'

const HARVEST_PORTAL_BASE = 'https://data.harvestportal.org/api/action'
const SOMALIA_ADM1_RESOURCE_ID = '559cbd46-5919-4ded-bd0e-e12f071e193e'

export interface GeoJsonFeature {
  type: 'Feature'
  geometry: {
    type: string
    coordinates: unknown
  }
  properties: Record<string, unknown>
}

interface ResourceShowResponse {
  success: boolean
  result?: {
    id: string
    format?: string
    url?: string
    name?: string
  }
}

function getAuthHeaders() {
  const key = process.env.HARVEST_PORTAL_API_KEY
  return key ? { Authorization: key } : {}
}

async function getResourceDownloadUrl(resourceId: string): Promise<string | null> {
  const response = await axios.get<ResourceShowResponse>(`${HARVEST_PORTAL_BASE}/resource_show`, {
    params: { id: resourceId },
    headers: getAuthHeaders(),
    timeout: 30000,
  })

  if (!response.data?.success || !response.data?.result?.url) {
    return null
  }

  return response.data.result.url
}

export async function getHarvestPortalResourceData(resourceId: string): Promise<any | null> {
  if (!hasHarvestPortalKey()) {
    return null
  }

  try {
    const url = await getResourceDownloadUrl(resourceId)
    if (!url) return null

    const response = await axios.get(url, {
      headers: getAuthHeaders(),
      timeout: 60000,
    })

    return response.data
  } catch (error: any) {
    console.warn(`Harvest Portal resource fetch failed for ${resourceId}:`, error?.message || error)
    return null
  }
}

function normalizeFeatureCollection(payload: any): GeoJsonFeature[] {
  if (!payload) return []
  if (Array.isArray(payload?.features)) return payload.features
  if (Array.isArray(payload)) return payload.filter((f) => f?.type === 'Feature')
  return []
}

export function hasHarvestPortalKey(): boolean {
  return !!process.env.HARVEST_PORTAL_API_KEY
}

/**
 * Fetch Somalia ADM1 boundaries from Harvest Portal resource_show -> resource url.
 */
export async function getSomaliaAdm1FeaturesFromHarvest(): Promise<GeoJsonFeature[]> {
  if (!hasHarvestPortalKey()) {
    return []
  }

  try {
    const data = await getHarvestPortalResourceData(SOMALIA_ADM1_RESOURCE_ID)
    return normalizeFeatureCollection(data)
  } catch (error: any) {
    console.warn('Harvest Portal ADM1 boundary fetch failed:', error?.message || error)
    return []
  }
}

