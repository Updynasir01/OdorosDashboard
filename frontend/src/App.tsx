import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import AgMetDashboard from './pages/AgMetDashboard'
import TradeFlowPage from './pages/TradeFlowPage'
import CropMonitorPage from './pages/CropMonitorPage'
import FewsNetPage from './pages/FewsNetPage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminPanel from './pages/admin/AdminPanel'
import AdminRoute from './components/AdminRoute'
import { LanguageProvider } from './contexts/LanguageContext'
import { AdminProvider } from './contexts/AdminContext'
import './App.css'

function App() {
  return (
    <LanguageProvider>
      <AdminProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/odoros" element={<AgMetDashboard />} />
            <Route path="/trade" element={<TradeFlowPage />} />
            <Route path="/crop-monitor" element={<CropMonitorPage />} />
            <Route path="/fews" element={<FewsNetPage />} />
            <Route path="/agmet" element={<Navigate to="/odoros" replace />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </LanguageProvider>
  )
}

export default App

