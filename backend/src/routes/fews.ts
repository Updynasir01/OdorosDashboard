import { Router } from 'express'
import { fetchIpcPopulationSize, fetchLivelihoodZones, fewsConfigured } from '../services/fews/fewsService'

const router = Router()

router.get('/status', (_req, res) => {
  res.json({
    configured: fewsConfigured(),
    message: fewsConfigured()
      ? 'FEWS credentials configured'
      : 'Optional: set FEWS_JWT_TOKEN or FEWS_USERNAME/FEWS_PASSWORD for IPC population API',
  })
})

router.get('/ipc-population', async (req, res) => {
  try {
    const scenario = String(req.query.scenario || 'CS').toUpperCase()
    const records = await fetchIpcPopulationSize(scenario)
    res.json(records)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load IPC population data'
    res.status(fewsConfigured() ? 500 : 503).json({ error: message })
  }
})

router.get('/livelihood-zones', async (_req, res) => {
  try {
    const data = await fetchLivelihoodZones()
    res.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load livelihood zones'
    res.status(fewsConfigured() ? 500 : 503).json({ error: message })
  }
})

export default router
