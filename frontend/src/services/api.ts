import axios from 'axios'
import { Region, Alert, TimeSeriesData, ImpactData, Prediction, DroughtIndicator } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const apiService = {
  // Regions
  getRegions: async (): Promise<Region[]> => {
    const response = await api.get('/regions')
    return response.data
  },

  getRegionDetails: async (regionId: string): Promise<Region> => {
    const response = await api.get(`/regions/${regionId}`)
    return response.data
  },

  // Indicators
  getIndicators: async (regionId?: string): Promise<DroughtIndicator[]> => {
    const params = regionId ? { region: regionId } : {}
    const response = await api.get('/indicators', { params })
    return response.data
  },

  // Alerts
  getAlerts: async (regionId?: string, severity?: string): Promise<Alert[]> => {
    const params: any = {}
    if (regionId) params.region = regionId
    if (severity) params.severity = severity
    const response = await api.get('/alerts', { params })
    return response.data
  },

  // Time Series
  getTimeSeries: async (regionId: string, months: number = 12): Promise<TimeSeriesData[]> => {
    const response = await api.get(`/timeseries/${regionId}`, {
      params: { months },
    })
    return response.data
  },

  // Impact
  getImpactData: async (regionId?: string): Promise<ImpactData[]> => {
    const params = regionId ? { region: regionId } : {}
    const response = await api.get('/impact', { params })
    return response.data
  },

  // Predictions
  getPredictions: async (regionId?: string): Promise<Prediction[]> => {
    const params = regionId ? { region: regionId } : {}
    const response = await api.get('/predictions', { params })
    return response.data
  },
}

export default api

