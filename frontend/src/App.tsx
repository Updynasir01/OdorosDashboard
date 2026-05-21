import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import AgMetDashboard from './pages/AgMetDashboard'
import TradeFlowPage from './pages/TradeFlowPage'
import { LanguageProvider } from './contexts/LanguageContext'
import './App.css'

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/odoros" element={<AgMetDashboard />} />
          <Route path="/trade" element={<TradeFlowPage />} />
          <Route path="/agmet" element={<Navigate to="/odoros" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App

