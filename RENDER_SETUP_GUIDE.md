# 🚀 Render Setup Guide - Step by Step

## Your GitHub Repository
**URL:** https://github.com/Updynasir01/Droughts  
**Branch:** `master`

---

## Step 1: Create New Web Service in Render

1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect account"** if not connected, or **"Connect GitHub"**
4. Authorize Render to access your GitHub
5. Select repository: **"Updynasir01/Droughts"**
6. Click **"Connect"**

---

## Step 2: Configure Service Settings

Fill in these **EXACT** values:

### Basic Settings

- **Name:** `somalia-drought-backend` (or your choice)
- **Environment:** `Node`
- **Region:** `Oregon (US West)` (or closest to your users)
- **Branch:** `master`

### Build & Deploy Settings

- **Root Directory:** `backend` ⚠️ **IMPORTANT: Must be exactly `backend`**
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

### Plan

- **Plan:** `Free` (or choose paid if needed)

---

## Step 3: Add Environment Variables

**DO NOT click "Create Web Service" yet!**

First, scroll down to **"Environment Variables"** section and click **"Add Environment Variable"** for each:

### Variable 1: NODE_ENV
- **Key:** `NODE_ENV`
- **Value:** `production`

### Variable 2: PORT
- **Key:** `PORT`
- **Value:** `10000`

### Variable 3: MONGODB_URI
- **Key:** `MONGODB_URI`
- **Value:** `mongodb+srv://globalpoliticsnetwork_db_user:EwD9tOew9JeGmk1d@somdroughts.0pasla0.mongodb.net/drought_monitoring?retryWrites=true&w=majority`

### Variable 4: CORS_ORIGIN
- **Key:** `CORS_ORIGIN`
- **Value:** `https://your-frontend.vercel.app` (we'll update this after frontend deploy)

### Variable 5: NASA_BEARER_TOKEN
- **Key:** `NASA_BEARER_TOKEN`
- **Value:** `eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4iLCJzaWciOiJlZGxqd3RwdWJrZXlfb3BzIiwiYWxnIjoiUlMyNTYifQ.eyJ0eXBlIjoiVXNlciIsInVpZCI6ImFiYWFyYWhhIiwiZXhwIjoxNzczNjYyMTc5LCJpYXQiOjE3Njg0NzgxNzksImlzcyI6Imh0dHBzOi8vdXJzLmVhcnRoZGF0YS5uYXNhLmdvdiIsImlkZW50aXR5X3Byb3ZpZGVyIjoiZWRsX29wcyIsImFjciI6ImVkbCIsImFzc3VyYW5jZV9sZXZlbCI6M30.RHkqrTagMrZySN6Uq1p7Cc6qVbn0PdOYvy1j9MscrJquVK-UVrRWMpKZEg9g6JfYP0Q-0ns7eSFEWzHPSlQfYkXL9ya6KS3gbpE6gQ11hvaz600pvSD7Pz0bvH1gbR6uM4rdKpzbGYihplG3k-P4Dhbv6N2j_q8m4UECv9fNiD64Dv3apl79MZ4vHGey6WpnrYGyhvOARSwq4uA9Tl02uHS6AJgBGNjUETQfiQRb3Jz2mCGwJe3wHabsdp_q6kqH7W_fGfE-G426BIiD9nMnztmeoYKEKa752X9JkAyzvLYMa_fKNEpKB7foOjXLNoOOiV2-CowAR_2yvNxYOK_Yqw`

---

## Step 4: Create and Deploy

1. Click **"Create Web Service"** at the bottom
2. Render will start building (this takes 5-10 minutes)
3. Watch the build logs - you should see:
   - ✅ Cloning repository
   - ✅ Installing dependencies
   - ✅ Building TypeScript
   - ✅ Starting service

---

## Step 5: Verify Deployment

Once deployment completes:

1. Copy your service URL (e.g., `https://somalia-drought-backend.onrender.com`)
2. Test it: Visit `https://your-service-url.onrender.com/api/health`
3. You should see: `{"status":"ok","message":"Somalia Drought Monitoring API"}`

---

## ✅ Checklist

Before clicking "Create Web Service", verify:

- [ ] Root Directory = `backend` (exactly, no quotes)
- [ ] Build Command = `npm install && npm run build`
- [ ] Start Command = `npm start`
- [ ] Branch = `master`
- [ ] All 5 environment variables added
- [ ] MONGODB_URI has correct database name (`drought_monitoring`)

---

## 🆘 If Build Fails

1. Check the build logs in Render
2. Look for TypeScript errors
3. Verify Root Directory is `backend` (not `src`, not empty)
4. Make sure all code is pushed to GitHub `master` branch

---

## 📝 After Successful Deployment

1. **Copy your backend URL** (you'll need it for Vercel)
2. **Test the health endpoint**
3. **Seed the database** (we'll do this next)
4. **Deploy frontend to Vercel** (next step)

---

**Ready? Follow these steps and let me know when the deployment completes!**

