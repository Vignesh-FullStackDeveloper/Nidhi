# CORS Troubleshooting Guide

## Current Issue
OPTIONS preflight requests are not receiving CORS headers ("No 'Access-Control-Allow-Origin' header is present").

## Possible Causes

### 1. Vercel Deployment Protection
Vercel's Deployment Protection might be blocking OPTIONS requests before they reach the handler.

**Solution:**
- Go to Vercel Dashboard → Your Backend Project → Settings → Deployment Protection
- Check if Authentication/Password Protection is enabled
- If enabled, either:
  - Disable it temporarily for testing
  - OR add `/api/*` to the OPTIONS Allowlist

### 2. Vercel Headers Configuration
The `vercel.json` headers might not be applying to OPTIONS requests correctly.

**Solution:**
- Check Vercel Function Logs to see if OPTIONS requests are reaching the handler
- Look for `[CORS] OPTIONS request:` log message

### 3. Handler Not Being Called
The handler might not be invoked for OPTIONS requests.

**Solution:**
- Check Vercel Function Logs for any errors
- Verify the handler is exported correctly
- Test OPTIONS directly with curl

## Testing Steps

### 1. Test OPTIONS Request Directly
```bash
curl -X OPTIONS https://nidhi-backend-i7u67bjnk-vignesh-kumars-projects-04f1e33b.vercel.app/api/auth/login \
  -H "Origin: http://localhost:5173" \
  -v
```

Expected: Should return 200 with CORS headers

### 2. Check Vercel Function Logs
1. Go to Vercel Dashboard → Your Backend Project
2. Click on "Deployments" tab
3. Click on the latest deployment
4. Click on "Functions" tab
5. Click on "View Logs"
6. Look for `[CORS] OPTIONS request:` log message

If you see the log: Handler is being called, but headers might not be set correctly
If you don't see the log: Handler is NOT being called - Vercel routing issue

### 3. Check Vercel Settings
1. Go to Vercel Dashboard → Your Backend Project → Settings
2. Check "Deployment Protection" section
3. If enabled, add `/api/*` to OPTIONS Allowlist

## Current Code Status

The handler code is correctly set up to:
1. Check for OPTIONS method first
2. Return 200 with CORS headers immediately
3. Not call Express for OPTIONS requests

The issue is likely in Vercel configuration, not the code.

