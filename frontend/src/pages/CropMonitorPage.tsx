import { useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import CropConditionsViewer from '../components/cropMonitor/CropConditionsViewer'
import CropMonitorEventsTable from '../components/cropMonitor/CropMonitorEventsTable'

export default function CropMonitorPage() {
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
            GEOGLAM Crop Monitor
          </h1>
          <p className="text-gray-600 mt-2 max-w-3xl">
            Somalia crop condition layers and reported Crop Monitor events — from NASA Harvest2Market reference modules
            (public ArcGIS / CMET services).
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Also see{' '}
            <Link to="/odoros" className="text-[#05556c] underline">
              Odoros AgMet charts
            </Link>{' '}
            for gobol-level maize indicators.
          </p>
        </div>
        <CropConditionsViewer />
        <CropMonitorEventsTable />
      </div>
    </div>
  )
}
