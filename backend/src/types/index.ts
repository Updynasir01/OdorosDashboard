// Type definitions matching frontend types
export type DroughtLevel = 'normal' | 'watch' | 'warning' | 'emergency'

export interface Region {
  id: string
  name: string
  nameSomali: string
  coordinates: [number, number][]
  droughtLevel: DroughtLevel
  rainfallDeficit: number
  lastRainfallDate: string
  affectedPopulation: number
  ndvi: number
  temperatureAnomaly: number
  waterScarcity: number
  livestockRisk: number
}

export interface DroughtIndicator {
  id: string
  label: string
  value: number
  trend: 'up' | 'down' | 'stable'
  historicalAverage: number
  unit: string
}

export interface Alert {
  id: string
  region: string
  type: 'rainfall' | 'vegetation' | 'heat' | 'water'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  date: string
}

export interface TimeSeriesData {
  date: string
  rainfall: number
  ndvi: number
  temperature: number
}

export interface ImpactData {
  region: string
  populationAffected: number
  displacedHouseholds: number
  foodInsecurityPhase: 'minimal' | 'stressed' | 'crisis' | 'emergency' | 'famine'
  malnutritionRisk: 'low' | 'medium' | 'high'
}

export interface Prediction {
  region: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  timeframe: string
  confidence: number
  factors: string[]
}

