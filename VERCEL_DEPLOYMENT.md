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

**⚠️ You need a PostgreSQL database. Here are free options:**

#### Option A: Supabase (Recommended) ⭐

1. **Sign up:** Go to https://supabase.com
2. **Create project:**
   - Click "New Project"
   - Choose organization (create one if needed)
   - Enter project name (e.g., "nidhi-db")
   - Enter database password (save this!)
   - Choose region closest to you
   - Click "Create new project"
3. **Wait for setup:** ~2 minutes for project to be ready
4. **Get connection string:**
   - Go to **Settings** → **Database**
   - Scroll to **Connection String** section
   - Click the **"Connection Pooling"** tab
   - Select **"Session"** mode
   - Copy the connection string (it will look like):
     ```
     postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
     ```
   - Replace `[YOUR-PASSWORD]` with your actual database password
   - Add `?pgbouncer=true&connection_limit=1` at the end

**Final connection string should look like:**
```
postgresql://postgres.xxxxxxxxxxxxx:yourpassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**Free Tier Limits:**
- 500MB database storage
- 2GB bandwidth/month
- Unlimited API requests

#### Option B: Neon (Alternative)

1. Go to https://neon.tech
2. Sign up and create a project
3. Copy the connection string from dashboard
4. Use it directly (no modifications needed)

**Free Tier Limits:**
- 0.5GB storage
- Auto-suspend after 7 days inactive

#### Option C: Railway (Alternative)

1. Go to https://railway.app
2. Sign up (free $5 credit)
3. Create PostgreSQL database
4. Copy connection string

**Free Tier:**
- $5 free credit/month
- Pay-as-you-go after

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

**⚠️ IMPORTANT: You must set these before deploying!**

Click **"Environment Variables"** and add the following:

#### Required Environment Variables:

**1. DATABASE_URL** (Required - Get from Supabase/Neon/Railway)
```env
DATABASE_URL=postgresql://user:password@host:port/database?pgbouncer=true&connection_limit=1
```

**How to get DATABASE_URL:**

**Option A: Supabase (Recommended - Free)**
1. Go to https://supabase.com and sign up
2. Create a new project (choose a name and password)
3. Wait for project to be ready (~2 minutes)
4. Go to **Settings** → **Database**
5. Under **Connection String**, select **"Connection Pooling"** tab
6. Copy the connection string (port 6543)
7. Replace `[YOUR-PASSWORD]` with your project password
8. Add `?pgbouncer=true&connection_limit=1` at the end

Example:
```
postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**Option B: Neon (Free Alternative)**
1. Go to https://neon.tech and sign up
2. Create a new project
3. Copy the connection string from the dashboard
4. Use it as-is

**2. JWT_SECRET** (Required - Generate a secure random string)
```env
JWT_SECRET=your_secure_secret_key_minimum_32_characters_long_use_random_string
```

**How to generate JWT_SECRET:**
- Use a random string generator (minimum 32 characters)
- Or run: `openssl rand -base64 32` in terminal
- Or use: https://randomkeygen.com/

**3. JWT_EXPIRES_IN** (Required)
```env
JWT_EXPIRES_IN=7d
```

**4. NODE_ENV** (Required)
```env
NODE_ENV=production
```

#### Optional Environment Variables (for email):

**Option 1: Resend (Easiest)**
```env
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=onboarding@resend.dev
```

**Option 2: SMTP (Gmail, etc.)**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

**⚠️ Important Notes:**
- Set environment variables **BEFORE** clicking Deploy
- After adding variables, click **"Save"**
- Variables are case-sensitive
- For DATABASE_URL, make sure to use the **connection pooler** URL (port 6543) for Supabase

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

**DATABASE_URL not found error:**
- ❌ **Error:** `Environment variable not found: DATABASE_URL`
- ✅ **Solution:** 
  1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
  2. Click **"Add New"** 
  3. Key: `DATABASE_URL`
  4. Value: Your PostgreSQL connection string (see Step 1.2 for instructions)
  5. Select **Production, Preview, Development** (or at least Production)
  6. Click **"Save"**
  7. **Important:** Redeploy your project after adding variables
     - Go to Deployments tab
     - Click the "..." menu on latest deployment
     - Click "Redeploy"
  8. Wait for redeploy to complete
- **Getting DATABASE_URL:** See Step 1.2 above for detailed instructions
- **For Supabase:** Use connection pooler URL (port 6543) with `?pgbouncer=true&connection_limit=1`
- **Format example:**
  ```
  postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
  ```

**API returns 500 error:**
1. Check Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment
3. Check **"Runtime Logs"** for errors
4. Verify `DATABASE_URL` is set and correct
5. Check Prisma client is generated (should be automatic)
6. Verify all required environment variables are set (DATABASE_URL, JWT_SECRET, etc.)

**Uploads directory error:**
- ✅ **Fixed:** The app now uses memory storage on Vercel
- Files are stored in memory temporarily (won't persist)
- For production file uploads, implement cloud storage:
  - Supabase Storage (recommended)
  - AWS S3
  - Cloudinary
  - See note below about file uploads

**Database connection errors:**
- For Supabase: Use connection pooler URL (port 6543)
- Add `?pgbouncer=true&connection_limit=1` to connection string
- Verify database is not paused

**Function timeout:**
- Vercel free tier: 10 seconds max
- Hobby tier: 30 seconds max (configured in vercel.json)
- Check if database queries are slow

### File Uploads on Vercel

⚠️ **Important:** File uploads currently work but files are stored in memory and won't persist after the function execution.

**For production file uploads, you need cloud storage:**

1. **Supabase Storage (Recommended):**
   - Free tier: 1GB storage, 2GB bandwidth/month
   - Easy integration with Supabase database
   - See: https://supabase.com/docs/guides/storage

2. **AWS S3:**
   - Free tier: 5GB storage, 20,000 GET requests/month
   - See: https://aws.amazon.com/s3/

3. **Cloudinary:**
   - Free tier: 25GB storage, 25GB bandwidth/month
   - Great for image optimization
   - See: https://cloudinary.com/

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

