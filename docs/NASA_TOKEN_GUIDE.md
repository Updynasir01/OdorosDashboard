# NASA Earthdata Token Guide

## Should You Generate a Token?

### ✅ **Generate Token If:**
- You're deploying to production
- You want better security (no password in code)
- You want to avoid password expiration issues
- You're sharing code publicly (tokens can be rotated)

### ⚠️ **Skip Token If:**
- You're just testing/developing locally
- You want the simplest setup
- You don't mind using username/password

## How to Generate a Token

1. **Go to:** https://urs.earthdata.nasa.gov/users/YOUR_USERNAME/user_tokens
   (Replace YOUR_USERNAME with your actual username)

2. **Click:** "GENERATE TOKEN" button (green button)

3. **Copy the token** - You'll see something like:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Add to `backend/.env`:**
   ```env
   NASA_BEARER_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

5. **Important:** 
   - You can have up to 2 active tokens at a time
   - Tokens don't expire (but you can revoke them)
   - Keep tokens secret (don't commit to git!)

## Using Username/Password Instead

If you prefer not to generate a token, just use:

```env
NASA_USERNAME=your_username
NASA_PASSWORD=your_password
```

The code will automatically use whichever method you provide.

## Recommendation

**For now (development):** Use username/password - it's simpler
**Later (production):** Switch to bearer token - it's more secure

You can always generate a token later and switch!

