import { Request, Response } from 'express'
import Impact from '../models/Impact'
import { getMockImpactData } from '../data/mockData'

export const getImpactData = async (req: Request, res: Response) => {
  try {
    const { region } = req.query
    
    // Build query - get most recent data for each region
    const query: any = {}
    if (region) query.regionId = region
    
    // Try MongoDB first
    const impacts = await Impact.find(query)
      .sort({ date: -1 })
      .lean()
    
    if (impacts.length > 0) {
      // Get most recent for each region
      const latestByRegion = new Map()
      impacts.forEach(impact => {
        const key = impact.regionId
        if (!latestByRegion.has(key) || impact.date > latestByRegion.get(key).date) {
          latestByRegion.set(key, impact)
        }
      })
      
      const formattedData = Array.from(latestByRegion.values()).map(impact => ({
        region: impact.region,
        populationAffected: impact.populationAffected,
        displacedHouseholds: impact.displacedHouseholds,
        foodInsecurityPhase: impact.foodInsecurityPhase,
        malnutritionRisk: impact.malnutritionRisk,
      }))
      
      return res.json(formattedData)
    }
    
    // Fallback to mock data
    const mockData = getMockImpactData(region as string)
    res.json(mockData)
  } catch (error) {
    console.error('Error fetching impact data:', error)
    const mockData = getMockImpactData(req.query.region as string)
    res.json(mockData)
  }
}
