import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/drought_monitoring'

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    } as mongoose.ConnectOptions)
    console.log('✅ MongoDB connected successfully')
    console.log(`📊 Database: ${mongoose.connection.name}`)
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    if (process.env.NODE_ENV === 'production') {
      // In production, retry connection
      console.log('🔄 Retrying MongoDB connection in 5 seconds...')
      setTimeout(() => connectDB(), 5000)
    } else {
      process.exit(1)
    }
  }
}

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected')
})

mongoose.connection.on('error', (error) => {
  console.error('MongoDB error:', error)
})

