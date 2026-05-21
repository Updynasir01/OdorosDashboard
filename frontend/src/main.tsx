import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Clean up stale service workers that can serve old JS bundles
// and break API URLs (e.g. relative /models instead of full ResourceTrade URL).
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister().catch(() => {})
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

