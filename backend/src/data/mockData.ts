// Mock data for development and demonstration
// In production, this would be replaced with actual database queries

import { Region, DroughtIndicator, Alert, TimeSeriesData, ImpactData, Prediction } from '../types'

// Somalia regions with approximate coordinates (simplified polygons)
const SOMALIA_REGIONS_DATA: Omit<Region, 'coordinates'>[] = [
  { id: 'banadir', name: 'Banadir', nameSomali: 'Banaadir', droughtLevel: 'warning', rainfallDeficit: 45, lastRainfallDate: '2024-01-15', affectedPopulation: 2500000, ndvi: 0.35, temperatureAnomaly: 1.2, waterScarcity: 65, livestockRisk: 55 },
  { id: 'bay', name: 'Bay', nameSomali: 'Bay', droughtLevel: 'emergency', rainfallDeficit: 78, lastRainfallDate: '2023-11-20', affectedPopulation: 850000, ndvi: 0.18, temperatureAnomaly: 2.1, waterScarcity: 85, livestockRisk: 90 },
  { id: 'bakool', name: 'Bakool', nameSomali: 'Bakool', droughtLevel: 'emergency', rainfallDeficit: 82, lastRainfallDate: '2023-11-15', affectedPopulation: 420000, ndvi: 0.15, temperatureAnomaly: 2.3, waterScarcity: 90, livestockRisk: 95 },
  { id: 'hiiraan', name: 'Hiiraan', nameSomali: 'Hiiraan', droughtLevel: 'warning', rainfallDeficit: 52, lastRainfallDate: '2024-01-10', affectedPopulation: 680000, ndvi: 0.28, temperatureAnomaly: 1.5, waterScarcity: 70, livestockRisk: 60 },
  { id: 'middle-jubba', name: 'Middle Jubba', nameSomali: 'Jubada Dhexe', droughtLevel: 'warning', rainfallDeficit: 48, lastRainfallDate: '2024-01-12', affectedPopulation: 320000, ndvi: 0.32, temperatureAnomaly: 1.3, waterScarcity: 60, livestockRisk: 50 },
  { id: 'lower-jubba', name: 'Lower Jubba', nameSomali: 'Jubada Hoose', droughtLevel: 'watch', rainfallDeficit: 35, lastRainfallDate: '2024-01-18', affectedPopulation: 280000, ndvi: 0.42, temperatureAnomaly: 0.8, waterScarcity: 45, livestockRisk: 40 },
  { id: 'gedo', name: 'Gedo', nameSomali: 'Gedo', droughtLevel: 'emergency', rainfallDeficit: 75, lastRainfallDate: '2023-12-05', affectedPopulation: 550000, ndvi: 0.22, temperatureAnomaly: 1.9, waterScarcity: 80, livestockRisk: 85 },
  { id: 'middle-shebelle', name: 'Middle Shebelle', nameSomali: 'Shabeellaha Dhexe', droughtLevel: 'warning', rainfallDeficit: 50, lastRainfallDate: '2024-01-08', affectedPopulation: 380000, ndvi: 0.30, temperatureAnomaly: 1.4, waterScarcity: 65, livestockRisk: 55 },
  { id: 'lower-shebelle', name: 'Lower Shebelle', nameSomali: 'Shabeellaha Hoose', droughtLevel: 'watch', rainfallDeficit: 38, lastRainfallDate: '2024-01-20', affectedPopulation: 450000, ndvi: 0.38, temperatureAnomaly: 1.0, waterScarcity: 50, livestockRisk: 45 },
  { id: 'galgaduud', name: 'Galgaduud', nameSomali: 'Galgaduud', droughtLevel: 'emergency', rainfallDeficit: 80, lastRainfallDate: '2023-11-25', affectedPopulation: 620000, ndvi: 0.20, temperatureAnomaly: 2.2, waterScarcity: 88, livestockRisk: 92 },
  { id: 'mudug', name: 'Mudug', nameSomali: 'Mudug', droughtLevel: 'warning', rainfallDeficit: 55, lastRainfallDate: '2024-01-05', affectedPopulation: 720000, ndvi: 0.25, temperatureAnomaly: 1.6, waterScarcity: 75, livestockRisk: 65 },
  { id: 'nugaal', name: 'Nugaal', nameSomali: 'Nugaal', droughtLevel: 'watch', rainfallDeficit: 40, lastRainfallDate: '2024-01-22', affectedPopulation: 380000, ndvi: 0.35, temperatureAnomaly: 1.1, waterScarcity: 55, livestockRisk: 48 },
  { id: 'bari', name: 'Bari', nameSomali: 'Bari', droughtLevel: 'normal', rainfallDeficit: 15, lastRainfallDate: '2024-02-01', affectedPopulation: 180000, ndvi: 0.48, temperatureAnomaly: 0.5, waterScarcity: 30, livestockRisk: 25 },
  { id: 'sanaag', name: 'Sanaag', nameSomali: 'Sanaag', droughtLevel: 'watch', rainfallDeficit: 42, lastRainfallDate: '2024-01-19', affectedPopulation: 520000, ndvi: 0.33, temperatureAnomaly: 1.2, waterScarcity: 58, livestockRisk: 50 },
  { id: 'sool', name: 'Sool', nameSomali: 'Sool', droughtLevel: 'warning', rainfallDeficit: 58, lastRainfallDate: '2024-01-03', affectedPopulation: 410000, ndvi: 0.27, temperatureAnomaly: 1.7, waterScarcity: 72, livestockRisk: 62 },
  { id: 'togdheer', name: 'Togdheer', nameSomali: 'Togdheer', droughtLevel: 'watch', rainfallDeficit: 44, lastRainfallDate: '2024-01-16', affectedPopulation: 480000, ndvi: 0.31, temperatureAnomaly: 1.3, waterScarcity: 60, livestockRisk: 52 },
  { id: 'woqooyi-galbeed', name: 'Woqooyi Galbeed', nameSomali: 'Woqooyi Galbeed', droughtLevel: 'normal', rainfallDeficit: 20, lastRainfallDate: '2024-01-28', affectedPopulation: 120000, ndvi: 0.45, temperatureAnomaly: 0.6, waterScarcity: 35, livestockRisk: 30 },
]

