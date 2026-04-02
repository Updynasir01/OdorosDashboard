import { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'en' | 'so'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations: Record<Language, Record<string, string>> = {
  en: {
    'dashboard.title': 'Somalia Drought Monitoring Dashboard',
    'dashboard.region': 'Region',
    'dashboard.dateRange': 'Date Range',
    'drought.normal': 'Normal',
    'drought.watch': 'Watch',
    'drought.warning': 'Warning',
    'drought.emergency': 'Emergency',
    'indicators.rainfall': 'Rainfall Anomaly',
    'indicators.vegetation': 'Vegetation Index (NDVI)',
    'indicators.temperature': 'Temperature Anomaly',
    'indicators.water': 'Water Scarcity',
    'indicators.livestock': 'Livestock Risk',
    'indicators.crops': 'Crops',
    'map.clickRegion': 'Click a region for details',
    'alerts.title': 'Early Warning Alerts',
    'analytics.title': 'Time-Series Analytics',
    'impact.title': 'Impact & Vulnerability',
  },
  so: {
    'dashboard.title': 'Shaashadda Daawashada Abaaraha Soomaaliya',
    'dashboard.region': 'Gobol',
    'dashboard.dateRange': 'Muddo',
    'drought.normal': 'Caadi',
    'drought.watch': 'Daawo',
    'drought.warning': 'Digniin',
    'drought.emergency': 'Degdeg',
    'indicators.rainfall': 'Khaladaadka Roobka',
    'indicators.vegetation': 'Tilmaamaha Dhirta (NDVI)',
    'indicators.temperature': 'Khaladaadka Heerkulka',
    'indicators.water': 'Yarida Biyaha',
    'indicators.livestock': 'Khatarta Xoolaha',
    'indicators.crops': 'Dalagyada',
    'map.clickRegion': 'Guji gobol si aad u hesho faahfaahin',
    'alerts.title': 'Digniimada Hore',
    'analytics.title': 'Falanqaynta Waqtiga',
    'impact.title': 'Saamaynta iyo Khatarta',
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

