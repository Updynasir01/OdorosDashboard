# 🌱 How to Seed More Data (Free Render Compatible)

Since you're using **free Render**, you can't easily use the shell. Here are **easy ways** to seed data using HTTP endpoints!

---

## ✅ Everything is OK!

Your application is working correctly:
- ✅ Frontend: `https://droughts.vercel.app` - Working
- ✅ Backend: `https://droughts.onrender.com` - Working
- ✅ CORS: Fixed - Frontend can connect to backend
- ✅ Status endpoint: Working (`/api/data-ingestion/status`)

---

## 🚀 Quick Actions (After Render Redeploys)

Wait 2-3 minutes for Render to redeploy with the new endpoints, then:

### 1. Seed Database with Regions

**Option A: Using Browser (Easiest!)**
```
https://droughts.onrender.com/api/data-ingestion/seed
```

**Option B: Force Replace Existing Data**
```
https://droughts.onrender.com/api/data-ingestion/seed?force=true
```

This will:
- Add 18 Somalia regions with initial data
- Works instantly - no shell needed!

### 2. Trigger Data Ingestion (Fetch Real Data)

**Using Browser:**
```
https://droughts.onrender.com/api/data-ingestion/trigger
```

This will:
- Fetch CHIRPS rainfall data
- Fetch NASA MODIS NDVI data
- Process and store in MongoDB
- Runs in background (check status with `/status`)

**Check Progress:**
```
https://droughts.onrender.com/api/data-ingestion/status
```

---

## 📋 Complete List of Endpoints

### Data Ingestion
- **GET** `/api/data-ingestion/trigger` - Start data ingestion (easy browser access)
- **POST** `/api/data-ingestion/ingest/all` - Start data ingestion (for API calls)
- **GET** `/api/data-ingestion/status` - Check ingestion job status

### Database Seeding
- **GET** `/api/data-ingestion/seed` - Seed regions (if database is empty)
- **GET** `/api/data-ingestion/seed?force=true` - Force replace all regions
- **POST** `/api/data-ingestion/seed` - Same as GET (for API calls)

### Testing
- **GET** `/api/data-ingestion/test/all` - Test all API connections
- **GET** `/api/data-ingestion/hdx/search?q=somalia` - Search HDX datasets

---

## 🎯 Recommended Workflow

### Step 1: Seed Initial Regions
1. Visit: `https://droughts.onrender.com/api/data-ingestion/seed`
2. You should see: `{"success":true,"message":"Seeded 18 regions successfully"}`

### Step 2: Trigger Data Ingestion
1. Visit: `https://droughts.onrender.com/api/data-ingestion/trigger`
2. You should see: `{"message":"Data ingestion started in background..."}`

### Step 3: Check Progress
1. Visit: `https://droughts.onrender.com/api/data-ingestion/status`
2. Wait a few minutes, refresh to see progress
3. When status is `"completed"`, data is ready!

### Step 4: Refresh Frontend
1. Visit: `https://droughts.vercel.app`
2. Dashboard should show updated data

---

## 🔧 Alternative: Using curl (Command Line)

If you prefer command line:

```bash
# Seed database
curl https://droughts.onrender.com/api/data-ingestion/seed

# Trigger data ingestion
curl https://droughts.onrender.com/api/data-ingestion/trigger

# Check status
curl https://droughts.onrender.com/api/data-ingestion/status
```

---

## 📊 What Data Gets Seeded?

The seed endpoint adds:
- **18 Somalia regions** with:
  - Region names (English & Somali)
  - Coordinates (for map display)
  - Drought levels (normal, watch, warning, emergency)
  - Rainfall deficit percentages
  - NDVI values
  - Temperature anomalies
  - Water scarcity percentages
  - Livestock risk percentages
  - Affected population numbers

---

## 🆘 Troubleshooting

### "Database already has X regions"
- Add `?force=true` to replace: `/api/data-ingestion/seed?force=true`

### Data ingestion not starting
- Check Render logs for errors
- Verify NASA_BEARER_TOKEN is set in Render environment variables
- Wait a few minutes and check `/status` again

### No data showing on frontend
1. Make sure regions are seeded: `/api/data-ingestion/seed`
2. Trigger data ingestion: `/api/data-ingestion/trigger`
3. Wait for completion: Check `/api/data-ingestion/status`
4. Refresh frontend

---

## ✅ You're All Set!

After Render redeploys (2-3 minutes), you can:
1. Seed regions instantly via browser
2. Trigger data ingestion via browser
3. Check status anytime
4. No shell access needed! 🎉

