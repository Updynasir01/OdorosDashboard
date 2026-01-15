# 🚀 Switch Your Dashboard to Real Data

## Current Status
Your dashboard is currently showing **mock data** (sample data for testing).

## How to Switch to Real Data

### Step 1: Make Sure MongoDB is Running

**Option A: Local MongoDB**
```bash
# If you have MongoDB installed locally, start it:
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Update `backend/.env` with your MongoDB Atlas connection string:
  ```
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/drought_monitoring
  ```

### Step 2: Start Your Backend Server

```bash
cd backend
npm run dev
```

Make sure your `.env` file has:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/drought_monitoring
NASA_BEARER_TOKEN=your_token_here
```

### Step 3: Seed Initial Regions (One-Time Setup)

First, populate your database with Somalia regions:

```bash
cd backend
npm run seed
```

Or manually:
```bash
npx ts-node src/scripts/seedDatabase.ts
```

### Step 4: Trigger Real Data Ingestion

**Option A: Using Browser**
1. Open: `http://localhost:5000/api/data-ingestion/ingest/all`
2. Or use a tool like Postman to send a POST request

**Option B: Using PowerShell**
```powershell
curl -X POST http://localhost:5000/api/data-ingestion/ingest/all
```

**Option C: Using Browser (GET request for testing)**
```
http://localhost:5000/api/data-ingestion/test/all
```

### Step 5: Verify Real Data is Loading

1. Check your backend console - you should see:
   ```
   🚀 Starting data ingestion from all sources...
   📊 Fetching CHIRPS rainfall data...
   🌱 Fetching NASA MODIS NDVI data...
   ```

2. Refresh your dashboard - it should now show real data!

## What Happens During Data Ingestion?

The system will:
1. ✅ Fetch rainfall data from CHIRPS
2. ✅ Fetch vegetation (NDVI) data from NASA MODIS
3. ✅ Fetch food security data from FEWS NET
4. ✅ Fetch humanitarian data from HDX
5. ✅ Store all data in MongoDB
6. ✅ Update regions with latest indicators

## Troubleshooting

### Still seeing mock data?
- Check MongoDB connection: `http://localhost:5000/api/health`
- Verify data ingestion ran: Check backend console logs
- Check MongoDB: Make sure regions exist in database

### Data ingestion fails?
- Check your `.env` file has `NASA_BEARER_TOKEN`
- Make sure MongoDB is running
- Check internet connection (APIs need internet)

### Want to go back to mock data?
- Just delete data from MongoDB or stop the ingestion

## Schedule Automatic Updates

To keep data fresh, you can set up a cron job or scheduled task:

```bash
# Run every day at 2 AM
0 2 * * * curl -X POST http://localhost:5000/api/data-ingestion/ingest/all
```

Or use a Node.js scheduler like `node-cron` in your backend.

