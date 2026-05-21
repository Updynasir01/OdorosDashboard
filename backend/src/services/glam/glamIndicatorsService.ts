import axios from 'axios'
import type { DroughtIndicator } from '../../types'

const GLAM_API_BASE = 'https://api.glamdata.org'
const SOMALIA_ADM1_LAYER = 'geoboundaries-som-adm1'
const CROP_MASK_ID = 'no-mask'

type GlamProductId =
  | 'chirps-precip'
  | 'viirs-ndvi-8day'
  | 'copernicus-swi'
  | 'servir-4wk-esi'

interface GlamBoundaryFeature {
  feature_id: number
  feature_name: string
}

interface GlamQueryResponse {
  // GLAM sometimes returns { value: number }, or a raw number, or nested
  value?: unknown
  mean?: unknown
  avg?: unknown
  average?: unknown
  median?: unknown
  stat?: unknown
  data?: unknown
  results?: unknown
  features?: unknown
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

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ')
}

function asDateString(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function trendFromDelta(delta: number, eps: number = 1e-6): 'up' | 'down' | 'stable' {
  if (Math.abs(delta) <= eps) return 'stable'
  return delta > 0 ? 'up' : 'down'
}

type CacheEntry<T> = { expiresAt: number; value: T }
const cache = new Map<string, CacheEntry<any>>()

function cacheGet<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.value as T
}

function cacheSet<T>(key: string, value: T, ttlMs: number) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs })
}

async function getSomaliaAdm1Features(): Promise<GlamBoundaryFeature[]> {
  const key = `glam:boundary-features:${SOMALIA_ADM1_LAYER}`
  const cached = cacheGet<GlamBoundaryFeature[]>(key)
  if (cached) return cached

  const res = await axios.get<GlamBoundaryFeature[]>(`${GLAM_API_BASE}/boundary-features/${SOMALIA_ADM1_LAYER}/`, {
    timeout: 30000,
  })
  const features = res.data || []
  cacheSet(key, features, 1000 * 60 * 60) // 1 hour
  return features
}

async function queryBoundaryFeatureValue(productId: GlamProductId, date: string, featureId: number): Promise<number | null> {
  const key = `glam:q:${productId}:${date}:${featureId}`
  const cached = cacheGet<number | null>(key)
  if (cached !== null) return cached

  try {
    const res = await axios.get<GlamQueryResponse>(
      `${GLAM_API_BASE}/query/${productId}/${date}/${CROP_MASK_ID}/${SOMALIA_ADM1_LAYER}/${featureId}/`,
      { timeout: 20000 }
    )
    const value = extractNumericValue(res.data)
    cacheSet(key, value, 1000 * 60 * 10) // 10 min
    return value
  } catch {
    cacheSet(key, null, 1000 * 60 * 2)
    return null
  }
}

async function findRecentValue(
  productId: GlamProductId,
  featureId: number,
  lookbackDays: number = 14
): Promise<{ date: string; value: number } | null> {
  const today = new Date()
  for (let i = 0; i <= lookbackDays; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const date = asDateString(d)
    const v = await queryBoundaryFeatureValue(productId, date, featureId)
    if (typeof v === 'number' && Number.isFinite(v)) return { date, value: v }
  }
  return null
}

/** National view: average a subset of gobols so the API returns in seconds, not minutes. */
const MAX_ADM1_FOR_NATIONAL = 10

function toPercentMaybe(value: number): { value: number; unit: string } {
  // Heuristic: many indices are 0..1. If so, convert to percent.
  if (value >= 0 && value <= 1.5) return { value: clamp(value * 100, 0, 100), unit: '%' }
  return { value, unit: '' }
}

function indicator(
  id: DroughtIndicator['id'],
  label: string,
  value: number,
  unit: string,
  historicalAverage?: number
): DroughtIndicator {
  const avg = typeof historicalAverage === 'number' && Number.isFinite(historicalAverage) ? historicalAverage : value
  return {
    id,
    label,
    value,
    trend: trendFromDelta(value - avg),
    historicalAverage: avg,
    unit,
  }
}

export async function getGlamIndicatorsForSomalia(regionName?: string): Promise<DroughtIndicator[]> {
  const features = await getSomaliaAdm1Features()
  if (features.length === 0) return []

  const normalized = regionName ? normalizeName(regionName) : null
  const feature =
    normalized ? features.find((f) => normalizeName(f.feature_name) === normalized) || null : null

  let selectedFeatureIds = feature ? [feature.feature_id] : features.map((f) => f.feature_id)
  if (!feature && selectedFeatureIds.length > MAX_ADM1_FOR_NATIONAL) {
    selectedFeatureIds = selectedFeatureIds.slice(0, MAX_ADM1_FOR_NATIONAL)
  }

  // We fetch recent values (rolling back) because a fixed YYYY-MM-DD may have no data.
  // For national view we average the ADM1 values (subset for latency).
  async function avgRecent(productId: GlamProductId): Promise<number | null> {
    const hits = await Promise.all(selectedFeatureIds.map((id) => findRecentValue(productId, id)))
    const values = hits.filter((h): h is { date: string; value: number } => h != null).map((h) => h.value)
    if (values.length === 0) return null
    return values.reduce((s, n) => s + n, 0) / values.length
  }

  const [precip, ndvi, swi, esi] = await Promise.all([
    avgRecent('chirps-precip'),
    avgRecent('viirs-ndvi-8day'),
    avgRecent('copernicus-swi'),
    avgRecent('servir-4wk-esi'),
  ])

  const out: DroughtIndicator[] = []

  if (typeof precip === 'number') {
    // Keep the existing card id "rainfall" but display in mm if coming from CHIRPS precip product.
    out.push(indicator('rainfall', 'CHIRPS Precipitation (GLAM)', precip, 'mm'))
  }

  if (typeof ndvi === 'number') {
    out.push(indicator('vegetation', 'NDVI (GLAM / VIIRS)', ndvi, ''))
  }

  if (typeof swi === 'number') {
    const p = toPercentMaybe(swi)
    out.push(indicator('water', 'Soil Water Index (GLAM)', p.value, p.unit))
  }

  if (typeof esi === 'number') {
    const p = toPercentMaybe(esi)
    out.push(indicator('livestock', 'Evaporative Stress Index (GLAM)', p.value, p.unit))
  }

  return out
}

