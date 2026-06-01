import axios from 'axios'
import { SOMALIA_ISO2 } from '../../constants/harvestResources'

const FEWS_API_BASE = 'https://fdw.fews.net/api'

let cachedJwt: { token: string; expiresAt: number } | null = null

async function getFewsJwt(): Promise<string | null> {
  const envToken = process.env.FEWS_JWT_TOKEN?.trim()
  if (envToken) return envToken

  if (cachedJwt && cachedJwt.expiresAt > Date.now()) {
    return cachedJwt.token
  }

  const username = process.env.FEWS_USERNAME?.trim()
  const password = process.env.FEWS_PASSWORD?.trim()
  if (!username || !password) return null

  try {
    const res = await axios.post<{ token?: string }>(
      `${FEWS_API_BASE}-token-auth/`,
      { username, password },
      { timeout: 20000 }
    )
    const token = res.data?.token
    if (!token) return null
    cachedJwt = { token, expiresAt: Date.now() + 11 * 60 * 60 * 1000 }
    return token
  } catch {
    return null
  }
}

async function fewsGet<T>(path: string, params: Record<string, string | number | boolean>): Promise<T> {
  const jwt = await getFewsJwt()
  const headers: Record<string, string> = {}
  if (jwt) headers.Authorization = `JWT ${jwt}`

  const res = await axios.get<T>(`${FEWS_API_BASE}/${path}`, {
    params,
    headers,
    timeout: 60000,
    validateStatus: (s) => s < 500,
  })

  if (res.status === 401 || res.status === 403) {
    throw new Error('FEWS NET API authentication required — set FEWS_JWT_TOKEN or FEWS_USERNAME/FEWS_PASSWORD')
  }
  if (res.status >= 400) {
    throw new Error(`FEWS NET API error (${res.status})`)
  }
  return res.data
}

export interface IpcPopulationRecord {
  reporting_date: string
  low_value: number
  high_value: number
  population_range?: string
  phase_name?: string
  scenario_name?: string
  country?: string
  phase?: number
}

export async function fetchIpcPopulationSize(scenario: string): Promise<IpcPopulationRecord[]> {
  const data = await fewsGet<{ results?: IpcPopulationRecord[] } | IpcPopulationRecord[]>(
    'ipcpopulationsize.json',
    {
      country_code: SOMALIA_ISO2,
      scenario,
      datasourcedocument: '6986',
    }
  )

  if (Array.isArray(data)) return data.filter((r) => r.country?.toLowerCase() === 'somalia' || !r.country)
  return (data.results || []).filter((r) => r.country?.toLowerCase() === 'somalia' || !r.country)
}

export async function fetchLivelihoodZones(): Promise<unknown> {
  return fewsGet('feature.geojson', {
    country_code: SOMALIA_ISO2,
    unit_type: 'livelihood_zone',
    as_of_date: '2015-01-01',
  })
}

export function fewsConfigured(): boolean {
  return Boolean(
    process.env.FEWS_JWT_TOKEN?.trim() ||
      (process.env.FEWS_USERNAME?.trim() && process.env.FEWS_PASSWORD?.trim())
  )
}
