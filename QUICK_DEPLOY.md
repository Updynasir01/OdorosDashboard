# ⚡ Quick Deploy Guide

Fast deployment steps for MongoDB Atlas + Render + Vercel

---

## 🔐 Your MongoDB Atlas Credentials

**Username:** `globalpoliticsnetwork_db_user`  
**Password:** `EwD9tOew9JeGmk1d`  
**Cluster:** `somdroughts.0pasla0.mongodb.net`

**Connection String (for Render):**
```
mongodb+srv://globalpoliticsnetwork_db_user:EwD9tOew9JeGmk1d@somdroughts.0pasla0.mongodb.net/drought_monitoring?retryWrites=true&w=majority
```

---

## 🎯 3-Step Deployment

### Step 1: MongoDB Atlas (5 minutes)

1. Sign up: https://www.mongodb.com/cloud/atlas
2. Create free cluster → Choose region → Create
3. Database Access → Add user → Save username/password
4. Network Access → Allow `0.0.0.0/0`
5. Connect → Connect your app → Copy connection string
6. Format: `mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/drought_monitoring?retryWrites=true&w=majority`

### Step 2: Render Backend (10 minutes)

1. Sign up: https://render.com (GitHub login)
2. New + → Web Service → Connect repo
3. Settings:
   - **Root Directory:** `backend`
   - **Build:** `npm install && npm run build`
   - **Start:** `npm start`
4. Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_atlas_connection_string
   CORS_ORIGIN=https://your-frontend.vercel.app (update later)
   NASA_BEARER_TOKEN=your_token
   ```
5. Deploy → Copy URL

### Step 3: Vercel Frontend (5 minutes)

1. Sign up: https://vercel.com (GitHub login)
2. Add New Project → Import repo
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework:** Vite
4. Environment Variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```
5. Deploy → Copy URL
6. Go back to Render → Update `CORS_ORIGIN` → Redeploy

---

## ✅ Test It

- Backend: `https://your-backend.onrender.com/api/health`
- Frontend: `https://your-frontend.vercel.app`

---

## 🌱 Seed Database

```bash
curl -X POST https://your-backend.onrender.com/api/data-ingestion/ingest/all
```

---

**Done! 🎉 Your dashboard is live!**

