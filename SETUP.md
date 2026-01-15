# Setup Guide

Complete setup instructions for the Somalia Drought Monitoring Dashboard.

## Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** (local or MongoDB Atlas)
- **Git**

## Step 1: Clone and Install Dependencies

### Frontend
```bash
cd frontend
npm install
```

### Backend
```bash
cd backend
npm install
```

### Data Processing
```bash
cd data-processing
pip install -r requirements.txt
```

## Step 2: Database Setup

1. **Install MongoDB**
   - **Option A: Local MongoDB**
     - Windows: Download from [MongoDB website](https://www.mongodb.com/try/download/community)
     - macOS: `brew install mongodb-community`
     - Linux: `sudo apt-get install mongodb`
   
   - **Option B: MongoDB Atlas (Cloud - Recommended)**
     - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
     - Create a free cluster
     - Get your connection string

2. **Start MongoDB** (if using local)
   ```bash
   # Windows (if installed as service, it starts automatically)
   # Or run: mongod
   
   # macOS/Linux
   brew services start mongodb-community
   # or
   sudo systemctl start mongod
   ```

3. **No schema migration needed!** MongoDB is schema-less. Models are defined in code.

## Step 3: Configure Environment Variables

### Backend (.env)
Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/drought_monitoring
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/drought_monitoring
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

## Step 4: Run the Application

### Terminal 1: Backend
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:5000

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:3000

## Step 5: Seed Database (Optional)

To populate MongoDB with initial mock data:

```bash
cd backend
npm run seed
```

This will add all 17 Somalia regions with sample data to your database.

**Note:** Python data processing scripts are optional. The backend works with mock data by default. You can add real data through the API endpoints or by updating the MongoDB collections directly.

## Development Notes

- The backend currently uses mock data for demonstration
- To connect real data sources, update the data ingestion scripts with actual API endpoints
- The ML prediction model needs historical training data
- Map coordinates are simplified - replace with actual GeoJSON boundaries

## Troubleshooting

### Map not loading
- Ensure Leaflet CSS is loaded (check `index.html`)
- Check browser console for CORS errors

### API errors
- Verify backend is running on port 5000
- Check CORS settings in backend
- Ensure `.env` files are configured correctly

### Database connection errors
- Verify MongoDB is running (if using local)
- Check MONGODB_URI in backend/.env
- For MongoDB Atlas, ensure your IP is whitelisted
- Test connection: `mongosh` (local) or check Atlas dashboard

## Next Steps

1. **Connect Real Data Sources**
   - Configure CHIRPS API access
   - Set up NASA MODIS/Sentinel API keys
   - Integrate FEWS NET data feeds

2. **Add Real GeoJSON Boundaries**
   - Replace simplified coordinates with actual Somalia region boundaries
   - Use OpenStreetMap or official government data

3. **Train ML Model**
   - Collect historical drought data
   - Train prediction model with real data
   - Validate model accuracy

4. **Deploy**
   - Set up production database
   - Deploy backend to cloud (AWS, GCP, Azure)
   - Deploy frontend to hosting service (Vercel, Netlify)

