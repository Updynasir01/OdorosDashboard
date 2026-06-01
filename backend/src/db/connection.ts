import mongoose from 'mongoose'

/** Prefer standard URI — avoids querySrv ECONNREFUSED on some Windows networks. */
const MONGODB_URI =
  process.env.MONGODB_URI_STANDARD ||
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/drought_monitoring'

const SRV_FALLBACK_STANDARD = process.env.MONGODB_DIRECT_URI

function isSrvDnsError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'ECONNREFUSED' &&
    'syscall' in error &&
    String((error as { syscall?: string }).syscall).includes('querySrv')
  )
}

async function tryConnect(uri: string): Promise<void> {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    family: 4,
  } as mongoose.ConnectOptions)
}

export const connectDB = async (): Promise<void> => {
  try {
    await tryConnect(MONGODB_URI)
    console.log('✅ MongoDB connected successfully')
    console.log(`📊 Database: ${mongoose.connection.name}`)
    return
  } catch (error) {
    const srvUri = process.env.MONGODB_URI || ''
    const canFallback =
      isSrvDnsError(error) &&
      srvUri.startsWith('mongodb+srv://') &&
      !process.env.MONGODB_URI_STANDARD

    if (canFallback && SRV_FALLBACK_STANDARD) {
      console.warn('⚠️  SRV DNS failed — retrying with MONGODB_DIRECT_URI / MONGODB_URI_STANDARD…')
      try {
        await tryConnect(SRV_FALLBACK_STANDARD)
        console.log('✅ MongoDB connected successfully (direct connection)')
        console.log(`📊 Database: ${mongoose.connection.name}`)
        return
      } catch (fallbackError) {
        console.error('❌ MongoDB direct connection also failed:', fallbackError)
      }
    } else {
      console.error('❌ MongoDB connection error:', error)
    }

    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Retrying MongoDB connection in 5 seconds...')
      setTimeout(() => connectDB(), 5000)
    } else {
      console.warn(
        '⚠️  Dev mode: API keeps running without MongoDB. Admin login works; map uses demo data until DB connects.'
      )
    }
  }
}

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected')
})

mongoose.connection.on('error', (error) => {
  console.error('MongoDB error:', error)
})
