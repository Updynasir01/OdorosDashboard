# 🎉 Final Setup Steps

## ✅ What's Done
- ✅ Backend deployed on Render: `https://droughts.onrender.com`
- ✅ Frontend deployed on Vercel
- ✅ MongoDB Atlas connected
- ✅ TypeScript build fixed

---

## Step 1: Get Your Vercel URL

1. Go to your **Vercel Dashboard**: https://vercel.com/dashboard
2. Click on your **"droughts"** project
3. Copy your **production URL** (e.g., `https://droughts.vercel.app` or `https://droughts-git-master-xxx.vercel.app`)

**Your Vercel URL:** `___________________________` (fill this in)

---

## Step 2: Update CORS in Render

1. Go to **Render Dashboard**: https://dashboard.render.com
2. Click on your **backend service** (e.g., `somalia-drought-backend`)
3. Go to **"Environment"** tab (left sidebar)
4. Find the **`CORS_ORIGIN`** variable
5. Click **"Edit"** or the **pencil icon**
6. Update the value to your **Vercel URL**:
   ```
   https://your-vercel-url.vercel.app
   ```
   (Replace `your-vercel-url` with your actual Vercel URL)
7. Click **"Save Changes"**
8. Render will automatically redeploy (takes 2-3 minutes)

---

## Step 3: Test Your Application

### Test Backend:
Visit: `https://droughts.onrender.com/api/health`

You should see:
```json
{"status":"ok","message":"Somalia Drought Monitoring API"}
```

### Test Frontend:
1. Visit your **Vercel URL**
2. The dashboard should load
3. Check browser console (F12) for any errors
4. Try clicking on regions on the map

---

## Step 4: Seed the Database (Optional)

If you want to populate the database with initial data:

### Option A: Using Render Shell (Recommended)
1. Go to Render Dashboard → Your Service
2. Click **"Shell"** tab
3. Run:
   ```bash
   npm run seed
   ```

### Option B: Using Local Machine
1. Make sure your local `.env` has the MongoDB Atlas connection string
2. Run:
   ```bash
   cd backend
   npm run seed
   ```

---

## Step 5: Trigger Data Ingestion (Optional)

To fetch real-time data from NASA and other sources:

1. Visit your backend URL: `https://droughts.onrender.com/api/data-ingestion/trigger`
   - Or use: `https://droughts.onrender.com/api/data-ingestion/status` to check status

2. This will:
   - Fetch CHIRPS rainfall data
   - Fetch NASA MODIS NDVI data
   - Process and store in MongoDB

---

## 🎉 You're All Set!

Your full-stack application is now live:
- **Frontend:** `https://your-vercel-url.vercel.app`
- **Backend:** `https://droughts.onrender.com`
- **Database:** MongoDB Atlas

---

## 🆘 Troubleshooting

### Frontend can't connect to backend:
- ✅ Verify `VITE_API_URL` is set in Vercel: `https://droughts.onrender.com/api`
- ✅ Verify `CORS_ORIGIN` in Render includes your Vercel URL
- ✅ Check browser console (F12) for CORS errors
- ✅ Wait 2-3 minutes after updating CORS for redeploy to complete

### No data showing:
- ✅ Seed the database (Step 4)
- ✅ Trigger data ingestion (Step 5)
- ✅ Check MongoDB Atlas to verify data exists

### Backend not responding:
- ✅ Check Render logs for errors
- ✅ Verify MongoDB connection string is correct
- ✅ Check that all environment variables are set

---

## 📝 Quick Reference

**Backend Health Check:**
```
https://droughts.onrender.com/api/health
```

**Data Ingestion Status:**
```
https://droughts.onrender.com/api/data-ingestion/status
```

**Trigger Data Ingestion:**
```
https://droughts.onrender.com/api/data-ingestion/trigger
```