// Generate simplified polygon coordinates for each region (centered around approximate locations)
const regionCenters: Record<string, [number, number]> = {
  'banadir': [2.0469, 45.3182],
  'bay': [2.75, 43.5],
  'bakool': [4.0, 44.0],
  'hiiraan': [4.5, 45.5],
  'middle-jubba': [0.5, 42.5],
  'lower-jubba': [-0.5, 42.0],
  'gedo': [3.5, 42.0],
  'middle-shebelle': [2.5, 44.5],
  'lower-shebelle': [1.5, 44.0],
  'galgaduud': [5.0, 46.5],
  'mudug': [6.5, 48.0],
  'nugaal': [8.0, 49.0],
  'bari': [11.0, 50.0],
  'sanaag': [10.0, 47.5],
  'sool': [8.5, 47.0],
  'togdheer': [9.5, 45.5],
  'woqooyi-galbeed': [9.0, 44.0],
}

function generatePolygon(center: [number, number], size: number = 0.5): [number, number][] {
  return [
    [center[0] - size, center[1] - size],
    [center[0] + size, center[1] - size],
    [center[0] + size, center[1] + size],
    [center[0] - size, center[1] + size],
    [center[0] - size, center[1] - size],
  ]
}

export function getMockRegions(): Region[] {
  return SOMALIA_REGIONS_DATA.map(region => ({
    ...region,
    coordinates: generatePolygon(regionCenters[region.id] || [5.0, 46.0], 0.8),
  }))
}

export function getMockRegionById(id: string): Region | null {
  const regionData = SOMALIA_REGIONS_DATA.find(r => r.id === id)
  if (!regionData) return null
  
  return {
    ...regionData,
    coordinates: generatePolygon(regionCenters[id] || [5.0, 46.0], 0.8),
  }
}

