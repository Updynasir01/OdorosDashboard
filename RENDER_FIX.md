# 🔧 Fix Render Deployment Error

## The Problem

Render is looking for `package.json` in `/opt/render/project/src/` but it should be in `/opt/render/project/backend/`

## The Solution

### Step 1: Check Root Directory Setting

In your Render dashboard:

1. Go to your service settings
2. Scroll to **"Root Directory"** field
3. Make sure it says exactly: `backend`
   - NOT `src`
   - NOT `backend/src`
   - NOT empty
   - Just: `backend`

### Step 2: Verify Build Commands

**Build Command should be:**
```
npm install && npm run build
```

**Start Command should be:**
```
npm start
```

### Step 3: Alternative - Use render.yaml

If Root Directory keeps causing issues, you can use the `render.yaml` file approach:

1. In Render dashboard, go to **Settings**
2. Scroll to **"Render Configuration File"**
3. Set it to: `backend/render.yaml`
4. This will use the YAML config instead

### Step 4: Manual Fix - Edit Service

1. In Render dashboard, click **"Manual Deploy"** → **"Clear build cache & deploy"**
2. Or go to **Settings** → **"Root Directory"** → Change to `backend` → Save
3. This will trigger a new deployment

---

## ✅ Correct Configuration

**Root Directory:** `backend`  
**Build Command:** `npm install && npm run build`  
**Start Command:** `npm start`  
**Branch:** `master` (or `main` if that's your branch)

---

## 🆘 If Still Failing

1. **Delete and recreate the service:**
   - Delete current service
   - Create new Web Service
   - Set Root Directory to `backend` FIRST
   - Then set build/start commands

2. **Check your GitHub branch:**
   - Make sure you're deploying from the correct branch
   - Your code should be pushed to GitHub

3. **Verify package.json exists:**
   - Go to: `https://github.com/Updynasir01/Droughts/tree/master/backend`
   - Make sure `package.json` is visible there

