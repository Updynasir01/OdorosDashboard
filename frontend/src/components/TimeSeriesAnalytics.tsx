import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TimeSeriesData } from '../types'
import { apiService } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'
import { Download } from 'lucide-react'

interface TimeSeriesAnalyticsProps {
  regionId?: string
}

function TimeSeriesAnalytics({ regionId }: TimeSeriesAnalyticsProps) {
  const { t } = useLanguage()
  const [data, setData] = useState<TimeSeriesData[]>([])
  const [loading, setLoading] = useState(true)
  const [months, setMonths] = useState(12)

  useEffect(() => {
    if (regionId) {
      loadTimeSeries()
    }
  }, [regionId, months])

  const loadTimeSeries = async () => {
    if (!regionId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const timeSeriesData = await apiService.getTimeSeries(regionId, months)
      setData(timeSeriesData)
    } catch (error) {
      console.error('Failed to load time series:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  const formatDateForCSV = (dateString: string) => {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  const chartData = data.map((item) => ({
    date: formatDate(item.date),
    Rainfall: item.rainfall,
    NDVI: item.ndvi,
    Temperature: item.temperature,
  }))

  const handleDownload = () => {
    if (data.length === 0) {
      alert('No data available to download')
      return
    }

    // Create CSV content
    const headers = ['Date', 'Rainfall (mm)', 'NDVI', 'Temperature (°C)']
    const csvRows = [
      headers.join(','),
      ...data.map((item) => {
        return [
          formatDateForCSV(item.date),
          item.rainfall?.toFixed(2) || '',
          item.ndvi?.toFixed(3) || '',
          item.temperature?.toFixed(2) || '',
        ].join(',')
      }),
    ]

    const csvContent = csvRows.join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `time-series-data-${regionId}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  if (!regionId) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{t('analytics.title')}</h2>
        <p className="text-gray-500">Select a region to view time-series analytics</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{t('analytics.title')}</h2>
        <div className="h-64 flex items-center justify-center">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t('analytics.title')}</h2>
        <div className="flex items-center gap-4">
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05556c]"
          >
            <option value={3}>Last 3 months</option>
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
          </select>
          <button
            onClick={handleDownload}
            disabled={data.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#05556c' }}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="Rainfall"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Rainfall (mm)"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="NDVI"
            stroke="#10b981"
            strokeWidth={2}
            name="NDVI"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="Temperature"
            stroke="#ef4444"
            strokeWidth={2}
            name="Temperature (°C)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default TimeSeriesAnalytics

