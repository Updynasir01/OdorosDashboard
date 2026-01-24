# Quick Start: Connecting to Real APIs

## Step 1: Set Up NASA Earthdata (For NDVI/Satellite Data)

1. **Go to:** https://urs.earthdata.nasa.gov/
2. **Click:** "Register" (top right)
3. **Fill in:** Your email, name, organization
4. **Verify:** Check your email and verify account
5. **Get credentials:** Username and password

**Add to `backend/.env`:**
```env
NASA_USERNAME=your_username_here
NASA_PASSWORD=your_password_here
```

## Step 2: Test HDX API (No Registration Needed!)

HDX is **completely free** and **no API key required**!

**Test it right now:**
```bash
# In your browser, visit:
https://data.humdata.org/api/3/action/package_search?q=somalia

# Or use curl:
curl "https://data.humdata.org/api/3/action/package_search?q=somalia"
```

You should see JSON data with Somalia datasets!

## Step 3: CHIRPS Data (No Registration Needed!)

CHIRPS is **completely open** - just download files!

**Direct access:**
- Website: https://data.chc.ucsb.edu/products/CHIRPS-2.0/
- FTP: `ftp://ftp.chg.ucsb.edu/pub/org/chg/products/CHIRPS-2.0/`

**Example file structure:**
```
https://data.chc.ucsb.edu/products/CHIRPS-2.0/global_daily/tifs/p05/2024/chirps-v2.0.2024.01.01.tif.gz
```

## Step 4: Test All APIs at Once! 🚀

1. **Start your backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Test ALL APIs in one request:**
   ```bash
   # In your browser, visit:
   http://localhost:5000/api/data-ingestion/test/all
   
   # Or use curl:
   curl http://localhost:5000/api/data-ingestion/test/all
   ```

   This will test:
   - ✅ NASA MODIS (with your token)
   - ✅ HDX API (no key needed)
   - ✅ CHIRPS (no key needed)
   - ✅ FEWS NET (public data)

3. **Test individual APIs:**
   ```bash
   # Test HDX search:
   curl http://localhost:5000/api/data-ingestion/hdx/search?q=somalia
   
   # Trigger full data ingestion:
   curl -X POST http://localhost:5000/api/data-ingestion/ingest/all
   ```

## Step 5: Set Up Scheduled Updates (Optional)

You can set up a cron job or scheduled task to automatically fetch new data:

**Using Node.js (node-cron):**
```bash
npm install node-cron
```
<!-- can we add a fund rising and citezen conturbution and social media engagement features and how can we add do we need that  before you a code give me anlyze and what do you think  -->

Then create a scheduler script that runs `ingestAllData()` daily.

## What Works Right Now (No Setup Needed)

✅ **HDX API** - Works immediately, no keys needed
✅ **CHIRPS** - Files available, just need to download/process
✅ **FEWS NET** - Public data, may need to download files

## What Needs Setup

⚠️ **NASA MODIS** - Requires free Earthdata account (5 minutes to set up)
⚠️ **Sentinel Hub** - Optional, easier API but requires account

## Next Steps

1. **Start with HDX** - It's the easiest and works immediately
2. **Set up NASA account** - Takes 5 minutes, enables satellite data
3. **Process CHIRPS files** - Download and process GeoTIFF files
4. **Integrate FEWS NET** - Download their CSV files and parse

## Need Help?

- Check `docs/API_SETUP.md` for detailed instructions
- Test endpoints are in `backend/src/routes/dataIngestion.ts`
- Service files are in `backend/src/services/dataIngestion/`

