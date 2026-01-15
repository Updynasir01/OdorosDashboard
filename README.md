# Somalia Drought Monitoring Dashboard

A comprehensive full-stack dashboard for monitoring drought conditions across Somalia, providing real-time data visualization, early warning alerts, and predictive analytics.

## Features

- 🗺️ **Interactive Map**: Color-coded regions showing drought severity levels
- 📊 **Drought Indicators**: Real-time metrics (Rainfall, NDVI, Temperature, Water Scarcity)
- 📈 **Time-Series Analytics**: Historical trends and comparisons
- 🚨 **Early Warning System**: Automated alerts for drought conditions
- 👥 **Impact & Vulnerability**: Population affected, IDPs, food security
- 🧠 **AI Predictions**: 1-3 month drought risk forecasting

## Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Leaflet/Mapbox for maps
- Recharts for data visualization

### Backend
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- REST API

### Data Processing (Optional)
- Python scripts available for data ingestion (CHIRPS, NASA MODIS, FEWS NET)
- Can also use Node.js scripts or direct API integration

## Project Structure

```
Droughts/
├── frontend/          # React application
├── backend/           # Express API server
├── data-processing/   # Python scripts for data ingestion
└── docs/             # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### Installation

1. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Configure database connection in .env
npm run dev
```

2. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

3. **Data Processing Setup**
```bash
cd data-processing
pip install -r requirements.txt
```

## Data Sources

- CHIRPS (Climate Hazards Group InfraRed Precipitation with Station data)
- NASA MODIS / Sentinel (NDVI)
- FEWS NET (Famine Early Warning Systems Network)
- FAO Somalia
- UN OCHA

## Production Considerations

### Real Data Integration

The current implementation uses mock data for demonstration. To deploy with real data:

1. **CHIRPS API**: Register at [CHC UCSB](https://data.chc.ucsb.edu/) for rainfall data
2. **NASA MODIS**: Use [NASA Earthdata](https://earthdata.nasa.gov/) for NDVI data
3. **FEWS NET**: Access FEWS NET data feeds for food security indicators
4. **GeoJSON Boundaries**: Replace simplified coordinates with actual Somalia administrative boundaries from:
   - [Humanitarian Data Exchange (HDX)](https://data.humdata.org/)
   - [OpenStreetMap](https://www.openstreetmap.org/)
   - Official Somali government sources

### ML Model Training

The prediction model needs historical training data:
- Collect 5+ years of historical drought data
- Include rainfall, NDVI, temperature, and actual drought classifications
- Train and validate model before production use

### Deployment

Recommended deployment stack:
- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: AWS EC2, Google Cloud Run, or Azure App Service
- **Database**: AWS RDS, Google Cloud SQL, or Azure Database for PostgreSQL
- **Data Processing**: AWS Lambda, Google Cloud Functions, or scheduled cron jobs

## License

MIT

