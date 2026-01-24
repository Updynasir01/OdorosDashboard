import { useEffect, useState } from 'react'
import { Brain, TrendingUp, AlertCircle } from 'lucide-react'
import { Prediction } from '../types'
import { apiService } from '../services/api'

interface PredictionsPanelProps {
  regionId?: string
}

const riskColors = {
  low: 'bg-green-100 text-green-800 border-green-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  critical: 'bg-red-100 text-red-800 border-red-300',
}

function PredictionsPanel({ regionId }: PredictionsPanelProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPredictions()
  }, [regionId])

  const loadPredictions = async () => {
    try {
      setLoading(true)
      const data = await apiService.getPredictions(regionId)
      setPredictions(data)
    } catch (error) {
      console.error('Failed to load predictions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold">AI Predictions</h2>
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-semibold">AI Predictions</h2>
        <span className="text-sm text-gray-500">(1-3 months ahead)</span>
      </div>

      {predictions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No predictions available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predictions.map((prediction) => (
            <div
              key={prediction.region}
              className={`border-l-4 rounded-lg p-4 ${riskColors[prediction.riskLevel]}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{prediction.region}</h3>
                {prediction.riskLevel === 'high' || prediction.riskLevel === 'critical' ? (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <TrendingUp className="w-5 h-5 flex-shrink-0" />
                )}
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-700 mb-1">Risk Level:</p>
                <span className="inline-block px-3 py-1 text-sm font-bold rounded bg-white/50">
                  {prediction.riskLevel.toUpperCase()}
                </span>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-700 mb-1">Timeframe:</p>
                <p className="font-medium">{prediction.timeframe}</p>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-700 mb-1">Confidence:</p>
                <div className="w-full bg-white/50 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${prediction.confidence}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-1">{prediction.confidence}%</p>
              </div>

              <div>
                <p className="text-sm text-gray-700 mb-1">Key Factors:</p>
                <ul className="list-disc list-inside text-xs space-y-1">
                  {prediction.factors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PredictionsPanel

