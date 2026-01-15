import { useEffect, useState } from 'react'
import { Users, Home, UtensilsCrossed, Heart } from 'lucide-react'
import { ImpactData } from '../types'
import { apiService } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'

interface ImpactLayerProps {
  regionId?: string
}

const phaseColors = {
  minimal: 'bg-green-100 text-green-800',
  stressed: 'bg-yellow-100 text-yellow-800',
  crisis: 'bg-orange-100 text-orange-800',
  emergency: 'bg-red-100 text-red-800',
  famine: 'bg-red-200 text-red-900',
}

const riskColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
}

function ImpactLayer({ regionId }: ImpactLayerProps) {
  const { t } = useLanguage()
  const [impactData, setImpactData] = useState<ImpactData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadImpactData()
  }, [regionId])

  const loadImpactData = async () => {
    try {
      setLoading(true)
      const data = await apiService.getImpactData(regionId)
      setImpactData(data)
    } catch (error) {
      console.error('Failed to load impact data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{t('impact.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">{t('impact.title')}</h2>

      {impactData.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No impact data available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {impactData.map((impact, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-3">{impact.region}</h3>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Population Affected</p>
                    <p className="font-semibold">{impact.populationAffected.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">Displaced Households</p>
                    <p className="font-semibold">{impact.displacedHouseholds.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-500">Food Insecurity</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${phaseColors[impact.foodInsecurityPhase]}`}>
                      {impact.foodInsecurityPhase.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-xs text-gray-500">Malnutrition Risk</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${riskColors[impact.malnutritionRisk]}`}>
                      {impact.malnutritionRisk.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImpactLayer

