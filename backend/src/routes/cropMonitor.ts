import { Router } from 'express'
import axios from 'axios'
import { CM_EVENTS_URL } from '../constants/harvestResources'

const router = Router()

const IMPACT_LABELS: Record<string, string> = {
  maj_neg: 'Major Negative',
  min_neg: 'Minor Negative',
  min_pos: 'Minor Positive',
  maj_pos: 'Major Positive',
}

router.get('/events', async (_req, res) => {
  try {
    const response = await axios.get(CM_EVENTS_URL, {
      params: {
        f: 'json',
        where: '1=1',
        outFields: '*',
        resultRecordCount: 2000,
      },
      timeout: 60000,
    })

    const features = response.data?.features || []
    const events = features.map((feature: { attributes: Record<string, unknown> }) => ({
      id: String(feature.attributes.globalid || feature.attributes.OBJECTID || Math.random()),
      country: String(feature.attributes.country || ''),
      driver: String(feature.attributes.driver_other || feature.attributes.driver || ''),
      impact: IMPACT_LABELS[String(feature.attributes.impact)] || String(feature.attributes.impact || ''),
      crop: String(feature.attributes.crop_other || feature.attributes.crop || ''),
      description: String(feature.attributes.descript || ''),
      url: feature.attributes.url ? String(feature.attributes.url) : undefined,
      startDate: feature.attributes.start_date ? String(feature.attributes.start_date) : undefined,
    }))

    const somalia = events.filter(
      (e: { country: string }) => e.country.toLowerCase().replace(/_/g, ' ') === 'somalia'
    )

    res.json(somalia)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch Crop Monitor events'
    res.status(500).json({ error: message })
  }
})

export default router
