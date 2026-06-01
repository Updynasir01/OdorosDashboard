import { Router } from 'express'
import { HARVEST_RESOURCES } from '../constants/harvestResources'
import {
  fetchHarvestResourceJson,
  fetchMarketPriceDistinct,
  fetchMarketPriceSeries,
  hasHarvestPortalKey,
} from '../services/harvest/harvestPortalClient'

const router = Router()

router.get('/status', (_req, res) => {
  res.json({
    configured: hasHarvestPortalKey(),
    message: hasHarvestPortalKey()
      ? 'Harvest Portal API key configured'
      : 'Set HARVEST_PORTAL_API_KEY in backend/.env',
  })
})

router.get('/ipc-geojson', async (_req, res) => {
  try {
    const data = await fetchHarvestResourceJson(HARVEST_RESOURCES.IPC_ACUTE_FOOD_INSECURITY)
    res.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load IPC GeoJSON'
    res.status(hasHarvestPortalKey() ? 500 : 503).json({ error: message })
  }
})

router.get('/boundaries/adm1', async (_req, res) => {
  try {
    const data = await fetchHarvestResourceJson(HARVEST_RESOURCES.ADMIN1_BOUNDARY)
    res.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load ADM1 boundaries'
    res.status(hasHarvestPortalKey() ? 500 : 503).json({ error: message })
  }
})

router.get('/boundaries/adm2', async (_req, res) => {
  try {
    const data = await fetchHarvestResourceJson(HARVEST_RESOURCES.ADMIN2_BOUNDARY)
    res.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load ADM2 boundaries'
    res.status(hasHarvestPortalKey() ? 500 : 503).json({ error: message })
  }
})

router.get('/market-prices/products', async (_req, res) => {
  try {
    const products = await fetchMarketPriceDistinct('product', {})
    res.json(products)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load products'
    res.status(hasHarvestPortalKey() ? 500 : 503).json({ error: message })
  }
})

router.get('/market-prices/options', async (req, res) => {
  try {
    const product = String(req.query.product || '')
    const market = String(req.query.market || '')
    if (!product) {
      res.status(400).json({ error: 'product is required' })
      return
    }
    const [markets, units, priceTypes] = await Promise.all([
      fetchMarketPriceDistinct('market', { product }),
      market ? fetchMarketPriceDistinct('unit', { product, market }) : Promise.resolve([]),
      market && req.query.unit
        ? fetchMarketPriceDistinct('price_type', {
            product,
            market,
            unit: String(req.query.unit),
          })
        : Promise.resolve([]),
    ])
    res.json({ markets, units, priceTypes })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load filter options'
    res.status(hasHarvestPortalKey() ? 500 : 503).json({ error: message })
  }
})

router.get('/market-prices/series', async (req, res) => {
  try {
    const product = String(req.query.product || '')
    const market = String(req.query.market || '')
    const unit = String(req.query.unit || '')
    const priceType = String(req.query.priceType || 'Retail')
    if (!product || !market || !unit) {
      res.status(400).json({ error: 'product, market, and unit are required' })
      return
    }
    const series = await fetchMarketPriceSeries({ product, market, unit, priceType })
    res.json(series)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load price series'
    res.status(hasHarvestPortalKey() ? 500 : 503).json({ error: message })
  }
})

export default router
