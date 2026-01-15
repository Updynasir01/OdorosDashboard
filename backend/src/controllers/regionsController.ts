import { Request, Response } from 'express'
import Region from '../models/Region'
import { getMockRegions, getMockRegionById } from '../data/mockData'

// For now, using mock data. Replace with MongoDB queries when ready
export const getRegions = async (req: Request, res: Response) => {
  try {
    // Try to get from MongoDB first, fallback to mock data
    const regions = await Region.find().lean()
    
    if (regions.length > 0) {
      // Transform MongoDB documents to match frontend format
      const formattedRegions = regions.map(region => ({
        id: region.id,
        name: region.name,
        nameSomali: region.nameSomali,
        coordinates: region.coordinates,
        droughtLevel: region.droughtLevel,
        rainfallDeficit: region.rainfallDeficit,
        lastRainfallDate: region.lastRainfallDate.toISOString().split('T')[0],
        affectedPopulation: region.affectedPopulation,
        ndvi: region.ndvi,
        temperatureAnomaly: region.temperatureAnomaly,
        waterScarcity: region.waterScarcity,
        livestockRisk: region.livestockRisk,
      }))
      return res.json(formattedRegions)
    }
    
    // Fallback to mock data if database is empty
    const mockRegions = getMockRegions()
    res.json(mockRegions)
  } catch (error) {
    console.error('Error fetching regions:', error)
    // Fallback to mock data on error
    const mockRegions = getMockRegions()
    res.json(mockRegions)
  }
}

export const getRegionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    // Try MongoDB first
    const region = await Region.findOne({ id }).lean()
    
    if (region) {
      const formattedRegion = {
        id: region.id,
        name: region.name,
        nameSomali: region.nameSomali,
        coordinates: region.coordinates,
        droughtLevel: region.droughtLevel,
        rainfallDeficit: region.rainfallDeficit,
        lastRainfallDate: region.lastRainfallDate.toISOString().split('T')[0],
        affectedPopulation: region.affectedPopulation,
        ndvi: region.ndvi,
        temperatureAnomaly: region.temperatureAnomaly,
        waterScarcity: region.waterScarcity,
        livestockRisk: region.livestockRisk,
      }
      return res.json(formattedRegion)
    }
    
    // Fallback to mock data
    const mockRegion = getMockRegionById(id)
    if (!mockRegion) {
      return res.status(404).json({ error: 'Region not found' })
    }
    res.json(mockRegion)
  } catch (error) {
    console.error('Error fetching region:', error)
    const mockRegion = getMockRegionById(req.params.id)
    if (!mockRegion) {
      return res.status(404).json({ error: 'Region not found' })
    }
    res.json(mockRegion)
  }
}
