# 🚀 Vercel Frontend Deployment Guide

## Your Backend URL
**Backend API:** `https://droughts.onrender.com/api`

---

## Step 1: Deploy to Vercel

1. Go to **https://vercel.com**
2. Sign in with **GitHub**
3. Click **"Add New..."** → **"Project"**
4. Import repository: **`Updynasir01/Droughts`**
5. Click **"Import"**

---

## Step 2: Configure Project

### Project Settings:
- **Framework Preset:** `Vite` (auto-detected)
- **Root Directory:** `frontend` ⚠️ **IMPORTANT**
- **Build Command:** `npm run build` (default)
- **Output Directory:** `dist` (default)
- **Install Command:** `npm install` (default)

---

## Step 3: Add Environment Variable

**DO NOT click "Deploy" yet!**

1. Scroll down to **"Environment Variables"**
2. Click **"Add"**
3. Add this variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://droughts.onrender.com/api`
4. Click **"Save"**

---

## Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Copy your **Vercel URL** (e.g., `https://your-app.vercel.app`)

---

## Step 5: Update Render CORS

After you get your Vercel URL:

1. Go to **Render Dashboard** → Your Service
2. Go to **"Environment"** tab
3. Find `CORS_ORIGIN` variable
4. Update value to: `https://your-app.vercel.app`
   - Replace `your-app.vercel.app` with your actual Vercel URL
5. Click **"Save Changes"**
6. Render will auto-redeploy (takes 2-3 minutes)

---

## ✅ Testing

1. **Backend Health Check:**
   - Visit: `https://droughts.onrender.com/api/health`
   - Should see: `{"status":"ok","message":"Somalia Drought Monitoring API"}`

2. **Frontend:**
   - Visit your Vercel URL
   - Dashboard should load and connect to backend

---

## 🎉 You're Done!

Your full-stack application is now live:
- **Backend:** `https://droughts.onrender.com`
- **Frontend:** `https://your-app.vercel.app`
- **Database:** MongoDB Atlas

---

## 🆘 Troubleshooting

### Frontend can't connect to backend:
- Check `VITE_API_URL` is set correctly in Vercel
- Verify `CORS_ORIGIN` in Render includes your Vercel URL
- Check browser console for CORS errors

### Build fails:
- Verify Root Directory is `frontend` (not `src`, not empty)
- Check that all code is pushed to GitHub `master` branch

