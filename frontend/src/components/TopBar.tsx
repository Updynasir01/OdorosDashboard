import { Globe } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

interface TopBarProps {
  selectedRegion: string | null
  onRegionChange: (region: string | null) => void
  dateRange: { start: string; end: string }
  onDateRangeChange: (range: { start: string; end: string }) => void
}

const SOMALIA_REGIONS = [
  { id: 'all', name: 'All Regions', nameSomali: 'Dhammaan Gobollada' },
  { id: 'awdal', name: 'Awdal', nameSomali: 'Awdal' },
  { id: 'banadir', name: 'Banadir', nameSomali: 'Banaadir' },
  { id: 'bay', name: 'Bay', nameSomali: 'Bay' },
  { id: 'bakool', name: 'Bakool', nameSomali: 'Bakool' },
  { id: 'hiiraan', name: 'Hiiraan', nameSomali: 'Hiiraan' },
  { id: 'middle-jubba', name: 'Middle Jubba', nameSomali: 'Jubada Dhexe' },
  { id: 'lower-jubba', name: 'Lower Jubba', nameSomali: 'Jubada Hoose' },
  { id: 'gedo', name: 'Gedo', nameSomali: 'Gedo' },
  { id: 'middle-shebelle', name: 'Middle Shebelle', nameSomali: 'Shabeellaha Dhexe' },
  { id: 'lower-shebelle', name: 'Lower Shebelle', nameSomali: 'Shabeellaha Hoose' },
  { id: 'galgaduud', name: 'Galgaduud', nameSomali: 'Galgaduud' },
  { id: 'mudug', name: 'Mudug', nameSomali: 'Mudug' },
  { id: 'nugaal', name: 'Nugaal', nameSomali: 'Nugaal' },
  { id: 'bari', name: 'Bari', nameSomali: 'Bari' },
  { id: 'sanaag', name: 'Sanaag', nameSomali: 'Sanaag' },
  { id: 'sool', name: 'Sool', nameSomali: 'Sool' },
  { id: 'togdheer', name: 'Togdheer', nameSomali: 'Togdheer' },
  { id: 'woqooyi-galbeed', name: 'Woqooyi Galbeed', nameSomali: 'Woqooyi Galbeed' },
]

const navLinkClass = (active: boolean) =>
  `text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
    active ? 'bg-[#05556c] text-white' : 'text-gray-700 hover:bg-gray-100'
  }`

function TopBar({ selectedRegion, onRegionChange, dateRange, onDateRangeChange }: TopBarProps) {
  const { language, setLanguage, t } = useLanguage()
  const location = useLocation()

  const today = new Date().toISOString().split('T')[0]
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  const defaultStart = threeMonthsAgo.toISOString().split('T')[0]

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateRangeChange({ ...dateRange, start: e.target.value })
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateRangeChange({ ...dateRange, end: e.target.value })
  }

  return (
    <div className="bg-white shadow-md border-b border-gray-200">
      <div className="h-1 w-full" style={{ backgroundColor: '#05556c' }}></div>
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center min-w-[220px]">
            <img
              src="/odoros-logo.png"
              alt="Odoros"
              className="h-14 w-auto object-contain"
            />
          </div>

          {/* Region Selector */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('dashboard.region')}
            </label>
            <select
              value={selectedRegion || 'all'}
              onChange={(e) => onRegionChange(e.target.value === 'all' ? null : e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05556c]"
            >
              {SOMALIA_REGIONS.map((region) => (
                <option key={region.id} value={region.id}>
                  {language === 'so' ? region.nameSomali : region.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="flex gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('dashboard.dateRange')} (Start)
              </label>
              <input
                type="date"
                value={dateRange.start || defaultStart}
                onChange={handleStartDateChange}
                max={today}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05556c]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('dashboard.dateRange')} (End)
              </label>
              <input
                type="date"
                value={dateRange.end || today}
                onChange={handleEndDateChange}
                max={today}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05556c]"
              />
            </div>
          </div>

          {/* Language Switch */}
          <div className="flex items-end">
            <button
              onClick={() => setLanguage(language === 'en' ? 'so' : 'en')}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-md transition-colors"
              style={{ backgroundColor: '#05556c' }}
              title="Switch Language"
            >
              <Globe className="w-5 h-5" />
              <span className="font-medium">{language === 'en' ? 'SO' : 'EN'}</span>
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: '#fbb03b' }}
              ></span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">Views</span>
          <Link to="/" className={navLinkClass(location.pathname === '/')}>
            Dashboard
          </Link>
          <Link to="/odoros" className={navLinkClass(location.pathname === '/odoros')}>
            Odoros crops
          </Link>
          <Link to="/crop-monitor" className={navLinkClass(location.pathname === '/crop-monitor')}>
            Crop Monitor
          </Link>
          <Link to="/fews" className={navLinkClass(location.pathname === '/fews')}>
            FEWS NET
          </Link>
          <Link to="/trade" className={navLinkClass(location.pathname === '/trade')}>
            Trade flows
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TopBar

