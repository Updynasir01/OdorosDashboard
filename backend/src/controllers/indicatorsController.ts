import { Request, Response } from 'express'
import Region from '../models/Region'
import TimeSeries from '../models/TimeSeries'
import { DroughtIndicator } from '../types'

function avg(values: Array<number | undefined | null>): number {
  const nums = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
  if (nums.length === 0) return 0
  return nums.reduce((sum, n) => sum + n, 0) / nums.length
}

function rainfallTrend(value: number, historicalAverage: number): 'up' | 'down' | 'stable' {
  if (historicalAverage === 0) return 'stable'
  return value > historicalAverage ? 'down' : 'stable'
}

function vegetationTrend(value: number, historicalAverage: number): 'up' | 'down' | 'stable' {
  if (historicalAverage === 0) return 'stable'
  return value < historicalAverage ? 'down' : 'stable'
}

function temperatureTrend(value: number, historicalAverage: number): 'up' | 'down' | 'stable' {
  if (historicalAverage === 0) return 'stable'
  return value > historicalAverage ? 'up' : 'stable'
}

function pressureTrend(value: number, historicalAverage: number): 'up' | 'down' | 'stable' {
  if (historicalAverage === 0) return 'stable'
  return value > historicalAverage ? 'down' : 'stable'
}

export const getIndicators = async (req: Request, res: Response) => {
  try {
    const regionId = (req.query.region as string | undefined)?.trim()

    if (regionId) {
      const region = await Region.findOne({ id: regionId }).lean()
      if (!region) {
        return res.status(404).json({ error: 'Region not found' })
      }

      const recentSeries = await TimeSeries.find({
        regionId: region.id,
        date: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365) },
      })
        .sort({ date: -1 })
        .limit(120)
        .lean()

      const rainfallAvg = avg(recentSeries.map((s) => s.rainfall))
      const ndviAvg = avg(recentSeries.map((s) => s.ndvi))
      const tempAvg = avg(recentSeries.map((s) => s.temperature))

      const indicators: DroughtIndicator[] = [
        {
          id: 'rainfall',
          label: 'Rainfall Anomaly',
          value: region.rainfallDeficit,
          trend: rainfallTrend(region.rainfallDeficit, rainfallAvg || region.rainfallDeficit),
          historicalAverage: rainfallAvg || region.rainfallDeficit,
          unit: '%',
        },
        {
          id: 'vegetation',
          label: 'Vegetation Index (NDVI)',
          value: region.ndvi,
          trend: vegetationTrend(region.ndvi, ndviAvg || region.ndvi),
          historicalAverage: ndviAvg || region.ndvi,
          unit: '',
        },
        {
          id: 'temperature',
          label: 'Temperature Anomaly',
          value: region.temperatureAnomaly,
          trend: temperatureTrend(region.temperatureAnomaly, tempAvg || region.temperatureAnomaly),
          historicalAverage: tempAvg || region.temperatureAnomaly,
          unit: '°C',
        },
        {
          id: 'water',
          label: 'Water Scarcity',
          value: region.waterScarcity,
          trend: pressureTrend(region.waterScarcity, region.waterScarcity),
          historicalAverage: region.waterScarcity,
          unit: '%',
        },
        {
          id: 'livestock',
          label: 'Livestock Risk',
          value: region.livestockRisk,
          trend: pressureTrend(region.livestockRisk, region.livestockRisk),
          historicalAverage: region.livestockRisk,
          unit: '%',
        },
      ]

      return res.json(indicators)
    }

    const regions = await Region.find().lean()
    if (regions.length === 0) {
      return res.json([])
    }

    const regionIds = regions.map((r) => r.id)
    const recentSeries = await TimeSeries.find({
      regionId: { $in: regionIds },
      date: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365) },
    })
      .sort({ date: -1 })
      .limit(1500)
      .lean()

    const rainfallAvg = avg(recentSeries.map((s) => s.rainfall))
    const ndviAvg = avg(recentSeries.map((s) => s.ndvi))
    const tempAvg = avg(recentSeries.map((s) => s.temperature))

    const rainfallValue = avg(regions.map((r) => r.rainfallDeficit))
    const ndviValue = avg(regions.map((r) => r.ndvi))
    const tempValue = avg(regions.map((r) => r.temperatureAnomaly))
    const waterValue = avg(regions.map((r) => r.waterScarcity))
    const livestockValue = avg(regions.map((r) => r.livestockRisk))

    const indicators: DroughtIndicator[] = [
      {
        id: 'rainfall',
        label: 'Rainfall Anomaly',
        value: rainfallValue,
        trend: rainfallTrend(rainfallValue, rainfallAvg || rainfallValue),
        historicalAverage: rainfallAvg || rainfallValue,
        unit: '%',
      },
      {
        id: 'vegetation',
        label: 'Vegetation Index (NDVI)',
        value: ndviValue,
        trend: vegetationTrend(ndviValue, ndviAvg || ndviValue),
        historicalAverage: ndviAvg || ndviValue,
        unit: '',
      },
      {
        id: 'temperature',
        label: 'Temperature Anomaly',
        value: tempValue,
        trend: temperatureTrend(tempValue, tempAvg || tempValue),
        historicalAverage: tempAvg || tempValue,
        unit: '°C',
      },
      {
        id: 'water',
        label: 'Water Scarcity',
        value: waterValue,
        trend: pressureTrend(waterValue, waterValue),
        historicalAverage: waterValue,
        unit: '%',
      },
      {
        id: 'livestock',
        label: 'Livestock Risk',
        value: livestockValue,
        trend: pressureTrend(livestockValue, livestockValue),
        historicalAverage: livestockValue,
        unit: '%',
      },
    ]

    res.json(indicators)
  } catch (error) {
    console.error('Error fetching indicators:', error)
    res.status(500).json({ error: 'Failed to fetch indicators' })
  }
}

