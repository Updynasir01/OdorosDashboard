import { useState } from 'react'
import TopBar from '../components/TopBar'
import FewsIpcMap from '../components/fews/FewsIpcMap'
import IpcPopulationChart from '../components/fews/IpcPopulationChart'
import MarketPriceChart from '../components/fews/MarketPriceChart'

export default function FewsNetPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#05556c' }}>
            FEWS NET — Food security &amp; markets
          </h1>
          <p className="text-gray-600 mt-2 max-w-3xl">
            Acute food insecurity (IPC), population in crisis, and market price trends for Somalia. IPC map and market
            prices use the Harvest Portal API; population chart uses FEWS NET when credentials are configured.
          </p>
          <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            <strong>API keys:</strong> Set <code className="bg-blue-100 px-1 rounded">HARVEST_PORTAL_API_KEY</code> in
            backend/.env for IPC map and market prices. Optional{' '}
            <code className="bg-blue-100 px-1 rounded">FEWS_JWT_TOKEN</code> for the population chart.
          </div>
        </div>
        <FewsIpcMap />
        <IpcPopulationChart />
        <MarketPriceChart />
      </div>
    </div>
  )
}
