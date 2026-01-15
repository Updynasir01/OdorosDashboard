import { Request, Response } from 'express'
import Alert from '../models/Alert'
import { getMockAlerts } from '../data/mockData'

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const { region, severity } = req.query
    
    // Build query
    const query: any = {}
    if (region) query.regionId = region
    if (severity) query.severity = severity
    
    // Try MongoDB first
    const alerts = await Alert.find(query)
      .sort({ date: -1 })
      .limit(50)
      .lean()
    
    if (alerts.length > 0) {
      const formattedAlerts = alerts.map(alert => ({
        id: alert._id.toString(),
        region: alert.region,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        date: alert.date.toISOString(),
      }))
      return res.json(formattedAlerts)
    }
    
    // Fallback to mock data
    const mockAlerts = getMockAlerts(region as string, severity as string)
    res.json(mockAlerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    const mockAlerts = getMockAlerts(
      req.query.region as string,
      req.query.severity as string
    )
    res.json(mockAlerts)
  }
}
