import { useEffect, useState } from 'react'
import { Droplets, Leaf, Thermometer, Waves, Activity, Sprout, Layers, Sun } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DroughtIndicator } from '../types'
import { apiService } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'

interface IndicatorsPanelProps {
  regionId?: string
}

const iconMap = {
  rainfall: Droplets,
  vegetation: Leaf,
  temperature: Thermometer,
  water: Waves,
  livestock: Activity,
  crops: Sprout,
  'vegetation-preview': Leaf,
  'soil-moisture': Layers,
  evapotranspiration: Sun,
}

/** Demo-only metrics shown beside live NASA / GLAM cards for a fuller dashboard strip. */
const MOCKUP_EXTRA_INDICATORS: DroughtIndicator[] = [
  {
    id: 'soil-moisture',
    label: 'Soil Moisture',
    value: 0.31,
    historicalAverage: 0.36,
    trend: 'down',
    unit: 'm³/m³',
  },
  {
    id: 'evapotranspiration',
    label: 'Evapotranspiration',
    value: 5.4,
    historicalAverage: 4.9,
    trend: 'up',
    unit: 'mm/day',
  },
]

const NDVI_PREVIEW_MOCK: DroughtIndicator = {
  id: 'vegetation-preview',
  label: 'Vegetation Index (NDVI)',
  value: 0.42,
  historicalAverage: 0.38,
  trend: 'up',
  unit: '',
}

function IndicatorsPanel({ regionId }: IndicatorsPanelProps) {
  const { t } = useLanguage()
  const [indicators, setIndicators] = useState<DroughtIndicator[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIndicators()
  }, [regionId])

  const loadIndicators = async () => {
    try {
      setLoading(true)
      const data = await apiService.getIndicators(regionId)
      setIndicators(data)
    } catch (error) {
      console.error('Failed to load indicators:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↑'
      case 'down':
        return '↓'
      default:
        return '→'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (indicators.length === 0) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        No indicator data loaded. Check that the backend is running, <code className="rounded bg-amber-100 px-1">VITE_API_URL</code>{' '}
        points to it, and NASA POWER / GLAM are reachable. If the request timed out after 2 minutes, try selecting a
        single gobol (faster than &quot;All regions&quot;) or reload.
      </div>
    )
  }

  const vegetation = indicators.find((indicator) => indicator.id === 'vegetation')
  const displayIndicators = [...indicators]

  // Add a simple crop-condition card derived from NDVI so users can
  // quickly see crop health in percentage form.
  if (vegetation) {
    const cropValue = Math.max(0, Math.min(100, vegetation.value * 100))
    const cropAverage = Math.max(0, Math.min(100, vegetation.historicalAverage * 100))
    const cropTrend = cropValue >= cropAverage ? 'up' : 'down'

    displayIndicators.push({
      ...vegetation,
      id: 'crops',
      label: 'Crops',
      value: cropValue,
      historicalAverage: cropAverage,
      trend: cropTrend,
      unit: '%',
    })
  }

  const hasVegetation = indicators.some((i) => i.id === 'vegetation')
  const withMockups = [
    ...displayIndicators,
    ...(hasVegetation ? [] : [NDVI_PREVIEW_MOCK]),
    ...MOCKUP_EXTRA_INDICATORS,
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
      {withMockups.map((indicator) => {
        const Icon = iconMap[indicator.id as keyof typeof iconMap] || Droplets
        const isCropsCard = indicator.id === 'crops'
        const labelKey = `indicators.${indicator.id}`
        const translatedLabel = t(labelKey)
        const cardTitle =
          isCropsCard ? 'Odoros crop monitoring charts' : translatedLabel === labelKey ? indicator.label : translatedLabel
        const deviation =
          indicator.historicalAverage === 0
            ? 0
            : ((indicator.value - indicator.historicalAverage) / indicator.historicalAverage) * 100

        const card = (
          <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <Icon className={`${isCropsCard ? 'w-6 h-6' : 'w-5 h-5'} text-blue-600`} />
              <span className={`text-lg font-bold ${getTrendColor(indicator.trend)}`}>
                {getTrendIcon(indicator.trend)}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">{cardTitle}</h3>
            {isCropsCard ? (
              <div className="mt-3">
                <p className="text-sm text-gray-600">Open Maize 1/2 charts by gobol</p>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900">
                  {indicator.value.toFixed(1)}
                  <span className="text-sm text-gray-500 ml-1">{indicator.unit}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg: {indicator.historicalAverage.toFixed(1)} {indicator.unit}
                </p>
                <p className={`text-xs mt-1 ${deviation >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {deviation >= 0 ? '+' : ''}{deviation.toFixed(1)}% from average
                </p>
              </>
            )}
          </div>
        )

        return isCropsCard ? (
          <Link
            key={indicator.id}
            to="/odoros"
            className="block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
            title="Open Odoros crop monitoring"
          >
            {card}
          </Link>
        ) : (
          <div key={indicator.id}>{card}</div>
        )
      })}
    </div>
  )
}

export default IndicatorsPanel

