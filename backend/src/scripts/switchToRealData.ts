/**
 * Script to switch dashboard from mock data to real data
 * 
 * This script:
 * 1. Seeds the database with initial regions
 * 2. Triggers data ingestion from all APIs
 * 3. Verifies data was loaded
 */

import dotenv from 'dotenv'
import { connectDB } from '../db/connection'
import { ingestAllData } from '../services/dataIngestion/dataIngestionService'
import Region from '../models/Region'
import TimeSeries from '../models/TimeSeries'
import { getMockRegions } from '../data/mockData'

dotenv.config()

async function seedRegions() {
  const existingRegions = await Region.countDocuments()
  
  if (existingRegions === 0) {
    // Clear existing regions
    await Region.deleteMany({})
    
    // Get mock data
    const mockRegions = getMockRegions()
    
    // Transform and insert
    const regionsToInsert = mockRegions.map(region => ({
      id: region.id,
      name: region.name,
      nameSomali: region.nameSomali,
      coordinates: region.coordinates,
      droughtLevel: region.droughtLevel,
      rainfallDeficit: region.rainfallDeficit,
      lastRainfallDate: new Date(region.lastRainfallDate),
      affectedPopulation: region.affectedPopulation,
      ndvi: region.ndvi,
      temperatureAnomaly: region.temperatureAnomaly,
      waterScarcity: region.waterScarcity,
      livestockRisk: region.livestockRisk,
    }))
    
    await Region.insertMany(regionsToInsert)
    return regionsToInsert.length
  }
  
  return existingRegions
}

async function switchToRealData() {
  console.log('🔄 Switching dashboard to real data...\n')

  try {
    // Step 1: Connect to MongoDB
    console.log('📡 Connecting to MongoDB...')
    await connectDB()
    console.log('✅ Connected to MongoDB\n')

    // Step 2: Seed initial regions (if not already seeded)
    console.log('🌱 Seeding initial regions...')
    const regionCount = await seedRegions()
    
    if (regionCount > 0) {
      console.log(`✅ ${regionCount} regions ready\n`)
    } else {
      console.log('ℹ️  Regions already exist, skipping seed\n')
    }

    // Step 3: Check if NASA token is set
    console.log('🔑 Checking API credentials...')
    const nasaToken = process.env.NASA_BEARER_TOKEN
    const nasaUsername = process.env.NASA_USERNAME
    
    if (nasaToken) {
      console.log('✅ NASA Bearer Token found')
    } else if (nasaUsername) {
      console.log('✅ NASA Username found')
    } else {
      console.log('⚠️  NASA credentials not set (NDVI data may not work)')
    }
    console.log()

    // Step 4: Trigger data ingestion
    console.log('📊 Starting data ingestion from all sources...')
    console.log('   This may take a few minutes...\n')
    
    await ingestAllData()
    
    console.log('\n✅ Data ingestion completed!\n')

    // Step 5: Verify data was loaded
    console.log('🔍 Verifying data...')
    const regionsWithData = await Region.countDocuments({ 
      $or: [
        { rainfallDeficit: { $exists: true } },
        { ndvi: { $exists: true } }
      ]
    })
    
    const timeSeriesCount = await TimeSeries.countDocuments()
    
    console.log(`   Regions with data: ${regionsWithData}`)
    console.log(`   Time series records: ${timeSeriesCount}\n`)

    if (regionsWithData > 0 || timeSeriesCount > 0) {
      console.log('🎉 SUCCESS! Your dashboard is now using REAL DATA!')
      console.log('\n📝 Next steps:')
      console.log('   1. Refresh your dashboard in the browser')
      console.log('   2. You should see real data from APIs')
      console.log('   3. To update data, run: npm run switch-to-real')
      console.log('   4. Or trigger via API: POST /api/data-ingestion/ingest/all\n')
    } else {
      console.log('⚠️  Data ingestion completed but no data found in database.')
      console.log('   This might mean:')
      console.log('   - APIs returned empty results')
      console.log('   - API credentials need to be set')
      console.log('   - Check backend console for errors\n')
    }

    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ Error switching to real data:', error.message)
    console.error('\n💡 Troubleshooting:')
    console.error('   1. Make sure MongoDB is running')
    console.error('   2. Check your .env file has NASA_BEARER_TOKEN')
    console.error('   3. Check your internet connection')
    console.error('   4. Review error details above\n')
    process.exit(1)
  }
}

// Run the script
switchToRealData()

