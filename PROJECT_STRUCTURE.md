# Project Structure

```
Droughts/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── InteractiveMap.tsx
│   │   │   ├── IndicatorsPanel.tsx
│   │   │   ├── TimeSeriesAnalytics.tsx
│   │   │   ├── AlertsPanel.tsx
│   │   │   ├── ImpactLayer.tsx
│   │   │   └── PredictionsPanel.tsx
│   │   ├── contexts/         # React contexts
│   │   │   └── LanguageContext.tsx
│   │   ├── services/         # API services
│   │   │   └── api.ts
│   │   ├── types/            # TypeScript types
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── tailwind.config.js
│
├── backend/                  # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   │   ├── regionsController.ts
│   │   │   ├── indicatorsController.ts
│   │   │   ├── alertsController.ts
│   │   │   ├── timeseriesController.ts
│   │   │   ├── impactController.ts
│   │   │   └── predictionsController.ts
│   │   ├── routes/           # API routes
│   │   │   ├── regions.ts
│   │   │   ├── indicators.ts
│   │   │   ├── alerts.ts
│   │   │   ├── timeseries.ts
│   │   │   ├── impact.ts
│   │   │   └── predictions.ts
│   │   ├── data/             # Mock data (for development)
│   │   │   └── mockData.ts
│   │   ├── types/            # TypeScript types
│   │   │   └── index.ts
│   │   └── index.ts          # Express server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── data-processing/          # Python data ingestion scripts
│   ├── ingest_chirps.py      # CHIRPS rainfall data
│   ├── ingest_ndvi.py        # NDVI vegetation data
│   ├── process_drought_indicators.py
│   ├── predict_drought.py    # ML prediction model
│   ├── requirements.txt
│   └── README.md
│
├── database/                 # Database schema
│   └── schema.sql            # PostgreSQL + PostGIS schema
│
├── README.md                 # Main project README
├── SETUP.md                  # Setup instructions
└── .gitignore
```

## Key Features by Component

### Frontend Components

- **Dashboard**: Main layout and orchestration
- **TopBar**: Region selector, date range, language switcher
- **InteractiveMap**: Leaflet map with color-coded regions
- **IndicatorsPanel**: Real-time drought metrics cards
- **TimeSeriesAnalytics**: Historical trend charts
- **AlertsPanel**: Early warning alerts display
- **ImpactLayer**: Population and vulnerability data
- **PredictionsPanel**: AI-powered drought forecasts

### Backend API Endpoints

- `GET /api/regions` - Get all regions
- `GET /api/regions/:id` - Get region details
- `GET /api/indicators` - Get drought indicators
- `GET /api/alerts` - Get alerts
- `GET /api/timeseries/:regionId` - Get time series data
- `GET /api/impact` - Get impact data
- `GET /api/predictions` - Get AI predictions

### Data Processing

- **CHIRPS Ingestion**: Rainfall data processing
- **NDVI Ingestion**: Vegetation health data
- **Indicator Processing**: Calculate drought levels
- **ML Prediction**: Random Forest model for forecasting

