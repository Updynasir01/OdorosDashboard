import axios from 'axios'

/**
 * NASA POWER (Prediction of Worldwide Energy Resources / MERRA-2) — point time series.
 * No Earthdata bearer token; public API (NASA LaRC). Used for rainfall + temperature KPIs.
 * https://power.larc.nasa.gov/
 */

const POWER_DAILY_POINT = 'https://power.larc.nasa.gov/api/temporal/daily/point'

export interface NasaPowerClimateSnapshot {
  precipRecentMm: number
  precipBaselineMm: number
  /** Mean 2 m air temperature — last 30 days vs same 30-day window one year ago. */
  tempRecentMeanC: number
  tempBaselineMeanC: number
}

function ymd(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

function sumPrecip(series: Record<string, number> | undefined): number {
  if (!series || typeof series !== 'object') return 0
  let s = 0
  for (const v of Object.values(series)) {
    if (typeof v === 'number' && v > -900 && v < 9000) s += v
  }
  return Math.round(s * 100) / 100
}

function meanTemp(series: Record<string, number> | undefined): number {
  if (!series || typeof series !== 'object') return 0
  const vals = Object.values(series).filter((v) => typeof v === 'number' && v > -900 && v < 9000)
  if (vals.length === 0) return 0
  const m = vals.reduce((a, b) => a + b, 0) / vals.length
  return Math.round(m * 100) / 100
}

async function fetchPowerDaily(
  lat: number,
  lon: number,
  start: Date,
  end: Date
): Promise<{ precip: Record<string, number> | undefined; t2m: Record<string, number> | undefined }> {
  const res = await axios.get(POWER_DAILY_POINT, {
    params: {
      parameters: 'T2M,PRECTOT',
      community: 'AG',
      longitude: lon,
      latitude: lat,
      start: ymd(start),
      end: ymd(end),
      format: 'JSON',
    },
    timeout: 90000,
  })

  const param = res.data?.properties?.parameter as Record<string, Record<string, number>> | undefined
  const precip = param?.PRECTOTCORR || param?.PRECTOT
  const t2m = param?.T2M
  return { precip, t2m }
}

/**
 * Precip: last 90 days total vs same 90-day window one year ago.
 * Temperature: last 30 days mean vs same 30-day window one year ago.
 */
export async function fetchNasaPowerClimateSnapshot(
  lat: number,
  lon: number
): Promise<NasaPowerClimateSnapshot | null> {
  try {
    const recentEnd = new Date()
    recentEnd.setUTCHours(0, 0, 0, 0)

    const precipRecentStart = new Date(recentEnd)
    precipRecentStart.setUTCDate(precipRecentStart.getUTCDate() - 89)

    const precipBaselineEnd = new Date(recentEnd)
    precipBaselineEnd.setUTCFullYear(precipBaselineEnd.getUTCFullYear() - 1)
    const precipBaselineStart = new Date(precipRecentStart)
    precipBaselineStart.setUTCFullYear(precipBaselineStart.getUTCFullYear() - 1)

    const tempRecentStart = new Date(recentEnd)
    tempRecentStart.setUTCDate(tempRecentStart.getUTCDate() - 29)

    const tempBaselineEnd = new Date(recentEnd)
    tempBaselineEnd.setUTCFullYear(tempBaselineEnd.getUTCFullYear() - 1)
    const tempBaselineStart = new Date(tempRecentStart)
    tempBaselineStart.setUTCFullYear(tempBaselineStart.getUTCFullYear() - 1)

    const [pRec, pBase, tRec, tBase] = await Promise.all([
      fetchPowerDaily(lat, lon, precipRecentStart, recentEnd),
      fetchPowerDaily(lat, lon, precipBaselineStart, precipBaselineEnd),
      fetchPowerDaily(lat, lon, tempRecentStart, recentEnd),
      fetchPowerDaily(lat, lon, tempBaselineStart, tempBaselineEnd),
    ])

    return {
      precipRecentMm: sumPrecip(pRec.precip),
      precipBaselineMm: sumPrecip(pBase.precip),
      tempRecentMeanC: meanTemp(tRec.t2m),
      tempBaselineMeanC: meanTemp(tBase.t2m),
    }
  } catch (e) {
    console.warn('NASA POWER snapshot failed:', e instanceof Error ? e.message : e)
    return null
  }
}
