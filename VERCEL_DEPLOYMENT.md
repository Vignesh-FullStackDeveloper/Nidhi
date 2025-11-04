# 🚀 Vercel Deployment Guide

Complete guide to deploy both API and UI on Vercel for free.

## 📋 Prerequisites

1. **GitHub Account** - Your code must be on GitHub
2. **Vercel Account** - Sign up at https://vercel.com (free)
3. **PostgreSQL Database** - Free options:
   - **Supabase** (recommended): https://supabase.com
   - **Neon**: https://neon.tech
   - **Railway**: https://railway.app

---

## Step 1: Prepare Your Code

### 1.1 Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 1.2 Get Database Connection String

**For Supabase (Recommended):**
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Under "Connection String", select **"Connection Pooling"**
5. Copy the connection string (port 6543)
6. Add `?pgbouncer=true&connection_limit=1` to the end

Example:
```
postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

---

## Step 2: Deploy Backend API

### 2.1 Create Backend Project in Vercel

1. Go to https://vercel.com
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Click **"Import"**

### 2.2 Configure Backend Project

**Project Settings:**
- **Project Name:** `nidhi-backend` (or your preferred name)
- **Framework Preset:** Other
- **Root Directory:** Click "Edit" and set to `packages/backend`
- **Build Command:** Leave empty (already in vercel.json)
- **Output Directory:** Leave empty (already in vercel.json)
- **Install Command:** `npm install`

### 2.3 Set Environment Variables

Click **"Environment Variables"** and add:

```env
DATABASE_URL=postgresql://user:password@host:port/database?pgbouncer=true&connection_limit=1
JWT_SECRET=your_secure_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

**Optional (for email):**
```env
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=onboarding@resend.dev
```

**Or use SMTP:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### 2.4 Deploy Backend

1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Your API will be available at: `https://your-backend-project.vercel.app`
4. Test health endpoint: `https://your-backend-project.vercel.app/health`

### 2.5 Get Backend URL

After deployment, copy your backend URL:
- **Production URL:** `https://your-backend-project.vercel.app`
- **API Base URL:** `https://your-backend-project.vercel.app/api`

---

## Step 3: Deploy Frontend UI

### 3.1 Create Frontend Project in Vercel

1. Go to https://vercel.com
2. Click **"Add New Project"** again
3. Import the **same** GitHub repository
4. Click **"Import"**

### 3.2 Configure Frontend Project

**Project Settings:**
- **Project Name:** `nidhi-web` (or your preferred name)
- **Framework Preset:** Vite (auto-detected)
- **Root Directory:** Click "Edit" and set to `packages/web`
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `dist` (auto-detected)
- **Install Command:** `npm install`

### 3.3 Set Environment Variables

Click **"Environment Variables"** and add:

```env
VITE_API_URL=https://your-backend-project.vercel.app/api
```

**Important:** Replace `your-backend-project` with your actual backend project name from Step 2.

### 3.4 Deploy Frontend

1. Click **"Deploy"**
2. Wait for build to complete (1-3 minutes)
3. Your UI will be available at: `https://your-web-project.vercel.app`

---

## Step 4: Test Your Deployment

### 4.1 Test Backend API

```bash
# Health check
curl https://your-backend-project.vercel.app/health

# Should return:
# {"status":"ok","timestamp":"..."}
```

### 4.2 Test Frontend UI

1. Open `https://your-web-project.vercel.app`
2. Try to register a new user
3. Check if API calls are working

### 4.3 Verify API Connection

Open browser console (F12) and check:
- No CORS errors
- API requests are going to correct URL
- Login/Register works

---

## 🔄 Automatic Deployments

**Vercel automatically deploys on every push to GitHub!**

- Push to `main` branch → Production deployment
- Push to other branches → Preview deployment
- Create Pull Request → Preview deployment

---

## 🔧 Troubleshooting

### Backend Issues

**API returns 500 error:**
1. Check Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment
3. Check **"Runtime Logs"** for errors
4. Verify `DATABASE_URL` is correct
5. Check Prisma client is generated (should be automatic)

**Database connection errors:**
- For Supabase: Use connection pooler URL (port 6543)
- Add `?pgbouncer=true&connection_limit=1` to connection string
- Verify database is not paused

**Function timeout:**
- Vercel free tier: 10 seconds max
- Hobby tier: 30 seconds max (configured in vercel.json)
- Check if database queries are slow

### Frontend Issues

**404 errors on routes:**
- Verify `vercel.json` exists in `packages/web`
- Check rewrite rules are correct
- All routes should redirect to `/index.html`

**API calls failing:**
- Check `VITE_API_URL` environment variable is set correctly
- Verify backend URL is correct (no trailing slash)
- Check browser console for CORS errors
- Backend should have CORS enabled (already configured)

**Build fails:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (18+)

### Environment Variables Not Working

- Environment variables are set per project
- Make sure you set them in the correct project (backend vs frontend)
- After adding/changing variables, redeploy the project
- Check variable names match exactly (case-sensitive)

---

## 📝 Environment Variables Summary

### Backend Environment Variables

```env
# Required
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
NODE_ENV=production

# Optional - Email
RESEND_API_KEY=re_...
EMAIL_FROM=onboarding@resend.dev
```

### Frontend Environment Variables

```env
# Required
VITE_API_URL=https://your-backend-project.vercel.app/api
```

---

## 🎯 Quick Reference

### Backend Project Settings
- **Root Directory:** `packages/backend`
- **Framework:** Other
- **Build Command:** (empty, in vercel.json)
- **Output Directory:** (empty, in vercel.json)

### Frontend Project Settings
- **Root Directory:** `packages/web`
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### URLs After Deployment

- **Backend API:** `https://your-backend-project.vercel.app/api`
- **Frontend UI:** `https://your-web-project.vercel.app`
- **Health Check:** `https://your-backend-project.vercel.app/health`

---

## 💡 Tips

1. **Use Custom Domains:** Vercel allows custom domains in free tier
2. **Preview Deployments:** Every branch gets a preview URL
3. **Environment Variables:** Set different values for Production/Preview if needed
4. **Monitoring:** Check Vercel dashboard for function invocations and errors
5. **Database:** Supabase free tier is generous (500MB, 2GB bandwidth/month)

---

## 🆘 Need Help?

1. **Check Vercel Logs:**
   - Dashboard → Project → Deployments → Click deployment → Runtime Logs

2. **Test Locally First:**
   - Ensure app works locally before deploying
   - Test with production-like environment variables

3. **Vercel Documentation:**
   - https://vercel.com/docs

4. **Common Issues:**
   - Database connection: Check connection string format
   - CORS errors: Backend already has CORS enabled
   - Build fails: Check Node version and dependencies

---

## ✅ Deployment Checklist

### Backend:
- [ ] Code pushed to GitHub
- [ ] Database created (Supabase/Neon/Railway)
- [ ] Vercel project created with root directory `packages/backend`
- [ ] Environment variables set (DATABASE_URL, JWT_SECRET, etc.)
- [ ] Deployed successfully
- [ ] Health endpoint works: `/health`

### Frontend:
- [ ] Code pushed to GitHub
- [ ] Vercel project created with root directory `packages/web`
- [ ] Environment variable `VITE_API_URL` set to backend URL
- [ ] Deployed successfully
- [ ] UI loads correctly
- [ ] API calls work (test login/register)

---

**🎉 You're all set! Your app is now live on Vercel!**

