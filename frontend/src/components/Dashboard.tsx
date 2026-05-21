import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Facebook, Youtube, Linkedin, Mail } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { Region } from '../types'
import TopBar from './TopBar'
import InteractiveMap from './InteractiveMap'
import IndicatorsPanel from './IndicatorsPanel'
import TimeSeriesAnalytics from './TimeSeriesAnalytics'
import AlertsPanel from './AlertsPanel'
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
      </div>

      <footer className="mt-8">
        <div className="container mx-auto px-4 pb-6">
          <div className="rounded-2xl bg-[#045D57] text-white shadow-xl overflow-hidden">
            <div className="px-6 md:px-8 py-8 md:py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <p className="text-3xl font-semibold mb-4">Stay in touch</p>
                <div className="flex items-center gap-3 mb-4">
                  <a href="#" className="p-2 rounded-md bg-white/10 hover:bg-white/20"><Mail className="w-4 h-4" /></a>
                  <a href="#" className="p-2 rounded-md bg-white/10 hover:bg-white/20"><Youtube className="w-4 h-4" /></a>
                  <a href="#" className="p-2 rounded-md bg-white/10 hover:bg-white/20"><Instagram className="w-4 h-4" /></a>
                  <a href="#" className="p-2 rounded-md bg-white/10 hover:bg-white/20"><Facebook className="w-4 h-4" /></a>
                  <a href="#" className="p-2 rounded-md bg-white/10 hover:bg-white/20"><Linkedin className="w-4 h-4" /></a>
                </div>
                <div className="flex flex-col items-start gap-3">
                  <img src="/irisehub-logo.jpeg" alt="IriseHub" className="h-8 w-auto object-contain" />
                  <img src="/odorosLogo.jpeg" alt="Odoros" className="h-12 w-auto object-contain mix-blend-screen opacity-95" />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-3">Product</p>
                <div className="space-y-2 text-sm">
                  <Link to="/" className="block hover:underline">Drought dashboard</Link>
                  <Link to="/odoros" className="block hover:underline">Odoros crop charts</Link>
                  <Link to="/trade" className="block hover:underline">Trade flows</Link>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-3">Platform</p>
                <div className="space-y-2 text-sm">
                  <a href="#" className="block hover:underline">Automation</a>
                  <a href="#" className="block hover:underline">Integrations</a>
                  <a href="#" className="block hover:underline">Analytics</a>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-3">Company</p>
                <div className="space-y-2 text-sm">
                  <a href="#" className="block hover:underline">About</a>
                  <a href="#" className="block hover:underline">Knowledge base</a>
                  <a href="#" className="block hover:underline">Contact</a>
                </div>
              </div>
            </div>

            <div className="border-t border-white/20 px-6 md:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3">
                <p className="text-sm text-white/80">All rights reserved · {new Date().getFullYear()}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-white/70">
                <a href="#" className="hover:text-white">Privacy policy</a>
                <a href="#" className="hover:text-white">Terms</a>
                <a href="#" className="hover:text-white">Cookie policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Dashboard

