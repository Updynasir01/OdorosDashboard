import { Request, Response } from 'express'
import Region from '../models/Region'

export const getRegions = async (req: Request, res: Response) => {
  try {
    void req
    const regions = await Region.find().lean()

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
  } catch (error) {
    console.error('Error fetching regions:', error)
    res.status(500).json({ error: 'Failed to fetch regions' })
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

    return res.status(404).json({ error: 'Region not found' })
  } catch (error) {
    console.error('Error fetching region:', error)
    res.status(500).json({ error: 'Failed to fetch region' })
  }
}