export function getMockIndicators(regionId?: string): DroughtIndicator[] {
  const region = regionId ? SOMALIA_REGIONS_DATA.find(r => r.id === regionId) : null
  
  if (region) {
    return [
      {
        id: 'rainfall',
        label: 'Rainfall Anomaly',
        value: region.rainfallDeficit,
        trend: region.rainfallDeficit > 60 ? 'down' : region.rainfallDeficit > 40 ? 'stable' : 'up',
        historicalAverage: 25,
        unit: '%',
      },
      {
        id: 'vegetation',
        label: 'Vegetation Index (NDVI)',
        value: region.ndvi,
        trend: region.ndvi < 0.25 ? 'down' : region.ndvi < 0.35 ? 'stable' : 'up',
        historicalAverage: 0.40,
        unit: '',
      },
      {
        id: 'temperature',
        label: 'Temperature Anomaly',
        value: region.temperatureAnomaly,
        trend: region.temperatureAnomaly > 1.5 ? 'up' : 'stable',
        historicalAverage: 0.5,
        unit: '°C',
      },
      {
        id: 'water',
        label: 'Water Scarcity',
        value: region.waterScarcity,
        trend: region.waterScarcity > 70 ? 'down' : 'stable',
        historicalAverage: 40,
        unit: '%',
      },
      {
        id: 'livestock',
        label: 'Livestock Risk',
        value: region.livestockRisk,
        trend: region.livestockRisk > 70 ? 'down' : 'stable',
        historicalAverage: 35,
        unit: '%',
      },
    ]
  }

  // Aggregate indicators for all regions
  const avgRainfall = SOMALIA_REGIONS_DATA.reduce((sum, r) => sum + r.rainfallDeficit, 0) / SOMALIA_REGIONS_DATA.length
  const avgNDVI = SOMALIA_REGIONS_DATA.reduce((sum, r) => sum + r.ndvi, 0) / SOMALIA_REGIONS_DATA.length
  const avgTemp = SOMALIA_REGIONS_DATA.reduce((sum, r) => sum + r.temperatureAnomaly, 0) / SOMALIA_REGIONS_DATA.length
  const avgWater = SOMALIA_REGIONS_DATA.reduce((sum, r) => sum + r.waterScarcity, 0) / SOMALIA_REGIONS_DATA.length
  const avgLivestock = SOMALIA_REGIONS_DATA.reduce((sum, r) => sum + r.livestockRisk, 0) / SOMALIA_REGIONS_DATA.length

  return [
    {
      id: 'rainfall',
      label: 'Rainfall Anomaly',
      value: avgRainfall,
      trend: avgRainfall > 60 ? 'down' : 'stable',
      historicalAverage: 25,
      unit: '%',
    },
    {
      id: 'vegetation',
      label: 'Vegetation Index (NDVI)',
      value: avgNDVI,
      trend: avgNDVI < 0.25 ? 'down' : 'stable',
      historicalAverage: 0.40,
      unit: '',
    },
    {
      id: 'temperature',
      label: 'Temperature Anomaly',
      value: avgTemp,
      trend: avgTemp > 1.5 ? 'up' : 'stable',
      historicalAverage: 0.5,
      unit: '°C',
    },
    {
      id: 'water',
      label: 'Water Scarcity',
      value: avgWater,
      trend: avgWater > 70 ? 'down' : 'stable',
      historicalAverage: 40,
      unit: '%',
    },
    {
      id: 'livestock',
      label: 'Livestock Risk',
      value: avgLivestock,
      trend: avgLivestock > 70 ? 'down' : 'stable',
      historicalAverage: 35,
      unit: '%',
    },
  ]
}

export function getMockAlerts(regionId?: string, severity?: string): Alert[] {
  const alerts: Alert[] = []
  
  const regions = regionId 
    ? SOMALIA_REGIONS_DATA.filter(r => r.id === regionId)
    : SOMALIA_REGIONS_DATA.filter(r => r.droughtLevel === 'emergency' || r.droughtLevel === 'warning')

  regions.forEach(region => {
    if (region.droughtLevel === 'emergency') {
      alerts.push({
        id: `alert-${region.id}-1`,
        region: region.name,
        type: 'rainfall',
        severity: 'critical',
        message: `Severe rainfall deficit of ${region.rainfallDeficit}% in ${region.name}. Immediate intervention required.`,
        date: new Date().toISOString(),
      })
    }
    
    if (region.waterScarcity > 80) {
      alerts.push({
        id: `alert-${region.id}-2`,
        region: region.name,
        type: 'water',
        severity: 'high',
        message: `Critical water scarcity (${region.waterScarcity}%) in ${region.name}. Water points are running dry.`,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      })
    }
    
    if (region.ndvi < 0.20) {
      alerts.push({
        id: `alert-${region.id}-3`,
        region: region.name,
        type: 'vegetation',
        severity: 'high',
        message: `Severe vegetation loss detected in ${region.name}. NDVI at ${region.ndvi.toFixed(2)}.`,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      })
    }
  })

  if (severity) {
    return alerts.filter(a => a.severity === severity)
  }

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    return severityOrder[b.severity as keyof typeof severityOrder] - severityOrder[a.severity as keyof typeof severityOrder]
  })
}

