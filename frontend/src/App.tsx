import Dashboard from './components/Dashboard'
import { LanguageProvider } from './contexts/LanguageContext'
import './App.css'

function App() {
  return (
    <LanguageProvider>
      <Dashboard />
    </LanguageProvider>
  )
}

export default App

