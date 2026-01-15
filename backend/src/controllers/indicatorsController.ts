import { Request, Response } from 'express'
import { getMockIndicators } from '../data/mockData'

export const getIndicators = async (req: Request, res: Response) => {
  try {
    const { region } = req.query
    const indicators = getMockIndicators(region as string)
    res.json(indicators)
  } catch (error) {
    console.error('Error fetching indicators:', error)
    res.status(500).json({ error: 'Failed to fetch indicators' })
  }
}

