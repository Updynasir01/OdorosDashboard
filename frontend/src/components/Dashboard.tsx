import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { Region } from '../types'
import TopBar from './TopBar'
import InteractiveMap from './InteractiveMap'
import IndicatorsPanel from './IndicatorsPanel'
import TimeSeriesAnalytics from './TimeSeriesAnalytics'
import AlertsPanel from './AlertsPanel'
import ImpactLayer from './ImpactLayer'
import PredictionsPanel from './PredictionsPanel'
import AgMetPanel from './AgMetPanel'
import { apiService } from '../services/api'

function Dashboard() {
  const { t } = useLanguage()
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRegions()
  }, [])

  const loadRegions = async () => {
    try {
      const data = await apiService.getRegions()
      setRegions(data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load regions:', error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#05556c' }}>
          {t('dashboard.title')}
        </h1>

        {/* Indicators Panel */}
        <IndicatorsPanel regionId={selectedRegion || undefined} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Interactive Map - Takes 2 columns */}
          <div className="lg:col-span-2">
            <InteractiveMap
              regions={regions}
              selectedRegion={selectedRegion}
              onRegionSelect={setSelectedRegion}
              loading={loading}
            />
          </div>

          {/* Alerts Panel - Takes 1 column */}
          <div className="lg:col-span-1">
            <AlertsPanel regionId={selectedRegion || undefined} />
          </div>
        </div>

        {/* Time Series Analytics */}
        <div className="mt-6">
          <TimeSeriesAnalytics regionId={selectedRegion || undefined} />
        </div>

        {/* AgMet (Real EO charts) */}
        <div className="mt-6">
          <AgMetPanel regionId={selectedRegion || undefined} />
        </div>

        {/* Impact & Vulnerability */}
        <div className="mt-6">
          <ImpactLayer regionId={selectedRegion || undefined} />
        </div>

        {/* AI Predictions */}
        <div className="mt-6">
          <PredictionsPanel regionId={selectedRegion || undefined} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard

