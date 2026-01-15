import { useEffect, useState } from 'react'
import { AlertTriangle, Droplets, Leaf, Thermometer, Waves } from 'lucide-react'
import { Alert } from '../types'
import { apiService } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'

interface AlertsPanelProps {
  regionId?: string
}

const alertIcons = {
  rainfall: Droplets,
  vegetation: Leaf,
  heat: Thermometer,
  water: Waves,
}

const severityColors = {
  low: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  medium: 'bg-orange-100 text-orange-800 border-orange-300',
  high: 'bg-red-100 text-red-800 border-red-300',
  critical: 'bg-red-200 text-red-900 border-red-400',
}

function AlertsPanel({ regionId }: AlertsPanelProps) {
  const { t } = useLanguage()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAlerts()
  }, [regionId])

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAlerts(regionId)
      setAlerts(data)
    } catch (error) {
      console.error('Failed to load alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{t('alerts.title')}</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-6 h-6 text-red-600" />
        <h2 className="text-xl font-semibold">{t('alerts.title')}</h2>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No active alerts</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {alerts.map((alert) => {
            const Icon = alertIcons[alert.type] || AlertTriangle

            return (
              <div
                key={alert.id}
                className={`border-l-4 rounded p-3 ${severityColors[alert.severity]}`}
              >
                <div className="flex items-start gap-2">
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{alert.region}</span>
                      <span className="text-xs">
                        {new Date(alert.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{alert.message}</p>
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded bg-white/50">
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AlertsPanel

