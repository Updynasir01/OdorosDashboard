import { Request, Response } from 'express'
import { getGlamIndicatorsForSomalia } from '../services/glam/glamIndicatorsService'
import { getLiveSomaliaIndicators } from '../services/indicators/liveIndicatorsService'

/**
 * KPI cards: NASA POWER (MERRA-2) precipitation + temperature vs prior year,
 * GLAM (VIIRS NDVI, Copernicus SWI, SERVIR ESI). NASA Earthdata token is verified for CMR/MODIS access.
 */
export const getIndicators = async (req: Request, res: Response) => {
  try {
    const regionId = (req.query.region as string | undefined)?.trim()
    const regionParam = regionId && regionId !== 'all' ? regionId : undefined

    let rows = await getLiveSomaliaIndicators(regionParam)
    if (rows.length === 0) {
      rows = await getGlamIndicatorsForSomalia(
        regionParam ? regionParam.replace(/-/g, ' ') : undefined
      )
    }

    if (rows.length === 0) {
      return res.status(503).json({
        error: 'Live indicators unavailable. Check network access to NASA POWER and api.glamdata.org.',
      })
    }

    res.json(rows)
  } catch (error) {
    console.error('Error fetching indicators:', error)
    res.status(500).json({ error: 'Failed to fetch indicators' })
  }
}
