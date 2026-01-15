/**
 * Script to seed MongoDB with initial data from mock data
 * Run with: npm run seed (add to package.json scripts)
 */

import { connectDB } from '../db/connection'
import Region from '../models/Region'
import { getMockRegions } from '../data/mockData'

async function seedDatabase() {
  try {
    await connectDB()
    
    // Clear existing regions
    await Region.deleteMany({})
    console.log('Cleared existing regions')
    
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
    console.log(`✅ Seeded ${regionsToInsert.length} regions to MongoDB`)
    
    process.exit(0)
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()

