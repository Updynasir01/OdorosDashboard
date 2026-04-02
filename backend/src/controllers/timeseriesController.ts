import { Request, Response } from 'express'
import TimeSeries from '../models/TimeSeries'

export const getTimeSeries = async (req: Request, res: Response) => {
  try {
    const { regionId } = req.params
    const months = parseInt(req.query.months as string) || 12
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)
    
    const timeSeries = await TimeSeries.find({
      regionId,
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: 1 })
      .lean()

    const formattedData = timeSeries.map(item => ({
      date: item.date.toISOString().split('T')[0],
      rainfall: item.rainfall,
      ndvi: item.ndvi,
      temperature: item.temperature,
    }))
    return res.json(formattedData)
  } catch (error) {
    console.error('Error fetching time series:', error)
    res.status(500).json({ error: 'Failed to fetch time series' })
  }
}
