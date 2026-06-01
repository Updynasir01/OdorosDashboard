import axios from 'axios'
import { getStoredAdminToken } from '../contexts/AdminContext'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const adminClient = axios.create({
  baseURL: `${API_BASE}/admin`,
  headers: { 'Content-Type': 'application/json' },
})

adminClient.interceptors.request.use((config) => {
  const token = getStoredAdminToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface AdminStats {
  totalRegions: number
  totalAlerts: number
  criticalAlerts: number
  totalImpactRecords: number
  filesUploaded: number
  lastUpdated: string | null
  apiHealth: { name: string; online: boolean; latencyMs: number | null; detail?: string }[]
}

export interface AdminFile {
  filename: string
  size: number
  uploadedAt: string
}

export interface AdminAlert {
  id: string
  regionId: string
  region: string
  type: string
  severity: string
  message: string
  date: string
}

export interface EnvStatus {
  harvestPortalKey: boolean
  nasaBearerToken: boolean
  nasaTokenExpiryWarning: string
  mongodbUri: boolean
  adminUsername: boolean
  adminPassword: boolean
  adminJwtSecret: boolean
}

export const adminApi = {
  login: async (username: string, password: string) => {
    const res = await axios.post(`${API_BASE}/admin/login`, { username, password })
    return res.data as { token: string; username: string; expiresIn: string }
  },

  getStats: async () => {
    const res = await adminClient.get<AdminStats>('/stats')
    return res.data
  },

  uploadFile: async (file: File, onProgress?: (pct: number) => void) => {
    const form = new FormData()
    form.append('file', file)
    const res = await adminClient.post('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      },
    })
    return res.data
  },

  getFiles: async () => {
    const res = await adminClient.get<AdminFile[]>('/files')
    return res.data
  },

  deleteFile: async (filename: string) => {
    const res = await adminClient.delete(`/files/${encodeURIComponent(filename)}`)
    return res.data
  },

  getAlerts: async () => {
    const res = await adminClient.get<AdminAlert[]>('/alerts')
    return res.data
  },

  createAlert: async (payload: {
    region: string
    type: string
    severity: string
    message: string
  }) => {
    const res = await adminClient.post<AdminAlert>('/alerts', payload)
    return res.data
  },

  deleteAlert: async (id: string) => {
    const res = await adminClient.delete(`/alerts/${id}`)
    return res.data
  },

  triggerRefresh: async () => {
    const res = await adminClient.post('/refresh')
    return res.data
  },

  getEnvStatus: async () => {
    const res = await adminClient.get<EnvStatus>('/env-status')
    return res.data
  },
}
