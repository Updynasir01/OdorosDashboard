import axios from 'axios'
import { HARVEST_RESOURCES } from '../../constants/harvestResources'

const HARVEST_PORTAL_BASE = 'https://data.harvestportal.org/api/action'

export function hasHarvestPortalKey(): boolean {
  return Boolean(process.env.HARVEST_PORTAL_API_KEY?.trim())
}

function authHeaders(): Record<string, string> {
  const key = process.env.HARVEST_PORTAL_API_KEY?.trim()
  if (!key) {
    throw new Error('HARVEST_PORTAL_API_KEY is not configured on the server')
  }
  return { Authorization: key }
}

interface ResourceShowResult {
  success: boolean
  result?: { url?: string; name?: string; format?: string }
}

export async function fetchHarvestResourceUrl(resourceId: string): Promise<string> {
  const res = await axios.get<ResourceShowResult>(`${HARVEST_PORTAL_BASE}/resource_show`, {
    params: { id: resourceId },
    headers: authHeaders(),
    timeout: 30000,
  })
  const url = res.data?.result?.url
  if (!res.data?.success || !url) {
    throw new Error(`Harvest resource not found: ${resourceId}`)
  }
  return url
}

export async function fetchHarvestResourceJson<T = unknown>(resourceId: string): Promise<T> {
  const url = await fetchHarvestResourceUrl(resourceId)
  const res = await axios.get<T>(url, {
    headers: authHeaders(),
    timeout: 120000,
  })
  return res.data
}

export async function harvestDatastoreSql<T = unknown>(sql: string): Promise<T> {
  const res = await axios.get<{ success: boolean; result?: { records?: unknown[] } }>(
    `${HARVEST_PORTAL_BASE}/datastore_search_sql`,
    {
      params: { sql },
      headers: authHeaders(),
      timeout: 60000,
    }
  )
  if (!res.data?.success) {
    throw new Error('Harvest SQL query failed')
  }
  return res.data as T
}

function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''")
}

export async function fetchMarketPriceDistinct(field: 'product' | 'market' | 'unit' | 'price_type', filters: {
  product?: string
  market?: string
  unit?: string
}): Promise<string[]> {
  const table = HARVEST_RESOURCES.MARKET_PRICES
  const where: string[] = [`"collection_status" = 'Published'`]
  if (filters.product) where.push(`"product" = '${escapeSqlString(filters.product)}'`)
  if (filters.market) where.push(`"market" = '${escapeSqlString(filters.market)}'`)
  if (filters.unit) where.push(`"unit" = '${escapeSqlString(filters.unit)}'`)

  const sql = `
    SELECT DISTINCT "${field}"
    FROM "${table}"
    WHERE ${where.join(' AND ')}
    ORDER BY "${field}"
  `.trim()

  const data = await harvestDatastoreSql<{ result: { records: Record<string, string>[] } }>(sql)
  return (data.result?.records || [])
    .map((r) => r[field])
    .filter(Boolean)
}

export async function fetchMarketPriceSeries(filters: {
  product: string
  market: string
  unit: string
  priceType: string
}): Promise<
  Array<{
    period_date: string
    price: number
    currency?: string
    product: string
    market: string
    unit: string
    price_type: string
  }>
> {
  const table = HARVEST_RESOURCES.MARKET_PRICES
  const sql = `
    SELECT "period_date", "price", "currency", "product", "market", "unit", "price_type"
    FROM "${table}"
    WHERE "collection_status" = 'Published'
      AND "product" = '${escapeSqlString(filters.product)}'
      AND "market" = '${escapeSqlString(filters.market)}'
      AND "unit" = '${escapeSqlString(filters.unit)}'
      AND "price_type" = '${escapeSqlString(filters.priceType)}'
    ORDER BY "period_date" ASC
  `.trim()

  const data = await harvestDatastoreSql<{ result: { records: Record<string, string | number>[] } }>(sql)
  return (data.result?.records || []).map((r) => ({
    period_date: String(r.period_date),
    price: Number(r.price),
    currency: r.currency ? String(r.currency) : undefined,
    product: String(r.product),
    market: String(r.market),
    unit: String(r.unit),
    price_type: String(r.price_type),
  }))
}
