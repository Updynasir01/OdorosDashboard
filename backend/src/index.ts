import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './db/connection'
import regionsRouter from './routes/regions'
import indicatorsRouter from './routes/indicators'
import alertsRouter from './routes/alerts'
import timeseriesRouter from './routes/timeseries'
import impactRouter from './routes/impact'
import predictionsRouter from './routes/predictions'
import dataIngestionRouter from './routes/dataIngestion'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Connect to MongoDB
connectDB()

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173']

console.log('🌐 CORS allowed origins:', allowedOrigins)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('⚠️ Request with no origin - allowing')
      return callback(null, true)
    }
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true)
    }
    
    // In production, check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`✅ CORS allowed for origin: ${origin}`)
      callback(null, true)
    } else {
      console.log(`❌ CORS blocked for origin: ${origin}. Allowed origins: ${allowedOrigins.join(', ')}`)
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`))
    }
  },
  credentials: true,
}))
app.use(express.json())

// Routes
app.use('/api/regions', regionsRouter)
app.use('/api/indicators', indicatorsRouter)
app.use('/api/alerts', alertsRouter)
app.use('/api/timeseries', timeseriesRouter)
app.use('/api/impact', impactRouter)
app.use('/api/predictions', predictionsRouter)
app.use('/api/data-ingestion', dataIngestionRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Somalia Drought Monitoring API' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  if (process.env.NODE_ENV === 'production') {
    console.log(`✅ Production mode - CORS enabled for: ${process.env.CORS_ORIGIN || 'all origins'}`)
  }
})

