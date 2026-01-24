# 🔐 Environment Variables for Render

Copy and paste these into Render dashboard → Environment Variables

## Required Variables

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://globalpoliticsnetwork_db_user:EwD9tOew9JeGmk1d@somdroughts.0pasla0.mongodb.net/drought_monitoring?retryWrites=true&w=majority
CORS_ORIGIN=https://droughts.vercel.app
NASA_BEARER_TOKEN=eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4iLCJzaWciOiJlZGxqd3RwdWJrZXlfb3BzIiwiYWxnIjoiUlMyNTYifQ.eyJ0eXBlIjoiVXNlciIsInVpZCI6ImFiYWFyYWhhIiwiZXhwIjoxNzczNjYyMTc5LCJpYXQiOjE3Njg0NzgxNzksImlzcyI6Imh0dHBzOi8vdXJzLmVhcnRoZGF0YS5uYXNhLmdvdiIsImlkZW50aXR5X3Byb3ZpZGVyIjoiZWRsX29wcyIsImFjciI6ImVkbCIsImFzc3VyYW5jZV9sZXZlbCI6M30.RHkqrTagMrZySN6Uq1p7Cc6qVbn0PdOYvy1j9MscrJquVK-UVrRWMpKZEg9g6JfYP0Q-0ns7eSFEWzHPSlQfYkXL9ya6KS3gbpE6gQ11hvaz600pvSD7Pz0bvH1gbR6uM4rdKpzbGYihplG3k-P4Dhbv6N2j_q8m4UECv9fNiD64Dv3apl79MZ4vHGey6WpnrYGyhvOARSwq4uA9Tl02uHS6AJgBGNjUETQfiQRb3Jz2mCGwJe3wHabsdp_q6kqH7W_fGfE-G426BIiD9nMnztmeoYKEKa752X9JkAyzvLYMa_fKNEpKB7foOjXLNoOOiV2-CowAR_2yvNxYOK_Yqw
```

## Important Notes

1. **MONGODB_URI** - Already formatted with your credentials and database name
2. **CORS_ORIGIN** - Set to `https://droughts.vercel.app` (your Vercel frontend URL)
3. **NASA_BEARER_TOKEN** - Your existing token is included

## Step-by-Step in Render

1. Go to your Render service
2. Click "Environment" tab
3. Click "Add Environment Variable" for each:
   - Key: `NODE_ENV`, Value: `production`
   - Key: `PORT`, Value: `10000`
   - Key: `MONGODB_URI`, Value: `mongodb+srv://globalpoliticsnetwork_db_user:EwD9tOew9JeGmk1d@somdroughts.0pasla0.mongodb.net/drought_monitoring?retryWrites=true&w=majority`
   - Key: `CORS_ORIGIN`, Value: `https://droughts.vercel.app`
   - Key: `NASA_BEARER_TOKEN`, Value: (paste your token)

4. Save and Render will auto-redeploy

