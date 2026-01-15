import { Request, Response } from 'express'
import Prediction from '../models/Prediction'
import { getMockPredictions } from '../data/mockData'

export const getPredictions = async (req: Request, res: Response) => {
  try {
    const { region } = req.query
    
    // Build query - get most recent predictions
    const query: any = {}
    if (region) query.regionId = region
    
    // Try MongoDB first
    const predictions = await Prediction.find(query)
      .sort({ predictionDate: -1 })
      .limit(20)
      .lean()
    
    if (predictions.length > 0) {
      // Get most recent for each region
      const latestByRegion = new Map()
      predictions.forEach(pred => {
        const key = pred.regionId
        if (!latestByRegion.has(key) || pred.predictionDate > latestByRegion.get(key).predictionDate) {
          latestByRegion.set(key, pred)
        }
      })
      
      const formattedData = Array.from(latestByRegion.values()).map(pred => ({
        region: pred.region,
        riskLevel: pred.riskLevel,
        timeframe: pred.timeframe,
        confidence: pred.confidence,
        factors: pred.factors,
      }))
      
      return res.json(formattedData)
    }
    
    // Fallback to mock data
    const mockData = getMockPredictions(region as string)
    res.json(mockData)
  } catch (error) {
    console.error('Error fetching predictions:', error)
    const mockData = getMockPredictions(req.query.region as string)
    res.json(mockData)
  }
}
