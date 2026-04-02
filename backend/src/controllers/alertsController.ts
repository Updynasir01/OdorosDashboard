import { Request, Response } from 'express'
import Alert from '../models/Alert'

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
    
    const formattedAlerts = alerts.map(alert => ({
      id: alert._id.toString(),
      region: alert.region,
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      date: alert.date.toISOString(),
    }))
    return res.json(formattedAlerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    res.status(500).json({ error: 'Failed to fetch alerts' })
  }
}
