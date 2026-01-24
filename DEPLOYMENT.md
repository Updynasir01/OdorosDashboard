# 🚀 Deployment Guide: Somalia Drought Monitoring Dashboard

Complete guide to deploy your dashboard to production using:
- **MongoDB Atlas** (Database)
- **Render** (Backend API)
- **Vercel** (Frontend)

---

## 📋 Prerequisites

1. GitHub account (to push your code)
2. MongoDB Atlas account (free tier available)
3. Render account (free tier available)
4. Vercel account (free tier available)
5. Your code pushed to a GitHub repository

---

## Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free" and sign up
3. Verify your email

### 1.2 Create a Cluster

1. Click "Build a Database"
2. Choose **FREE** (M0) tier
3. Select a cloud provider and region (choose closest to your users)
4. Name your cluster (e.g., "drought-monitoring")
5. Click "Create"

### 1.3 Configure Database Access

1. Go to **Database Access** (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password (SAVE THESE!)
5. Set privileges to "Atlas admin" (or "Read and write to any database")
6. Click "Add User"

### 1.4 Configure Network Access

1. Go to **Network Access** (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for Render/Vercel)
   - Or add specific IPs: `0.0.0.0/0`
4. Click "Confirm"

### 1.5 Get Connection String

1. Go to **Database** (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`
5. Replace `<password>` with your actual password
6. Add database name: `mongodb+srv://username:password@cluster.mongodb.net/drought_monitoring?retryWrites=true&w=majority`

**Save this connection string - you'll need it for Render!**

---

## Step 2: Deploy Backend to Render

### 2.1 Prepare Your Code

1. Make sure your code is pushed to GitHub
2. Ensure `backend/package.json` has a `build` script (already has it)

### 2.2 Create Render Web Service

1. Go to https://render.com
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Select your repository

### 2.3 Configure Render Service

**Settings:**
- **Name:** `somalia-drought-backend` (or your choice)
- **Environment:** `Node`
- **Region:** Choose closest to your users
- **Branch:** `main` (or your default branch)
- **Root Directory:** `backend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

### 2.4 Set Environment Variables in Render

Click "Environment" tab and add:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/drought_monitoring?retryWrites=true&w=majority
CORS_ORIGIN=https://your-frontend-url.vercel.app
NASA_BEARER_TOKEN=your_nasa_token_here
```

**Important:**
- Replace `MONGODB_URI` with your Atlas connection string
- Replace `CORS_ORIGIN` with your Vercel frontend URL (you'll update this after deploying frontend)
- Keep your NASA token

### 2.5 Deploy

1. Click "Create Web Service"
2. Render will build and deploy your backend
3. Wait for deployment to complete (5-10 minutes)
4. Copy your backend URL (e.g., `https://somalia-drought-backend.onrender.com`)

**Save this URL - you'll need it for Vercel!**

### 2.6 Test Your Backend

Visit: `https://your-backend-url.onrender.com/api/health`

You should see: `{"status":"ok","message":"Somalia Drought Monitoring API"}`

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Prepare Frontend

1. Make sure your code is pushed to GitHub
2. Frontend is ready (Vite builds automatically)

### 3.2 Create Vercel Project

1. Go to https://vercel.com
2. Sign up/Login with GitHub
3. Click "Add New..." → "Project"
4. Import your GitHub repository

### 3.3 Configure Vercel Project

**Settings:**
- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 3.4 Set Environment Variables in Vercel

Click "Environment Variables" and add:

```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

**Important:** Replace with your actual Render backend URL

### 3.5 Deploy

1. Click "Deploy"
2. Vercel will build and deploy (2-5 minutes)
3. Copy your frontend URL (e.g., `https://somalia-drought-dashboard.vercel.app`)

### 3.6 Update Backend CORS

Go back to Render and update the `CORS_ORIGIN` environment variable:

```
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

Then redeploy the backend (Render will auto-redeploy when env vars change)

---

## Step 4: Seed Your Database

### 4.1 Seed via Render Shell

1. Go to Render dashboard
2. Click on your backend service
3. Go to "Shell" tab
4. Run:
   ```bash
   npm run seed
   ```

### 4.2 Or Seed via API

Once backend is deployed, trigger data ingestion:

```bash
curl -X POST https://your-backend-url.onrender.com/api/data-ingestion/ingest/all
```

---

## Step 5: Verify Everything Works

### 5.1 Test Backend
- Health: `https://your-backend.onrender.com/api/health`
- Regions: `https://your-backend.onrender.com/api/regions`

### 5.2 Test Frontend
- Visit: `https://your-frontend.vercel.app`
- Check browser console for errors
- Verify data loads correctly

---

## 🔧 Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify MongoDB connection string is correct
- Ensure all environment variables are set

### CORS errors
- Update `CORS_ORIGIN` in Render to match your Vercel URL
- Include protocol (`https://`)
- No trailing slash

### Database connection fails
- Check MongoDB Atlas Network Access allows `0.0.0.0/0`
- Verify username/password in connection string
- Ensure database name is in connection string

### Frontend can't connect to backend
- Verify `VITE_API_URL` in Vercel matches your Render URL
- Check backend is running (visit health endpoint)
- Check browser console for specific errors

---

## 📝 Important Notes

1. **Free Tier Limits:**
   - Render: Services sleep after 15 min inactivity (first request may be slow)
   - Vercel: Generous free tier, no sleeping
   - MongoDB Atlas: 512MB storage free

2. **Environment Variables:**
   - Never commit `.env` files to GitHub
   - Always set in platform dashboards

3. **Custom Domains:**
   - Both Render and Vercel support custom domains
   - Configure in platform settings

4. **Auto-Deploy:**
   - Both platforms auto-deploy on git push
   - Render: Auto-deploy enabled by default
   - Vercel: Auto-deploy enabled by default

---

## 🎉 You're Live!

Your dashboard is now accessible worldwide at:
- **Frontend:** `https://your-frontend.vercel.app`
- **Backend:** `https://your-backend.onrender.com`

Share the frontend URL with your users!

