import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { adminAuth } from '../middleware/adminAuth'
import {
  adminLogin,
  adminStats,
  adminUpload,
  adminListFiles,
  adminDeleteFile,
  adminGetAlerts,
  adminCreateAlert,
  adminDeleteAlert,
  adminRefresh,
  adminEnvStatus,
} from '../controllers/adminController'

const router = Router()

const UPLOADS_DIR = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

const ALLOWED_EXT = new Set([
  '.csv',
  '.xls',
  '.xlsx',
  '.json',
  '.geojson',
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.tif',
  '.tiff',
])

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR)
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    const stamp = Date.now()
    cb(null, `${stamp}-${safe}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (!ALLOWED_EXT.has(ext)) {
      cb(new Error(`File type not allowed: ${ext || 'unknown'}`))
      return
    }
    cb(null, true)
  },
})

router.post('/login', adminLogin)

router.use(adminAuth)

router.get('/stats', adminStats)
router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : 'Upload failed' })
      return
    }
    adminUpload(req, res)
  })
})
router.get('/files', adminListFiles)
router.delete('/files/:filename', adminDeleteFile)
router.get('/alerts', adminGetAlerts)
router.post('/alerts', adminCreateAlert)
router.delete('/alerts/:id', adminDeleteAlert)
router.post('/refresh', adminRefresh)
router.get('/env-status', adminEnvStatus)

export default router
