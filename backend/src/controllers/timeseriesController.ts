import { Request, Response } from 'express'
import TimeSeries from '../models/TimeSeries'
import { getMockTimeSeries } from '../data/mockData'

export const getTimeSeries = async (req: Request, res: Response) => {
  try {
    const { regionId } = req.params
    const months = parseInt(req.query.months as string) || 12
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)
    
    // Try MongoDB first
    const timeSeries = await TimeSeries.find({
      regionId,
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: 1 })
      .lean()
    
    if (timeSeries.length > 0) {
      const formattedData = timeSeries.map(item => ({
        date: item.date.toISOString().split('T')[0],
        rainfall: item.rainfall,
        ndvi: item.ndvi,
        temperature: item.temperature,
      }))
      return res.json(formattedData)
    }
    
    // Fallback to mock data
    const mockData = getMockTimeSeries(regionId, months)
    res.json(mockData)
  } catch (error) {
    console.error('Error fetching time series:', error)
    const mockData = getMockTimeSeries(req.params.regionId, parseInt(req.query.months as string) || 12)
    res.json(mockData)
  }
}
