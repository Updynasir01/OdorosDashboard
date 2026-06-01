import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

export interface CropMonitorEvent {
  id: string
  country: string
  driver: string
  impact: string
  crop: string
  description: string
  url?: string
  startDate?: string
}

export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    geometry: { type: string; coordinates: unknown }
    properties: Record<string, unknown>
  }>
}

export interface MarketPricePoint {
  period_date: string
  price: number
  currency?: string
  product: string
  market: string
  unit: string
  price_type: string
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

export const harvestInsightsApi = {
  getStatus: async () => {
    const res = await api.get<{ configured: boolean; message: string }>('/harvest/status')
    return res.data
  },

  getIpcGeoJson: async (): Promise<GeoJsonFeatureCollection> => {
    const res = await api.get('/harvest/ipc-geojson')
    return res.data
  },

  getAdm1Boundaries: async (): Promise<GeoJsonFeatureCollection> => {
    const res = await api.get('/harvest/boundaries/adm1')
    return res.data
  },

  getMarketProducts: async (): Promise<string[]> => {
    const res = await api.get('/harvest/market-prices/products')
    return res.data
  },

  getMarketOptions: async (product: string, market?: string, unit?: string) => {
    const res = await api.get<{ markets: string[]; units: string[]; priceTypes: string[] }>(
      '/harvest/market-prices/options',
      { params: { product, market, unit } }
    )
    return res.data
  },

  getMarketSeries: async (filters: {
    product: string
    market: string
    unit: string
    priceType: string
  }): Promise<MarketPricePoint[]> => {
    const res = await api.get('/harvest/market-prices/series', { params: filters })
    return res.data
  },
}

export const fewsInsightsApi = {
  getStatus: async () => {
    const res = await api.get<{ configured: boolean; message: string }>('/fews/status')
    return res.data
  },

  getIpcPopulation: async (scenario = 'CS'): Promise<IpcPopulationRecord[]> => {
    const res = await api.get('/fews/ipc-population', { params: { scenario } })
    return res.data
  },
}

export const cropMonitorApi = {
  getEvents: async (): Promise<CropMonitorEvent[]> => {
    const res = await api.get('/crop-monitor/events')
    return res.data
  },
}

export const IPC_PHASE_COLORS: Record<number, string> = {
  1: '#90EE90',
  2: '#FFFF00',
  3: '#FFA500',
  4: '#FF4500',
  5: '#8B0000',
}

export const IPC_PHASE_LABELS: Record<number, string> = {
  1: 'Minimal (Phase 1)',
  2: 'Stressed (Phase 2)',
  3: 'Crisis (Phase 3)',
  4: 'Emergency (Phase 4)',
  5: 'Catastrophe (Phase 5)',
}

export function filterIpcByScenario(
  geojson: GeoJsonFeatureCollection,
  scenario: string
): GeoJsonFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: geojson.features.filter(
      (f) => String(f.properties.scenario || '').toUpperCase() === scenario.toUpperCase()
    ),
  }
}

export function availableIpcScenarios(geojson: GeoJsonFeatureCollection): string[] {
  const set = new Set<string>()
  for (const f of geojson.features) {
    const s = String(f.properties.scenario || '')
    if (s) set.add(s)
  }
  return [...set].sort()
}
