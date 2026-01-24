# 🚀 Deployment Checklist

Quick reference checklist for deploying to production.

## ✅ Pre-Deployment Checklist

- [ ] Code is pushed to GitHub
- [ ] All features tested locally
- [ ] `.env` files are NOT committed (check `.gitignore`)
- [ ] Backend builds successfully: `cd backend && npm run build`
- [ ] Frontend builds successfully: `cd frontend && npm run build`

---

## 📝 Step-by-Step Deployment

### 1. MongoDB Atlas Setup

- [ ] Create MongoDB Atlas account: https://www.mongodb.com/cloud/atlas
- [ ] Create free cluster (M0 tier)
- [ ] Create database user (save username/password!)
- [ ] Configure Network Access: Allow `0.0.0.0/0` (all IPs)
- [ ] Get connection string
- [ ] Format: `mongodb+srv://username:password@cluster.mongodb.net/drought_monitoring?retryWrites=true&w=majority`

### 2. Render Backend Deployment

- [ ] Sign up at https://render.com (use GitHub)
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Configure:
  - **Root Directory:** `backend`
  - **Build Command:** `npm install && npm run build`
  - **Start Command:** `npm start`
- [ ] Set Environment Variables:
  ```
  NODE_ENV=production
  PORT=10000
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/drought_monitoring?retryWrites=true&w=majority
  CORS_ORIGIN=https://your-frontend.vercel.app (update after frontend deploy)
  NASA_BEARER_TOKEN=your_token_here
  ```
- [ ] Deploy and wait for success
- [ ] Test: `https://your-backend.onrender.com/api/health`
- [ ] Copy backend URL

### 3. Vercel Frontend Deployment

- [ ] Sign up at https://vercel.com (use GitHub)
- [ ] Import GitHub repository
- [ ] Configure:
  - **Framework Preset:** Vite
  - **Root Directory:** `frontend`
  - **Build Command:** `npm run build`
  - **Output Directory:** `dist`
- [ ] Set Environment Variable:
  ```
  VITE_API_URL=https://your-backend.onrender.com/api
  ```
- [ ] Deploy and wait for success
- [ ] Copy frontend URL

### 4. Final Configuration

- [ ] Update Render `CORS_ORIGIN` with Vercel frontend URL
- [ ] Redeploy backend (auto-redeploys when env vars change)
- [ ] Test frontend: Visit Vercel URL
- [ ] Check browser console for errors

### 5. Seed Database

- [ ] Option A: Use Render Shell
  - Go to Render dashboard → Your service → Shell
  - Run: `npm run seed`
- [ ] Option B: Trigger via API
  ```bash
  curl -X POST https://your-backend.onrender.com/api/data-ingestion/ingest/all
  ```

### 6. Verify Deployment

- [ ] Backend health check works
- [ ] Frontend loads without errors
- [ ] Data displays correctly
- [ ] Map shows regions
- [ ] No CORS errors in console

---

## 🔗 Your Deployment URLs

**Backend:** `https://____________________.onrender.com`  
**Frontend:** `https://____________________.vercel.app`  
**MongoDB:** `mongodb+srv://...@cluster.mongodb.net/drought_monitoring`

---

## 🆘 Common Issues & Fixes

### Backend won't start
- Check Render logs
- Verify MongoDB connection string
- Ensure PORT is set to 10000

### CORS errors
- Update CORS_ORIGIN in Render
- Include `https://` protocol
- No trailing slash

### Frontend can't connect
- Verify VITE_API_URL in Vercel
- Check backend is running
- Look at browser console

### Database connection fails
- Check MongoDB Network Access allows all IPs
- Verify connection string format
- Check username/password

---

## 📚 Next Steps After Deployment

1. Set up custom domain (optional)
2. Configure auto-deploy on git push (already enabled)
3. Set up monitoring/alerts
4. Schedule regular data ingestion
5. Share your dashboard URL!