export function getMockTimeSeries(regionId: string, months: number): TimeSeriesData[] {
  const region = SOMALIA_REGIONS_DATA.find(r => r.id === regionId)
  if (!region) return []

  const data: TimeSeriesData[] = []
  const now = new Date()
  
  for (let i = months; i >= 0; i--) {
    const date = new Date(now)
    date.setMonth(date.getMonth() - i)
    
    // Generate realistic time series data with some variation
    const monthFactor = (months - i) / months
    const rainfall = Math.max(0, 50 - (region.rainfallDeficit * monthFactor) + (Math.random() * 20 - 10))
    const ndvi = Math.max(0.1, region.ndvi + (0.1 * monthFactor) + (Math.random() * 0.1 - 0.05))
    const temperature = 28 + region.temperatureAnomaly * monthFactor + (Math.random() * 2 - 1)
    
    data.push({
      date: date.toISOString().split('T')[0],
      rainfall: Math.round(rainfall * 10) / 10,
      ndvi: Math.round(ndvi * 100) / 100,
      temperature: Math.round(temperature * 10) / 10,
    })
  }
  
  return data
}

export function getMockImpactData(regionId?: string): ImpactData[] {
  const regions = regionId 
    ? SOMALIA_REGIONS_DATA.filter(r => r.id === regionId)
    : SOMALIA_REGIONS_DATA

  return regions.map(region => {
    let foodPhase: ImpactData['foodInsecurityPhase'] = 'minimal'
    let malnutritionRisk: ImpactData['malnutritionRisk'] = 'low'
    
    if (region.droughtLevel === 'emergency') {
      foodPhase = 'emergency'
      malnutritionRisk = 'high'
    } else if (region.droughtLevel === 'warning') {
      foodPhase = 'crisis'
      malnutritionRisk = 'medium'
    } else if (region.droughtLevel === 'watch') {
      foodPhase = 'stressed'
      malnutritionRisk = 'low'
    }

    return {
      region: region.name,
      populationAffected: region.affectedPopulation,
      displacedHouseholds: Math.round(region.affectedPopulation * 0.15 / 6), // Assuming avg 6 per household
      foodInsecurityPhase: foodPhase,
      malnutritionRisk: malnutritionRisk,
    }
  })
}

export function getMockPredictions(regionId?: string): Prediction[] {
  const regions = regionId 
    ? SOMALIA_REGIONS_DATA.filter(r => r.id === regionId)
    : SOMALIA_REGIONS_DATA.filter(r => r.droughtLevel === 'emergency' || r.droughtLevel === 'warning')

  return regions.map(region => {
    let riskLevel: Prediction['riskLevel'] = 'low'
    let factors: string[] = []
    
    if (region.droughtLevel === 'emergency') {
      riskLevel = 'critical'
      factors = [
        'Continued rainfall failure expected',
        'High temperature anomalies',
        'Depleted water sources',
        'Livestock mortality increasing',
      ]
    } else if (region.droughtLevel === 'warning') {
      riskLevel = 'high'
      factors = [
        'Below-average rainfall forecast',
        'Rising temperatures',
        'Water stress increasing',
      ]
    } else {
      riskLevel = 'medium'
      factors = [
        'Uncertain rainfall patterns',
        'Moderate temperature increase',
      ]
    }

    return {
      region: region.name,
      riskLevel: riskLevel,
      timeframe: 'Next 60-90 days',
      confidence: riskLevel === 'critical' ? 85 : riskLevel === 'high' ? 75 : 60,
      factors: factors,
    }
  })
}

