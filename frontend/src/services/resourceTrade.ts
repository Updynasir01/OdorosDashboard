/**
 * Resource Trade (Chatham House) — public REST API, no key.
 * https://resourcetrade.earth/
 */

import faostatCodes from '../data/faostat-country-codes.json'

const API_BASES = [
  'https://api.resourcetrade.earth/api/rt/2.7',
  'https://api.resourcetrade.earth/api/rt/2.6',
]

/** Somalia — ResourceTrade M49 (matches FAOSTAT mapping in Harvest2Market). */
export const SOMALIA_RESOURCE_TRADE_M49 = '706'

type FaostatRow = {
  'ISO3 Code': string
  Country: string
  ResourceTrade_M49: string
}

const rows = faostatCodes as FaostatRow[]

const m49ToIso3 = rows.reduce<Record<string, string>>((acc, cur) => {
  const m49 = String(cur.ResourceTrade_M49 || '').trim()
  const iso3 = String(cur['ISO3 Code'] || '').trim().toUpperCase()
  if (m49 && iso3) acc[m49] = iso3
  return acc
}, {})

export function m49ToIso3Code(m49: string | number): string | null {
  return m49ToIso3[String(m49)] ?? null
}

export function iso3ToCountryName(iso3: string): string {
  const u = iso3.toUpperCase()
  const row = rows.find((r) => String(r['ISO3 Code']).trim().toUpperCase() === u)
  return row?.Country?.trim() || iso3
}

export interface ResourceTradeRow {
  year: number
  value: number
  weight: number
  exporter: number
  importer: number
}

export interface TradesResponse {
  main?: ResourceTradeRow[]
}

export interface TradeCategory {
  id: number
  name: string
}

export interface ModelsResponse {
  categories?: TradeCategory[]
}

async function fetchWithVersionFallback(pathAndQuery: string): Promise<Response> {
  let lastResponse: Response | null = null
  for (const base of API_BASES) {
    const res = await fetch(`${base}${pathAndQuery}`)
    if (res.ok) return res
    lastResponse = res
    // 404 usually means old/unsupported version; try next base.
    if (res.status !== 404) break
  }
  if (lastResponse) {
    throw new Error(`ResourceTrade API error: ${lastResponse.status}`)
  }
  throw new Error('ResourceTrade API error')
}

export async function fetchTradeModels(): Promise<ModelsResponse> {
  const res = await fetchWithVersionFallback('/models')
  return res.json() as Promise<ModelsResponse>
}

export type TradeMode = 'exports' | 'imports'

export async function fetchSomaliaTrades(
  mode: TradeMode,
  year: number,
  categoryId?: number | null
): Promise<TradesResponse> {
  const params = new URLSearchParams({
    year: String(year),
    autozoom: '1',
  })
  if (mode === 'exports') {
    params.set('exporter', SOMALIA_RESOURCE_TRADE_M49)
  } else {
    params.set('importer', SOMALIA_RESOURCE_TRADE_M49)
  }
  if (categoryId != null && categoryId > 0) {
    params.set('category', String(categoryId))
  }

  const res = await fetchWithVersionFallback(`/trades?${params.toString()}`)
  return res.json() as Promise<TradesResponse>
}

/** Aggregate trade value by partner country (M49). */
export function aggregatePartnerValues(
  mode: TradeMode,
  data: TradesResponse
): { partnerM49: string; value: number; iso3: string | null; name: string }[] {
  const main = data.main || []
  const sums = new Map<string, number>()

  for (const row of main) {
    const partner = mode === 'exports' ? row.importer : row.exporter
    const key = String(partner)
    sums.set(key, (sums.get(key) || 0) + row.value)
  }

  const out: { partnerM49: string; value: number; iso3: string | null; name: string }[] = []
  for (const [partnerM49, value] of sums) {
    const iso3 = m49ToIso3Code(partnerM49)
    const name = iso3 ? iso3ToCountryName(iso3) : `M49 ${partnerM49}`
    out.push({ partnerM49, value, iso3, name })
  }

  out.sort((a, b) => b.value - a.value)
  return out
}

/** API `value` is in **thousands of USD** (same convention as Harvest2Market ResourceTrade cards). */
export function formatTradeValueThousands(value: number): string {
  if (!Number.isFinite(value)) return '—'
  const mUsd = value / 1000
  if (mUsd >= 1000) return `$${(mUsd / 1000).toFixed(2)}B`
  if (mUsd >= 1) return `$${mUsd.toFixed(1)}M`
  return `$${value.toFixed(0)}k`
}
