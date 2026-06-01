import './loadEnv'
import express from 'express'
import cors from 'cors'
import { connectDB } from './db/connection'
import regionsRouter from './routes/regions'
import indicatorsRouter from './routes/indicators'
import alertsRouter from './routes/alerts'
import timeseriesRouter from './routes/timeseries'
import impactRouter from './routes/impact'
import predictionsRouter from './routes/predictions'
import dataIngestionRouter from './routes/dataIngestion'
import adminRouter from './routes/admin'
import harvestRouter from './routes/harvest'
import fewsRouter from './routes/fews'
import cropMonitorRouter from './routes/cropMonitor'

const app = express()
const PORT = process.env.PORT || 5000

/** Local dev + known production frontends (Vercel). */
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://odoros-dashboard.vercel.app',
]

function parseAllowedOrigins(): string[] {
  const fromEnv = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
    : []
  return [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...fromEnv])]
}

function isOriginAllowed(origin: string, allowed: string[]): boolean {
  if (allowed.includes(origin)) return true
  // Allow any Vercel preview/production URL for this project
  if (/^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) return true
  return false
}

// Connect to MongoDB
connectDB()

// Middleware
const allowedOrigins = parseAllowedOrigins()

console.log('🌐 CORS allowed origins:', allowedOrigins.join(', '))

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, health checks, server-to-server)
      if (!origin) {
        return callback(null, true)
      }

      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true)
      }

      if (isOriginAllowed(origin, allowedOrigins)) {
        return callback(null, true)
      }

      console.log(`❌ CORS blocked for origin: ${origin}. Allowed: ${allowedOrigins.join(', ')} (+ *.vercel.app)`)
      return callback(null, false)
    },
    credentials: true,
  })
)
app.use(express.json())

// Routes
app.use('/api/regions', regionsRouter)
app.use('/api/indicators', indicatorsRouter)
app.use('/api/alerts', alertsRouter)
app.use('/api/timeseries', timeseriesRouter)
app.use('/api/impact', impactRouter)
app.use('/api/predictions', predictionsRouter)
app.use('/api/data-ingestion', dataIngestionRouter)
app.use('/api/admin', adminRouter)
app.use('/api/harvest', harvestRouter)
app.use('/api/fews', fewsRouter)
app.use('/api/crop-monitor', cropMonitorRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Somalia Drought Monitoring API' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(
    `🔐 Admin login: ${process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && process.env.ADMIN_JWT_SECRET ? 'configured' : 'NOT configured — set ADMIN_* in backend/.env'}`
  )
  if (process.env.NODE_ENV === 'production') {
    console.log(`✅ Production mode - CORS: ${allowedOrigins.join(', ')} + *.vercel.app`)
  }
})

