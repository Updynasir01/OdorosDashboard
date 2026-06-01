import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import Region from '../models/Region'
import Alert from '../models/Alert'
import Impact from '../models/Impact'
import { checkExternalApis } from '../services/admin/apiHealthService'

const UPLOADS_DIR = path.join(process.cwd(), 'uploads')

function ensureUploadsDir(): void {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  }
}

function slugifyRegion(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export const adminLogin = (req: Request, res: Response): void => {
  const { username, password } = req.body as { username?: string; password?: string }
  const expectedUser = process.env.ADMIN_USERNAME
  const expectedPass = process.env.ADMIN_PASSWORD
  const secret = process.env.ADMIN_JWT_SECRET

  if (!expectedUser || !expectedPass || !secret) {
    res.status(500).json({ error: 'Admin credentials are not configured on the server' })
    return
  }

  if (username !== expectedUser || password !== expectedPass) {
    res.status(401).json({ error: 'Invalid username or password' })
    return
  }

  const token = jwt.sign({ username, sub: 'admin' }, secret, { expiresIn: '24h' })
  res.json({ token, username, expiresIn: '24h' })
}

export const adminStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [regionCount, alertCount, criticalCount, impactCount, latestRegion, apis] = await Promise.all([
      Region.countDocuments(),
      Alert.countDocuments(),
      Alert.countDocuments({ severity: 'critical' }),
      Impact.countDocuments(),
      Region.findOne().sort({ updatedAt: -1 }).select('updatedAt').lean(),
      checkExternalApis(),
    ])

    ensureUploadsDir()
    const filesUploaded = fs.readdirSync(UPLOADS_DIR).filter((n) => !n.startsWith('.')).length

    const latestAlert = await Alert.findOne().sort({ date: -1 }).select('date').lean()

    const timestamps = [
      latestRegion?.updatedAt,
      latestAlert?.date,
    ].filter(Boolean) as Date[]

    const lastUpdated =
      timestamps.length > 0
        ? new Date(Math.max(...timestamps.map((d) => new Date(d).getTime()))).toISOString()
        : null

    res.json({
      totalRegions: regionCount,
      totalAlerts: alertCount,
      criticalAlerts: criticalCount,
      totalImpactRecords: impactCount,
      filesUploaded,
      lastUpdated,
      apiHealth: apis,
    })
  } catch (error) {
    console.error('adminStats error:', error)
    res.status(500).json({ error: 'Failed to load admin stats' })
  }
}

export const adminUpload = (req: Request, res: Response): void => {
  ensureUploadsDir()
  const file = req.file
  if (!file) {
    res.status(400).json({ error: 'No file uploaded' })
    return
  }

  res.status(201).json({
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    uploadedAt: new Date().toISOString(),
    path: `/uploads/${file.filename}`,
  })
}

export const adminListFiles = (_req: Request, res: Response): void => {
  ensureUploadsDir()
  try {
    const names = fs.readdirSync(UPLOADS_DIR).filter((n) => !n.startsWith('.'))
    const files = names.map((name) => {
      const full = path.join(UPLOADS_DIR, name)
      const stat = fs.statSync(full)
      return {
        filename: name,
        size: stat.size,
        uploadedAt: stat.mtime.toISOString(),
      }
    })
    files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    res.json(files)
  } catch (error) {
    console.error('adminListFiles error:', error)
    res.status(500).json({ error: 'Failed to list files' })
  }
}

export const adminDeleteFile = (req: Request, res: Response): void => {
  ensureUploadsDir()
  const raw = req.params.filename
  const filename = path.basename(raw)
  if (!filename || filename.includes('..')) {
    res.status(400).json({ error: 'Invalid filename' })
    return
  }

  const full = path.join(UPLOADS_DIR, filename)
  if (!fs.existsSync(full)) {
    res.status(404).json({ error: 'File not found' })
    return
  }

  try {
    fs.unlinkSync(full)
    res.json({ success: true, filename })
  } catch (error) {
    console.error('adminDeleteFile error:', error)
    res.status(500).json({ error: 'Failed to delete file' })
  }
}

export const adminGetAlerts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const alerts = await Alert.find().sort({ date: -1 }).lean()
    res.json(
      alerts.map((a) => ({
        id: a._id.toString(),
        regionId: a.regionId,
        region: a.region,
        type: a.type,
        severity: a.severity,
        message: a.message,
        date: a.date.toISOString(),
      }))
    )
  } catch (error) {
    console.error('adminGetAlerts error:', error)
    res.status(500).json({ error: 'Failed to fetch alerts' })
  }
}

export const adminCreateAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { region, type, severity, message } = req.body as {
      region?: string
      type?: string
      severity?: string
      message?: string
    }

    if (!region?.trim() || !type || !severity || !message?.trim()) {
      res.status(400).json({ error: 'region, type, severity, and message are required' })
      return
    }

    const validTypes = ['rainfall', 'vegetation', 'heat', 'water']
    const validSeverity = ['low', 'medium', 'high', 'critical']
    if (!validTypes.includes(type) || !validSeverity.includes(severity)) {
      res.status(400).json({ error: 'Invalid type or severity' })
      return
    }

    const alert = await Alert.create({
      regionId: slugifyRegion(region),
      region: region.trim(),
      type,
      severity,
      message: message.trim(),
      date: new Date(),
      acknowledged: false,
    })

    res.status(201).json({
      id: alert._id.toString(),
      regionId: alert.regionId,
      region: alert.region,
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      date: alert.date.toISOString(),
    })
  } catch (error) {
    console.error('adminCreateAlert error:', error)
    res.status(500).json({ error: 'Failed to create alert' })
  }
}

export const adminDeleteAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid alert id' })
      return
    }
    const deleted = await Alert.findByIdAndDelete(id)
    if (!deleted) {
      res.status(404).json({ error: 'Alert not found' })
      return
    }
    res.json({ success: true, id })
  } catch (error) {
    console.error('adminDeleteAlert error:', error)
    res.status(500).json({ error: 'Failed to delete alert' })
  }
}

export const adminRefresh = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'Data refresh queued. Live indicators will update on next public dashboard request.',
    refreshedAt: new Date().toISOString(),
  })
}

export const adminEnvStatus = (_req: Request, res: Response): void => {
  const nasaToken = process.env.NASA_BEARER_TOKEN?.trim()
  res.json({
    harvestPortalKey: Boolean(process.env.HARVEST_PORTAL_API_KEY?.trim()),
    nasaBearerToken: Boolean(nasaToken),
    nasaTokenExpiryWarning: 'NASA Earthdata bearer tokens may expire — review before May 2026',
    mongodbUri: Boolean(process.env.MONGODB_URI?.trim()),
    adminUsername: Boolean(process.env.ADMIN_USERNAME?.trim()),
    adminPassword: Boolean(process.env.ADMIN_PASSWORD?.trim()),
    adminJwtSecret: Boolean(process.env.ADMIN_JWT_SECRET?.trim()),
  })
}
