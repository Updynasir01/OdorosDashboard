import axios from 'axios'
import { Region, Alert, TimeSeriesData, ImpactData, Prediction, DroughtIndicator } from '../types'
import {
  getMockRegions,
  getMockRegionById,
  getMockIndicators,
  getMockAlerts,
  getMockTimeSeries,
  getMockImpactData,
  getMockPredictions,
} from '../data/mockData'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

/** Set `VITE_DEMO_MOCK=true` in Vercel to always use demo data (meeting / no backend). */
const FORCE_DEMO_MOCK = import.meta.env.VITE_DEMO_MOCK === 'true'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const apiService = {
  getRegions: async (): Promise<Region[]> => {
    if (FORCE_DEMO_MOCK) return getMockRegions()
    try {
      const response = await api.get('/regions')
      const data = response.data as Region[]
      if (!Array.isArray(data) || data.length === 0) return getMockRegions()
      return data
    } catch {
      return getMockRegions()
    }
  },

  getRegionDetails: async (regionId: string): Promise<Region> => {
    if (FORCE_DEMO_MOCK) {
      const r = getMockRegionById(regionId)
      if (r) return r
      throw new Error('Region not found')
    }
    try {
      const response = await api.get(`/regions/${regionId}`)
      return response.data
    } catch {
      const r = getMockRegionById(regionId)
      if (r) return r
      throw new Error('Region not found')
    }
  },

  getIndicators: async (regionId?: string): Promise<DroughtIndicator[]> => {
    if (FORCE_DEMO_MOCK) return getMockIndicators(regionId)
    try {
      const response = await api.get('/indicators', {
        params: regionId ? { region: regionId } : {},
        /** Backend calls NASA POWER + many GLAM tiles; allow long wait or skeleton never ends. */
        timeout: 120000,
      })
      const data = response.data as DroughtIndicator[]
      if (!Array.isArray(data)) return []
      return data
    } catch {
      return []
    }
  },

  getAlerts: async (regionId?: string, severity?: string): Promise<Alert[]> => {
    if (FORCE_DEMO_MOCK) return getMockAlerts(regionId, severity)
    try {
      const params: Record<string, string> = {}
      if (regionId) params.region = regionId
      if (severity) params.severity = severity
      const response = await api.get('/alerts', { params })
      const data = response.data as Alert[]
      if (!Array.isArray(data) || data.length === 0) return getMockAlerts(regionId, severity)
      return data
    } catch {
      return getMockAlerts(regionId, severity)
    }
  },

  getTimeSeries: async (regionId: string, months: number = 12): Promise<TimeSeriesData[]> => {
    if (FORCE_DEMO_MOCK) return getMockTimeSeries(regionId, months)
    try {
      const response = await api.get(`/timeseries/${regionId}`, {
        params: { months },
      })
      const data = response.data as TimeSeriesData[]
      if (!Array.isArray(data) || data.length === 0) return getMockTimeSeries(regionId, months)
      return data
    } catch {
      return getMockTimeSeries(regionId, months)
    }
  },

  getImpactData: async (regionId?: string): Promise<ImpactData[]> => {
    if (FORCE_DEMO_MOCK) return getMockImpactData(regionId)
    try {
      const response = await api.get('/impact', {
        params: regionId ? { region: regionId } : {},
      })
      const data = response.data as ImpactData[]
      if (!Array.isArray(data) || data.length === 0) return getMockImpactData(regionId)
      return data
    } catch {
      return getMockImpactData(regionId)
    }
  },

  getPredictions: async (regionId?: string): Promise<Prediction[]> => {
    if (FORCE_DEMO_MOCK) return getMockPredictions(regionId)
    try {
      const response = await api.get('/predictions', {
        params: regionId ? { region: regionId } : {},
      })
      const data = response.data as Prediction[]
      if (!Array.isArray(data) || data.length === 0) return getMockPredictions(regionId)
      return data
    } catch {
      return getMockPredictions(regionId)
    }
  },
}

export default api
