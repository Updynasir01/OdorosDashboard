import type { DroughtIndicator } from '../../types'
import { getGlamIndicatorsForSomalia } from '../glam/glamIndicatorsService'
import { fetchNasaPowerClimateSnapshot } from '../nasa/nasaPowerIndicatorsService'
import { nasaEarthdataTokenIsValid } from '../nasa/nasaEarthdataAuth'
import { getSomaliaCentroidForIndicators } from '../nasa/somaliaRegionCentroids'

function trendFromDelta(delta: number, eps = 1e-6): 'up' | 'down' | 'stable' {
  if (Math.abs(delta) <= eps) return 'stable'
  return delta > 0 ? 'up' : 'down'
}

function glamRegionNameFromId(regionId?: string | null): string | undefined {
  if (!regionId || regionId === 'all') return undefined
  return regionId.replace(/-/g, ' ')
}

/** Merge NASA POWER (rainfall + temperature) with GLAM (NDVI, SWI, ESI). Earthdata token is validated for MODIS/CMR access. */
export async function getLiveSomaliaIndicators(regionId?: string | null): Promise<DroughtIndicator[]> {
  const centroid = getSomaliaCentroidForIndicators(regionId || undefined)
  const glamName = glamRegionNameFromId(regionId)

  const [power, glam, earthdataOk] = await Promise.all([
    fetchNasaPowerClimateSnapshot(centroid.lat, centroid.lon),
    getGlamIndicatorsForSomalia(glamName),
    nasaEarthdataTokenIsValid().catch(() => false),
  ])

  if (!earthdataOk) {
    console.warn(
      'NASA Earthdata bearer token missing or invalid — set NASA_BEARER_TOKEN in backend .env for authenticated NASA CMR access.'
    )
  }

  const glamById = new Map(glam.map((g) => [g.id, g]))

  const out: DroughtIndicator[] = []

  if (power) {
    const { precipRecentMm: r, precipBaselineMm: b, tempRecentMeanC: tr, tempBaselineMeanC: tb } = power
    out.push({
      id: 'rainfall',
      label: 'Rainfall (90d total vs year ago, NASA POWER)',
      value: r,
      historicalAverage: b,
      trend: trendFromDelta(r - b),
      unit: 'mm',
    })

    out.push({
      id: 'temperature',
      label: 'Temperature (30d mean vs year ago, NASA POWER)',
      value: tr,
      historicalAverage: tb,
      trend: trendFromDelta(tr - tb),
      unit: '°C',
    })
  }

  const veg = glamById.get('vegetation')
  if (veg) out.push(veg)

  const water = glamById.get('water')
  if (water) out.push(water)

  const livestock = glamById.get('livestock')
  if (livestock) out.push(livestock)

  if (!power && glamById.get('rainfall')) {
    out.unshift(glamById.get('rainfall')!)
  }

  return out
}
