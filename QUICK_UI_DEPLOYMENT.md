# 🚀 Quick UI Deployment to Vercel

Your backend API is already deployed at:
```
https://nidhi-backend-8ly5n3yib-vignesh-kumars-projects-04f1e33b.vercel.app
```

## Step 1: Deploy Frontend UI on Vercel

1. **Go to Vercel Dashboard:**
   - Open https://vercel.com
   - Make sure you're logged in

2. **Create New Project:**
   - Click **"Add New Project"** or **"New Project"**
   - Select your GitHub repository (same one as backend)
   - Click **"Import"**

3. **Configure Frontend Project:**
   - **Project Name:** `nidhi-web` (or your preferred name)
   - **Framework Preset:** `Vite` (should auto-detect)
   - **Root Directory:** Click **"Edit"** → Set to `packages/web`
   - **Build Command:** `npm run build` (should auto-fill)
   - **Output Directory:** `dist` (should auto-fill)
   - **Install Command:** `npm install`

4. **Set Environment Variable:**
   - Before clicking Deploy, click **"Environment Variables"**
   - Add this variable:
     ```
     Key: VITE_API_URL
     Value: https://nidhi-backend-8ly5n3yib-vignesh-kumars-projects-04f1e33b.vercel.app/api
     ```
   - Select **Production** (and Preview/Development if needed)
   - Click **"Save"**

5. **Deploy:**
   - Click **"Deploy"**
   - Wait 1-3 minutes for build to complete

6. **Get Your Frontend URL:**
   - After deployment, you'll get a URL like:
     ```
     https://nidhi-web.vercel.app
     ```

## Step 2: Test the Connection

1. **Open your frontend URL:**
   - Go to `https://your-frontend-project.vercel.app`

2. **Test Registration:**
   - Try to register a new user
   - Check browser console (F12) for any errors
   - Verify API calls are going to the correct backend URL

3. **Verify API Connection:**
   - Open browser DevTools (F12) → Network tab
   - Try to register/login
   - Check that requests go to: `https://nidhi-backend-8ly5n3yib-vignesh-kumars-projects-04f1e33b.vercel.app/api/...`

## ✅ Checklist

- [ ] Frontend project created in Vercel
- [ ] Root directory set to `packages/web`
- [ ] Environment variable `VITE_API_URL` set to backend URL
- [ ] Deployed successfully
- [ ] Frontend loads correctly
- [ ] API calls work (test login/register)

## 🔗 Your URLs

- **Backend API:** `https://nidhi-backend-8ly5n3yib-vignesh-kumars-projects-04f1e33b.vercel.app/api`
- **Frontend UI:** `https://your-frontend-project.vercel.app` (after deployment)

## 🆘 Troubleshooting

**404 errors on routes:**
- Verify `vercel.json` exists in `packages/web` (should already be there)
- Check that rewrite rules are correct

**API calls failing:**
- Verify `VITE_API_URL` environment variable is set correctly
- Check that backend URL doesn't have trailing slash
- Open browser console to see error messages

**CORS errors:**
- Backend already has CORS enabled
- If still seeing errors, check backend logs in Vercel

---

**Need the full guide?** See `VERCEL_DEPLOYMENT.md` for complete instructions.

