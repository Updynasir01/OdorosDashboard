import { useEffect, useState } from 'react'
import { Droplets, Leaf, Thermometer, Waves, Activity, Sprout } from 'lucide-react'
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
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
      {displayIndicators.map((indicator) => {
        const Icon = iconMap[indicator.id as keyof typeof iconMap] || Droplets
        const deviation =
          indicator.historicalAverage === 0
            ? 0
            : ((indicator.value - indicator.historicalAverage) / indicator.historicalAverage) * 100

        return (
          <div
            key={indicator.id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className="w-5 h-5 text-blue-600" />
              <span className={`text-lg font-bold ${getTrendColor(indicator.trend)}`}>
                {getTrendIcon(indicator.trend)}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">
              {t(`indicators.${indicator.id}`)}
            </h3>
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
          </div>
        )
      })}
    </div>
  )
}

export default IndicatorsPanel

